import docker
import logging

from abc import abstractmethod, ABC
from threading import Thread, Lock, Event
from aoi.models import Component, Request
from aoi.management.commands._Container import (Container,
                                                ContainerValidator,
                                                ContainerExecutor, )
from aoi.management.commands._k8s_notebook_handler import K8sNotebookHandler

from django.utils.timezone import localtime
from django.core import management
from django.conf import settings

logger = logging.getLogger(__name__)

THREAD_SLEEP = 10


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
            self.validate_notebook()
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
                request.finished_at=localtime()
                request.save(update_fields=['finished_at'])
                logger.error(f"Execution container: {container.name}: exit code: {attrs['exit_code']},"
                             f"logs: {attrs['logs']}")
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
                    request.finished_at = localtime()
                    request.save(update_fields=['finished_at'])
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
        calculated_requests = Request.objects.filter(calculated=True, success=False)
        for request in calculated_requests:
            management.call_command(f"publish", request.pk)
            logger.info(f"Marking request {request.pk} as succeeded")
            request.success=True
            request.finished_at=localtime()
            request.save()


class NotebookK8sThread(StoppableThread):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.notebook_handler = K8sNotebookHandler(settings.K8S_NAME_SPACE)

    def do_stuff(self):
        # Validation
        self.notebook_handler.start_notebook_validation()
        self.notebook_handler.start_notebook_validation_jobs_supervision()
        # Execution
        self.notebook_handler.start_notebook_execution()
        self.notebook_handler.start_notebook_execution_jobs_supervision()
    