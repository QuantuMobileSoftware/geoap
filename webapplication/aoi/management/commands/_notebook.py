import docker
import logging

from abc import abstractmethod, ABC
from threading import Thread, Lock, Event
from aoi.models import JupyterNotebook, Request
from aoi.management.commands._Container import ContainerValidator, ContainerExecutor
from django.utils.timezone import localtime
from django.core import management
from dateutil import parser as timestamp_parser

logger = logging.getLogger(__name__)

THREAD_SLEEP = 10


class State:
    def __init__(self):
        self.lock = Lock()
        # self.validating_notebooks = set()
        # self.executing_requests = set()
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
        self.validate_notebook()
        self.execute_notebook()

    def validate_notebook(self):
        running_containers = self.filter_containers("running", "webapplication=validator")
        logger.info(f"Running validator containers: {[container.name for container in running_containers]}")

        exited_containers = self.filter_containers("exited", "webapplication=validator")
        logger.info(f"Exited validator containers: {[container.name for container in exited_containers]}")

        # find any notebook that is not validated yet
        notebook = JupyterNotebook.objects.filter(is_validated=False).first()
        if not notebook:
            return

        notebook.validated = True
        try:
            notebook.save(update_fields=['is_validated'])
        except Exception as ex:
            logger.error(f"Cannot update notebook {notebook.name} in db: {str(ex)}")

    def execute_notebook(self):
        running_containers = self.filter_containers("running", "webapplication=executor")
        logger.info(f"Running executor containers: {[container.name for container in running_containers]}")

        exited_containers = self.filter_containers("exited", "webapplication=executor")
        logger.info(f"Exited executor containers: {[container.name for container in exited_containers]}")

        for container in exited_containers:
            attrs = self.container_attrs(container)
            if attrs['exit_code'] == 0:
                logger.info(f"Container {container.name} finished successfully")
                with self.state.lock:
                    self.state.success_requests.add(attrs['pk'])
            else:
                Request.objects.filter(pk=attrs['pk']).update(finished_at=localtime(),
                                                              success=False)
                logger.error(f"Container: {container.name}: exit code: {attrs['exit_code']},"
                             f"logs: {attrs['logs']}")
                try:
                    container.remove()
                except:
                    logger.exception(f"Removing container {container.name}")

        # find any request that is not executed yet
        request = Request.objects.filter(started_at__isnull=True).first()
        if not request:
            return
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

    def container_attrs(self, container):
        attrs = container.attrs
        return dict(
            finished_at=timestamp_parser.parse(attrs["State"]["FinishedAt"]),
            exit_code=attrs["State"]["ExitCode"],
            logs=container.logs().decode('utf-8') if container.logs() else None,
            pk=container.labels['pk'], )

    def filter_containers(self, status, label):
        containers = self.docker_client.containers.list(filters=dict(status=status,
                                                                     label=label))
        return containers


class PublisherThread(StoppableThread):
    def __init__(self, state, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state = state
        self.docker_client = docker.from_env()

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
                try:
                    container = self.docker_client.containers.list(filters=dict(status="exited",
                                                                                label=f"pk={pk}")).pop()
                    logger.info(f"Removing container: {container.name}")
                    container.remove()
                except:
                    logger.exception(f"Error removing container {pk}:")
        Request.objects.filter(pk__in=success_requests).update(finished_at=localtime(),
                                                               success=True)
