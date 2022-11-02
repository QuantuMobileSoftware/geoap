import logging
from multiprocessing import Process
import time
from aoi.management.commands._notebook import (
    PublisherThread
)

from multiprocessing import Process
from django.core.management.base import BaseCommand

from aoi.management.commands.notebook_executor import thread_watch

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Manage running publisher in k8s cluster command"

    def handle(self, *args, **options):
        exitcode = None
        while exitcode == 2 or exitcode is None:
            child_process = Process(target=self.run, daemon=True)
            child_process.start()
            child_process.join()
            exitcode = child_process.exitcode
    
    def run(self):
        thread = PublisherThread(daemon=True)
        thread.start()
        