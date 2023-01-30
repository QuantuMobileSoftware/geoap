import logging
from multiprocessing import Process
from notificator.management.commands.notification_thread import NotificationThread

from multiprocessing import Process
from django.core.management.base import BaseCommand


logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Manage running notificator in k8s cluster command"

    def handle(self, *args, **options):
        exitcode = None
        while exitcode == 2 or exitcode is None:
            child_process = Process(target=self.run, daemon=True)
            child_process.start()
            child_process.join()
            exitcode = child_process.exitcode
    
    def run(self):
        thread = NotificationThread(daemon=True)
        thread.start()
        thread.join()