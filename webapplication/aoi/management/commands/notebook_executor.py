import logging
import sys
import time
from aoi.management.commands._notebook import State, NotebookThread, PublisherThread
from multiprocessing import Process
from django.core.management.base import BaseCommand
from django.conf import settings

logger = logging.getLogger(__name__)

THREAD_SLEEP = 10
THREADS_RESTART_DURATION = 8 # 60 * 30

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
        state = State()

        threads = [NotebookThread(state) for _ in range(settings.NOTEBOOK_EXECUTOR_THREADS)]
        threads.append(PublisherThread(state))

        logger.info(f"Created {len(threads) - 1} executor threads and 1 publish thread")

        # starting threads
        started_at = time.time()

        for thread in threads:
            thread.start()

        # main thread looks at the status of all threads
        try:
            while True:
                for thread in threads:
                    if thread.exception:
                        # an error in a thread - raise it in main thread too
                        logger.error(f"Thread: {thread} exited: {thread.exception}. Terminate all threads and restart")
                        raise thread.exception
                working_time = time.time() - started_at
                print("WORKING TIME")
                print(working_time)
                if working_time >= THREADS_RESTART_DURATION:
                    print("WORKING TIME MORE THAN DURATION")
                    raise RuntimeError(f"Threads are working more than duration {THREADS_RESTART_DURATION}")
                time.sleep(THREAD_SLEEP)
        except:
            logger.info(f"Stopping all threads...")
            for thread in threads:
                thread.stop()

            while threads:
                logger.info(f"Left threads: {threads}")
                print(f"SECESS REWQUESTS: {state.success_requests}")
                for thread in threads:
                    if not thread.is_alive():
                        logger.info(f"For thread {thread} task is finished. Removing it")
                        threads.remove(thread)
                time.sleep(10)

        logger.info(f"All threads are stopped. Restart notebook_executor command")
        sys.exit(2)

