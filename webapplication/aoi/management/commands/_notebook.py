import logging
from abc import abstractmethod, ABC

from threading import Thread, Lock, Event
from aoi.models import JupyterNotebook, Request
from aoi.management.commands._Container import ContainerValidator, ContainerExecutor
from django.utils.timezone import localtime
from django.core import management

logger = logging.getLogger(__name__)

THREAD_SLEEP = 10


class State:
    def __init__(self):
        self.lock = Lock()
        self.validating_notebooks = set()
        self.executing_requests = set()
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

    def do_stuff(self):
        self.validate_notebook()
        self.execute_notebook()

    def validate_notebook(self):
        logger.info(f"Validating notebooks: {self.state.validating_notebooks}")

        with self.state.lock:
            # find any notebook that is not validated yet
            notebook = JupyterNotebook.objects.filter(is_validated=False) \
                .exclude(pk__in=self.state.validating_notebooks).first()
            if not notebook:
                return
            self.state.validating_notebooks.add(notebook.pk)

        validated = False
        try:
            with ContainerValidator(notebook) as cv:
                validated = cv.validate()
        except:
            logger.exception(f"{notebook.name}")
        finally:
            notebook.is_validated = validated
            try:
                notebook.save(update_fields=['is_validated'])
            except Exception as ex:
                logger.error(f"Cannot update notebook {notebook.name} in db: {str(ex)}")
            finally:
                with self.state.lock:
                    self.state.validating_notebooks.remove(notebook.pk)

    def execute_notebook(self):
        logger.info(f"Executing requests: {self.state.executing_requests}")

        with self.state.lock:
            # find any request that is not executed yet
            request = Request.objects.filter(started_at__isnull=True) \
                .exclude(pk__in=self.state.executing_requests).first()
            if not request:
                return

            self.state.executing_requests.add(request.pk)

        success = False
        try:
            request.started_at = localtime()
            request.save()

            with ContainerExecutor(request) as ce:
                success = ce.execute()
        except:
            logger.exception(f"Request {request.pk}, notebook {request.notebook.name}:")
        finally:
            if success:
                with self.state.lock:
                    self.state.success_requests.add(request.pk)
            else:
                request.finished_at = localtime()
                request.success = success
                try:
                    request.save(update_fields=['finished_at', 'success'])
                except Exception as ex:
                    logger.error(f"Cannot update request {request.pk} in db: {str(ex)}")
                finally:
                    with self.state.lock:
                        self.state.executing_requests.remove(request.pk)


class PublisherThread(StoppableThread):
    def __init__(self, state, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state = state

    def do_stuff(self):
        self.publish_results()

    def can_exit(self):
        with self.state.lock:
            return not self.state.success_requests and not self.state.executing_requests

    def publish_results(self):
        with self.state.lock:
            success_requests = set(self.state.success_requests)
        logger.info(f"Starting publish command")
        management.call_command("publish")
        logger.info(f"Marking requests {success_requests} as succeeded")
        with self.state.lock:
            for pk in success_requests:
                self.state.success_requests.remove(pk)
                self.state.executing_requests.remove(pk)
        Request.objects.filter(pk__in=success_requests).update(finished_at=localtime(),
                                                               success=True)
