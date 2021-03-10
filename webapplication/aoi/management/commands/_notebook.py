import docker
import logging

from abc import abstractmethod, ABC
from threading import Thread, Lock, Event
from aoi.models import JupyterNotebook, Request
from aoi.management.commands._Container import (Container,
                                                ContainerValidator,
                                                ContainerExecutor, )
from django.utils.timezone import localtime
from django.core import management
from django.conf import settings

logger = logging.getLogger(__name__)

THREAD_SLEEP = 10


class State:
    def __init__(self):
        self.lock = Lock()
        self.success_requests = set()


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


class NotebookThread(StoppableThread):
    def __init__(self, state, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state = state
        self.docker_client = docker.from_env()

    def do_stuff(self):
        with self.state.lock:
            self.validate_notebook()
        with self.state.lock:
            self.execute_notebook()

    def _get_running_containers(self):
        containers = Container.filter(self.docker_client, "running", "webapplication")
        logger.info(f"Running {len(containers)} containers: {[container.name for container in containers]}")
        return containers

    def validate_notebook(self):
        exited_containers = Container.filter(self.docker_client, "exited", "webapplication=validator")
        logger.info(f"Exited validator containers: {[container.name for container in exited_containers]}")

        for container in exited_containers:
            attrs = Container.container_attrs(container)
            if attrs['exit_code'] == 0:
                logger.info(f"Container {container.name} validated successfully")
                JupyterNotebook.objects.filter(pk=attrs['pk']).update(is_validated=True)
            else:
                logger.error(f"Validation container: {container.name}: exit code: {attrs['exit_code']},"
                             f"logs: {attrs['logs']}")
            try:
                container.remove()
            except:
                logger.exception(f"Removing container {container.name}")

        running_containers = self._get_running_containers()

        # find notebooks that is not validated yet
        max_items = settings.NOTEBOOK_EXECUTOR_MAX_NOTEBOOKS_IN_PROGRESS - len(running_containers)
        if max_items < 0:
            return

        not_validated = JupyterNotebook.objects.filter(is_validated=False)[:max_items]
        for notebook in not_validated:
            try:
                ce = ContainerValidator(notebook)
                ce.validate()
            except:
                logger.exception(f"Notebook {notebook.name}:")

    def execute_notebook(self):
        exited_containers = Container.filter(self.docker_client, "exited", "webapplication=executor")
        logger.info(f"Exited executor containers: {[container.name for container in exited_containers]}")

        for container in exited_containers:
            attrs = Container.container_attrs(container)
            if attrs['exit_code'] == 0:
                logger.info(f"Container {container.name} executed successfully")
                self.state.success_requests.add(attrs['pk'])
            else:
                Request.objects.filter(pk=attrs['pk']).update(finished_at=localtime(), success=False)
                logger.error(f"Execution container: {container.name}: exit code: {attrs['exit_code']},"
                             f"logs: {attrs['logs']}")
            try:
                container.remove()
            except:
                logger.exception(f"Removing container {container.name}")

        running_containers = self._get_running_containers()

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
                logger.exception(f"Request {request.pk}, notebook {request.notebook.name}:")
                try:
                    request.finished_at = localtime()
                    request.save(update_fields=['finished_at'])
                except Exception as ex:
                    logger.error(f"Cannot update request {request.pk} in db: {str(ex)}")


class PublisherThread(StoppableThread):
    def __init__(self, state, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state = state

    def do_stuff(self):
        self.publish_results()

    def can_exit(self):
        with self.state.lock:
            return not self.state.success_requests

    def publish_results(self):
        with self.state.lock:
            success_requests = set(self.state.success_requests)
        logger.info(f"Starting publish command")
        management.call_command("publish")
        logger.info(f"Marking requests {success_requests} as succeeded")
        with self.state.lock:
            for pk in success_requests:
                self.state.success_requests.remove(pk)
        Request.objects.filter(pk__in=success_requests).update(finished_at=localtime(), success=True)
