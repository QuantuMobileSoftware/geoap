import docker
import logging
import re

from abc import abstractmethod, ABC
from threading import Thread, Lock, Event

from django.db import transaction
from django.apps import apps

from aoi.models import Component, Request, AoI

from user.models import User

from aoi.management.commands._Container import (Container,
                                                ContainerValidator,
                                                ContainerExecutor, )
from aoi.management.commands._k8s_notebook_handler import K8sNotebookHandler

from django.utils.timezone import localtime
from django.core import management
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.postgres.fields import ArrayField
from django.apps import apps


logger = logging.getLogger(__name__)

THREAD_SLEEP = 10


def email_notification(request, status):
    if apps.is_installed("geoap_email_notifications"):
        from geoap_email_notifications.utils import email_notification
        email_notification(request, status)


def clean_container_logs(logs):
    # Remove line numbers
    # like from this "00m [38;5;167;01mValueError[39;00m([38;5;124m"[39m[38;5;124mImages not loaded for given AOI."
    log_lines = logs.split('\n')
    log_lines = [re.sub(r'^\s*\d+\s*', '', line) for line in log_lines]

    log_text = ''.join(log_lines)
    # Remove ANSI escape sequences
    # from: '\x1b[0;31mValueError\x1b[0m Traceback (most recent call last)', 'Cell \x1b[0;32mIn[26],
    # to: 'ValueError Traceback (most recent call last)', 'Cell In[26],
    log_text = re.sub(r'\x1b\[[0-9;]*m', '', log_text)
    # Replace multiple spaces
    log_text = re.sub(r'\s+', ' ', log_text)
    return log_text


class StoppableThread(ABC, Thread):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.stop_requested = Event()
        self.exception = None

    def stop(self):
        # set the event to signal stop
        self.stop_requested.set()

    def run(self):
        try:
            while True:
                self.do_stuff()
                if self.stop_requested.wait(THREAD_SLEEP) and self.can_exit():
                    break
        except Exception as ex:
            logger.error(f"Got exception for thread {self}: {str(ex)}")
            self.exception = ex

        logger.info(f"Thread {self} finished task")

    def can_exit(self):
        return True

    @abstractmethod
    def do_stuff(self):
        pass


class NotebookDockerThread(StoppableThread):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.lock = Lock()
        self.docker_client = docker.from_env()

    def do_stuff(self):
        with self.lock:
            self.execute_notebook()

    def get_running_containers(self):
        containers = Container.filter(self.docker_client, "running", "webapplication")
        logger.info(f"Running {len(containers)} containers: {[container.name for container in containers]}")
        return containers

    def validate_notebook(self):
        exited_containers = Container.filter(self.docker_client, "exited", "webapplication=validator")
        logger.info(f"Exited validator containers: {[container.name for container in exited_containers]}")

        for container in exited_containers:
            attrs = Container.container_attrs(container)
            notebook = Component.objects.get(pk=attrs['pk'])
            if attrs['exit_code'] == 0:
                logger.info(f"Notebook {notebook.name} in container {container.name} validated successfully")
                notebook.success = True
                notebook.save(update_fields=['success'])
            else:
                logger.error(f"Validation container: {container.name}: exit code: {attrs['exit_code']},"
                             f"logs: {attrs['logs']}")
            try:
                container.remove()
            except:
                logger.exception(f"Removing container {container.name}")

        running_containers = self.get_running_containers()

        # find notebooks that is not validated yet
        max_items = settings.NOTEBOOK_EXECUTOR_MAX_NOTEBOOKS_IN_PROGRESS - len(running_containers)
        if max_items < 0:
            return

        not_validated = Component.objects.filter(run_validation=False)[:max_items]
        for notebook in not_validated:
            try:
                notebook.run_validation = True
                notebook.save(update_fields=['run_validation'])
                ce = ContainerValidator(notebook)
                ce.validate()
            except:
                logger.exception(f"Notebook {notebook.name}:")

    def execute_notebook(self):
        exited_containers = Container.filter(self.docker_client, "exited", "webapplication=executor")
        logger.info(f"Exited executor containers: {[container.name for container in exited_containers]}")

        for container in exited_containers:
            attrs = Container.container_attrs(container)
            request = Request.objects.get(pk=attrs['pk'])
            if attrs['exit_code'] == 0:
                logger.info(f"Notebook in container {container.name} executed successfully")
                request.calculated = True
                request.save(update_fields=['calculated'])
            else:
                request.finished_at = localtime()
                request.save(update_fields=['finished_at'])
                logger.error(f"Execution container: {container.name}: exit code: {attrs['exit_code']},"
                             f"logs: {attrs['logs']}")
                collected_error = clean_container_logs(attrs['logs'])
                error_max_length = request._meta.get_field('error').max_length
                if len(collected_error) > error_max_length:
                    request.error = collected_error[len(collected_error) - error_max_length:]
                else:
                    request.error = collected_error
                request.save(update_fields=['error'])
                
                if apps.is_installed("user_management"):
                    from user_management.utils import user_readable_error, failed_request_transaction
                    user_readable_error(request)
                    failed_request_transaction(request)
                
                email_notification(request, "failed")
            try:
                container.remove()
            except:
                logger.exception(f"Removing container {container.name}")

        running_containers = self.get_running_containers()

        # find requests that is not executed yet
        max_items = settings.NOTEBOOK_EXECUTOR_MAX_NOTEBOOKS_IN_PROGRESS - len(running_containers)
        if max_items < 0:
            return

        not_executed = Request.objects.filter(started_at__isnull=True)[:max_items]
        for request in not_executed:
            try:
                request.started_at = localtime()
                request.save(update_fields=['started_at'])

                ce = ContainerExecutor(request)
                ce.execute()
            except:
                logger.exception(f"Request {request.pk}, notebook {request.component.name}:")
                try:
                    with transaction.atomic():
                        request.finished_at = localtime()
                        request.save(update_fields=['finished_at'])

                        if apps.is_installed("user_management"):
                            from user_management.utils import failed_request_transaction
                            failed_request_transaction(request)
                        
                        email_notification(request, "failed")
                except Exception as ex:
                    logger.error(f"Cannot update request {request.pk} in db: {str(ex)}")


class PublisherThread(StoppableThread):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def do_stuff(self):
        self.publish_results()

    def can_exit(self):
        return not Request.objects.filter(calculated=True, success=False).first()

    @staticmethod
    def publish_results():
        logger.info(f"Starting publish command")
        management.call_command("publish")
        success_requests = Request.objects.filter(calculated=True, success=False)
        logger.info(f"Marking requests {[sr.pk for sr in success_requests]} as succeeded")
        for sr in success_requests:

            if apps.is_installed("user_management"):
                from user_management.utils import success_complete_transaction
                success_complete_transaction(sr)
            
            email_notification(sr, "succeeded")
        success_requests.update(finished_at=localtime(), success=True)


class NotebookK8sThread(StoppableThread):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.notebook_handler = K8sNotebookHandler(settings.K8S_NAME_SPACE)

    def do_stuff(self):
        # Execution
        self.notebook_handler.start_notebook_execution()
        self.notebook_handler.start_component_execution_jobs_supervision()
