import logging
import sys
import time
from aoi.management.commands._notebook import State, NotebookThread, PublisherThread
from multiprocessing import Process
from django.core.management.base import BaseCommand
from django.conf import settings

logger = logging.getLogger(__name__)

THREAD_SLEEP = 10


class Command(BaseCommand):
    help = "Manage running of Jupyter Notebooks by client's request"

    def handle(self, *args, **options):
        exitcode = None
        while exitcode == 2 or exitcode is None:
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

        # main thread looks at the status of all threads
        try:
            while True:
                for thread in threads:
                    if thread.exception:
                        # an error in a thread - raise it in main thread too
                        logger.error(f"Thread: {thread} exited: {thread.exception}.Terminate all threads and restart")
                        raise thread.exception
                time.sleep(THREAD_SLEEP)
        except:
            logger.info(f"Stopping all threads...")
            for thread in threads:
                thread.stop()
            logger.info(f"All threads stopped. Restart command")
            sys.exit(2)

