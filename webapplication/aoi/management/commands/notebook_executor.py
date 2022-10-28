import logging
import sys
import time
from aoi.management.commands._notebook import NotebookThread, PublisherThread
from multiprocessing import Process
from django.core.management.base import BaseCommand
from django.conf import settings

logger = logging.getLogger(__name__)

THREAD_SLEEP = 10
NOTEBOOK_EXECUTOR_THREADS = 1


class Command(BaseCommand):
    help = "Manage running of Jupyter Notebooks and Publisher command"

    def handle(self, *args, **options):
        exitcode = None
        while exitcode == 2 or exitcode is None:
            child_process = Process(target=self.run, daemon=True)
            child_process.start()
            child_process.join()
            exitcode = child_process.exitcode

    def run(self):
        
        threads = []
        if settings.NOTEBOOK_EXECUTION_ENVIRONMENT == 'docker':
            threads = [NotebookThread(daemon=True) for _ in range(NOTEBOOK_EXECUTOR_THREADS)]       
        threads.append(PublisherThread(daemon=True))

        logger.info(f"Created {len(threads) - 1} executor threads and 1 publish thread")

        # starting threads
        started_at = time.time()

        for thread in threads:
            thread.start()

        # main thread looks at the status of all threads
        try:
            while True:
                for thread in threads:
                    if thread.exception or not thread.is_alive():
                        # an error in a thread - raise it in main thread too
                        logger.error(f"Thread: {thread} exited: {thread.exception}. Terminate all threads and restart")
                        raise thread.exception
                working_time = time.time() - started_at
                if working_time >= settings.NOTEBOOK_EXECUTOR_THREADS_RESTART_TIMEOUT:
                    raise RuntimeError(f"Timeout {settings.NOTEBOOK_EXECUTOR_THREADS_RESTART_TIMEOUT} for threads was achieved")
                time.sleep(THREAD_SLEEP)
        except Exception as ex:
            logger.error(f"Main thread got exception: {str(ex)}. Stopping all threads...")

            for thread in threads:
                thread.stop()

            while threads:
                logger.info(f"Left threads: {threads}")
                for thread in threads:
                    if not thread.is_alive():
                        logger.info(f"For thread {thread} task is finished. Removing it")
                        threads.remove(thread)
                time.sleep(THREAD_SLEEP)

        logger.info(f"All threads are stopped. Restart notebook_executor command")
        sys.exit(2)

