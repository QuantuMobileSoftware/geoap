import logging
import sys
import time


from multiprocessing import Process
from threading import Thread, Lock
from aoi.models import JupyterNotebook
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class NotebookThread(Thread):
    def __init__(self, state, *args, **kwargs):
        super(NotebookThread, self).__init__(*args, **kwargs)
        self.state = state

    def run(self):
        while True:
            try:
                self.validate_notebook()

            except Exception as e:
                logger.exception(e)
            time.sleep(10)

    def validate_notebook(self):
        with self.state.lock:
            servers = JupyterNotebook.objects.filter(is_validated=False)

            server = None
            for x in servers:
                if x.id not in self.state.servers_in_progress:
                    self.state.servers_in_progress.add(x.id)
                    server = x
                    break
            if server is None:
                return


        with self.state.lock:
            self.state.servers_in_progress.remove(server.id)


class State:
    def __init__(self):
        self.lock = Lock()
        self.servers_in_progress = set()
        self.vms_in_progress = set()


THREADS = 2


class Command(BaseCommand):
    help = "Manage running of Jupyter Notebooks by client's request"

    def handle(self, *args, **options):
        exitcode = None
        while exitcode == 1 or exitcode is None:
            child_process = Process(target=self.run)
            child_process.daemon = True
            child_process.start()
            child_process.join()
            exitcode = child_process.exitcode

    def run(self):
        state = State()
        threads = []
        for i in range(THREADS):
            threads.append(NotebookThread(state))
        for thread in threads:
            thread.daemon = True
            thread.start()
        while True:
            for thread in threads:
                thread.join(timeout=100)
                if not thread.is_alive():
                    logger.error('One of threads exited - terminate and restart')
                    sys.exit(1)