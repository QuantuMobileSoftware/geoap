import time
import logging

from threading import Thread, Lock
from aoi.models import JupyterNotebook, Request
from aoi.management.commands._Container import ContainerValidator, ContainerExecutor
from django.utils.timezone import localtime

logger = logging.getLogger(__name__)


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
            time.sleep(10)

    def validate_notebook(self):
        logger.info(f"Now validating notebooks: {self.state.validating_notebooks}")

        # find any notebook that is not validated yet
        with self.state.lock:
            try:
                notebook = JupyterNotebook.objects.filter(is_validated=False) \
                    .exclude(pk__in=self.state.validating_notebooks)[0]

                self.state.validating_notebooks.add(notebook.pk)
            except IndexError as ex:
                logger.error(f"No notebooks for validation: {str(ex)}")
                return

        with ContainerValidator(notebook) as cv:
            # host_port = "8889"
            validated = cv.validate()

        notebook.is_validated = validated
        notebook.save()

        with self.state.lock:
            if validated:
                self.state.validating_notebooks.remove(notebook.pk)

    def execute_notebook(self):
        logger.info(f"Now executing requests: {self.state.executing_requests}")

        with self.state.lock:
            # find any notebook that is not executed yet
            try:
                request = Request.objects.filter(started_at__isnull=True) \
                    .exclude(pk__in=self.state.executing_requests)[0]
                notebook = request.notebook
                self.state.executing_requests.add(request.pk)
            except IndexError as ex:
                logger.error(f"No requests for execution: {str(ex)}")
                return

        with ContainerExecutor(notebook) as ce:
            # host_port = "8889"
            request.started_at = localtime()
            ce.execute()
            request.finished_at = localtime()
            request.save()


        with self.state.lock:
            self.state.executing_requests.remove(request.pk)
