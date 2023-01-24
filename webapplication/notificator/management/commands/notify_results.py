import logging

from django.template.loader import render_to_string
from django.core.management.base import BaseCommand
from django.contrib.gis.db import models
from publisher.models import Result
from notificator.models import Email, Notification
from notificator.utils import send_email_from_template_async

from publisher.management.commands.publish import instance_already_running

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Creates notification to inform user about available results'

    def handle(self, *args, **options):
        if instance_already_running('notify'):
            return
        self.create_notifications()
        
    def create_notifications(self):
        results = self._get_results_to_send_notification()
        for result in results:
            self._push_notification_email_to_quoue(result)

    def _get_results_to_send_notification(self) -> models.QuerySet:
        results = Result.objects.filter(released=True, request__notify_user=True, notification__isnull=True)
        logger.info(f"Was found {results.count()} results for user notification")
        return results
    
    def _push_notification_email_to_quoue(self, result:Result):
        logging.info(f"Notifing user {result.request.user.pk} about result {result.pk}")
        send_email_from_template_async(
            template="email_notification.html",
            recipient_email=result.request.user.email,
            subject="Result is awaiable",
            context={
                    "username":result.request.user.get_full_name(),
                    "component":result.request.component.name,
                    "startdate":result.request.date_from.strftime("%Y-%m-%d"),
                    "enddate":result.request.date_to.strftime("%Y-%m-%d")
                }
        )
        notification = Notification(pk = result.pk)
        notification.save()
