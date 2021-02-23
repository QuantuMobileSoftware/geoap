import logging
import sys
from aoi.management.commands._notebook import State, NotebookThread, PublisherThread
from multiprocessing import Process
from django.core.management.base import BaseCommand
from django.conf import settings

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Manage running of Jupyter Notebooks by client's request"

    def handle(self, *args, **options):
        exitcode = None
        while exitcode == 1 or exitcode is None:
            child_process = Process(target=self.run, daemon=True)
            child_process.start()
            child_process.join()
            exitcode = child_process.exitcode

    def run(self):
        state = State()

        threads = [NotebookThread(state, daemon=True) for _ in range(settings.NOTEBOOK_EXECUTOR_THREADS)]
        threads.append(PublisherThread(state, daemon=True))

        logger.info(f"Created {len(threads) - 1} executor threads and 1 publish thread")

        for thread in threads:
            thread.start()

        while True:
            for thread in threads:
                thread.join(settings.NOTEBOOK_EXECUTOR_TIMEOUT)
                if not thread.is_alive():
                    logger.error('One of threads exited - terminate and restart')
                    sys.exit(1)
