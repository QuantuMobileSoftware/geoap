import time
import logging
from django.utils.timezone import localtime
from threading import Thread, Lock
from aoi.models import JupyterNotebook, Request
import random

logger = logging.getLogger(__name__)


class State:
    def __init__(self):
        self.lock = Lock()
        self.validating_notebooks = set()
        self.executing_notebooks = set()


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
            time.sleep(5)

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

        # TODO: add validation logic
        logger.info(f"Start validation for notebook: {notebook.pk}: {notebook.name}")
        int_ = random.randint(1, 10)
        logger.info(f"Thread {self.ident} sleeping {int_} seconds")
        time.sleep(int_)
        logger.info(f"Validating notebooks after SLEEP: {self.state.validating_notebooks}")

        validated = True
        notebook.is_validated = validated
        notebook.save()
        logger.info(f"Saving notebook to db: {self.ident} {notebook.name} {notebook.is_validated}")
        logger.info(f"Finished validation for notebook: {notebook.pk}: {notebook.name}")

        with self.state.lock:
            if validated:
                self.state.validating_notebooks.remove(notebook.pk)

    def execute_notebook(self):
        logger.info(f"Now executing notebooks: {self.state.executing_notebooks}")

        with self.state.lock:
            # find any notebook that is not executed yet
            try:
                notebook = Request.objects.filter(started_at__isnull=True) \
                    .exclude(pk__in=self.state.executing_notebooks)[0]

                self.state.executing_notebooks.add(notebook.pk)
            except IndexError as ex:
                logger.error(f"No notebooks for execution: {str(ex)}")
                return

        # TODO: add execution logic
        logger.info(f"Start execution for notebook: {notebook.pk}")
        start = localtime()
        logger.info(f"Started execution at: {start} thread {self.ident}")
        time.sleep(2)
        end = localtime()
        logger.info(f"Finished execution at: {end} thread {self.ident}")

        notebook.started_at = start
        notebook.finished_at = end
        notebook.save()
        logger.info(f"Finished execution for notebook: {notebook.pk}")

        with self.state.lock:
            self.state.executing_notebooks.remove(notebook.pk)
