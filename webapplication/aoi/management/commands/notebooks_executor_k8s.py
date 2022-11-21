import logging
from multiprocessing import Process
from aoi.management.commands._notebook import (
    NotebookK8sThread
)

from multiprocessing import Process
from django.core.management.base import BaseCommand


logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Manage running and validating of Jupyter Notebooks in k8s cluster command"

    def handle(self, *args, **options):
        exitcode = None
        while exitcode == 2 or exitcode is None:
            child_process = Process(target=self.run, daemon=True)
            child_process.start()
            child_process.join()
            exitcode = child_process.exitcode
    
    def run(self):
        thread = NotebookK8sThread(daemon=True)
        thread.start()
        thread.join()