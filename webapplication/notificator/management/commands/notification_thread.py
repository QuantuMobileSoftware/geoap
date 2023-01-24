import logging
from django.core import management

from aoi.management.commands._notebook import StoppableThread

logger = logging.getLogger(__name__)

class NotificationThread(StoppableThread):

    def do_stuff(self):
        self._send_notifications()

    def _send_notifications(self):
        logger.info("Starting notification thread")
        management.call_command("notify_results")
        management.call_command("send_emails")
