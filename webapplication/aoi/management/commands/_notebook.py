import time
import logging
from django.utils.timezone import localtime
from threading import Thread, Lock
from aoi.models import JupyterNotebook
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
                # self.execute_notebook()

            except Exception as e:
                logger.exception(e)
            print("Sleeping")
            time.sleep(5)

    def validate_notebook(self):
        print(f"Thread entered! {self.ident}")


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
        print(f"Got from DB {notebook.pk}!")
        print(f"Thread from validating! {self.ident}")

        # TODO: add validation logic
        logger.info(f"Start validation for notebook: {notebook.pk}: {notebook.name}")
        int_ = random.randint(1, 10)
        print(f"Thread {self.ident} sleeping {int_} seconds")
        time.sleep(int_)
        validated = True

        logger.info(f"Validating notebooks after SLEEP: {self.state.validating_notebooks}")

        notebook.is_validated = validated
        notebook.save()
        logger.info(f"SAVING NOTEBOOK: {self.ident} {notebook.name} {notebook.is_validated}")
        logger.info(f"Finished validation for notebook: {notebook.pk}: {notebook.name}")

        with self.state.lock:
            if validated:
                self.state.validating_notebooks.remove(notebook.pk)

        print(f"Thread from validating 1! {self.ident}")

    def execute_notebook(self):

        with self.state.lock:
            logger.info(f"Now executing notebooks: {self.state.executing_notebooks}")

            # find any notebook that is not executed yet
            try:
                # TODO: add Request table
                pass
                # notebook = Request.objects.filter(started_at__is_null=True)\
                #    .exclude(pk__in=self.state.executing_notebooks)[0]

                # self.state.state.executing_notebooks.add(notebook.pk)

            except IndexError as ex:
                logger.error(f"No notebooks for execution: {str(ex)}")
                return

        # TODO: add execution logic
        # logger.info(f"Start execution for notebook: {notebook.pk}: {notebook.name}")
        start = localtime()
        logger.info(f"Started execution at: {start} thread {self.ident}")
        time.sleep(2)
        end = localtime()
        logger.info(f"Finished execution at: {end} thread {self.ident}")

        with self.state.lock:
            # TODO: update db values
            pass
            # notebook.started_at = start
            # notebook.finished_at = end
            # notebook.save()
            # logger.info(f"Finished execution for notebook: {notebook.pk}: {notebook.name}")

            # self.state.validating_notebooks.remove(notebook.pk)
