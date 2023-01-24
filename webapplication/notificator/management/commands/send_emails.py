import logging

from django.template.loader import render_to_string
from django.core.management.base import BaseCommand
from django.contrib.gis.db import models
from publisher.models import Result
from notificator.models import Notification, Email
from django.core.mail import send_mail

from publisher.management.commands.publish import instance_already_running

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Send all emails from the quoue'

    def handle(self, *args, **options):
        if instance_already_running('send_emails'):
            return
        self.send_emails()
    
    def send_emails(self):
        emails_to_send = Email.objects.all()
        logging.info(f"Found {emails_to_send.count()} emails to send. Start sending...")
        for email in emails_to_send:
            send_mail(
                subject=email.subject,
                message=render_to_string(
                    email.template,
                    email.context
                ),
                recipient_list=[email.recipient_email],
                from_email=None
            )
            email.delete()
        logger.info("All emails have been sent succesfuly")
        
    