import logging
import traceback

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


class NotebookThread(Thread):
    def __init__(self, state, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.stop_requested = Event()
        self.exception = None
        self.state = state

    def run(self):
        try:
            # sleep for THREAD_SLEEP seconds, or until stop is requested, stop if stop is requested
            while True:
                self.validate_notebook()
                self.execute_notebook()
                if self.stop_requested.wait(THREAD_SLEEP):
                    break
        except Exception as ex:
            self.exception = ex

        logger.info(f"NotebookThread {self} finished task")

    def stop(self):
        # set the event to signal stop
        self.stop_requested.set()

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
            logger.error(f"{notebook.name}: {traceback.print_exc()}")
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
            logger.error(f"Request {request.pk}, notebook {request.notebook.name}: {traceback.print_exc()}")
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


class PublisherThread(Thread):
    def __init__(self, state, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.stop_requested = Event()
        self.exception = None
        self.state = state

    def run(self):
        try:
            # sleep for THREAD_SLEEP second, or until stop is requested, stop if stop is requested
            while True:
                self.publish_results()
                print(f"PUBLISHER SUCESS REQUESTS: {self.state.success_requests}")
                if self.stop_requested.wait(THREAD_SLEEP) and not self.state.success_requests:
                    break
        except Exception as ex:
            self.exception = ex

        logger.info(f"PublisherThread {self} finished task")

    def stop(self):
        # set the event to signal stop
        self.stop_requested.set()

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
