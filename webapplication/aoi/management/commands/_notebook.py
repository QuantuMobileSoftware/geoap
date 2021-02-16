import time
import logging

from threading import Thread, Lock
from aoi.models import JupyterNotebook, Request
from aoi.management.commands._Container import ContainerValidator, ContainerExecutor
from django.utils.timezone import localtime

logger = logging.getLogger(__name__)

THREAD_SLEEP = 10


class State:
    def __init__(self):
        self.lock = Lock()
        self.validating_notebooks = set()
        self.executing_requests = set()


class NotebookThread(Thread):
    def __init__(self, state, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.state = state

    def run(self):
        while True:
            try:
                self.validate_notebook()
                self.execute_notebook()
            except Exception as e:
                logger.exception(e)
            time.sleep(THREAD_SLEEP)

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
        except Exception as ex:
            logger.error(f"{notebook.name}: {str(ex)}")
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

        except Exception as ex:
            logger.error(f"Request {request.pk}, notebook {request.notebook.name}: {str(ex)}")
        finally:
            request.finished_at = localtime()
            request.success = success
            try:
                request.save(update_fields=['finished_at', 'success'])
            except Exception as ex:
                logger.error(f"Cannot update request {request.pk} in db: {str(ex)}")
            finally:
                with self.state.lock:
                    self.state.executing_requests.remove(request.pk)

