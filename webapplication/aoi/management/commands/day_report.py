import os, logging
from django.conf import settings
from django.core.management.base import BaseCommand
from django.db import connection
from collections import Counter
from datetime import datetime, timedelta
from collections import defaultdict

from aoi.models import Request
from django.utils import timezone
from aoi.management.commands._notebook import  send_email_notification



logger = logging.getLogger(__name__)



class Command(BaseCommand):
    help = "Send week report"

    def handle(self, *args, **options):
        logger.info("starting week report")

        customer_requests = Request.objects.filter(started_at__gte=timezone.now() - timedelta(hours=24))

        info = {
            "total_requests": len(customer_requests),
            "successful_requests": len(customer_requests.filter(success=True)),
            "unsuccessful_requests": len(customer_requests.filter(success=False)),
            "requests_by_customer": defaultdict(lambda: {
                "successful_requests": [],
                "unsuccessful_requests": []
            })
        }

        for request in customer_requests:
            customer_key = request.user.username

            request_data = {
                "id": request.id,
                "component": request.component.name,
                "aoi_name": request.aoi.name if request.aoi else "",
                "date": request.started_at.strftime("%Y-%m-%d")
            }

            if request.success:
                info["requests_by_customer"][customer_key]["successful_requests"].append(request_data)
            else:
                request_data["error"] = request.error if request.error else "Unknown error"
                info["requests_by_customer"][customer_key]["unsuccessful_requests"].append(request_data)

        info["requests_by_customer"] = dict(info["requests_by_customer"])

        summary_lines = [
            f"Total Requests: {info['total_requests']}",
            f"Successful Requests: {info['successful_requests']}",
            f"Unsuccessful Requests: {info['unsuccessful_requests']}",
        ]
        if info['requests_by_customer']:
            summary_lines.append(f"\n• Requests by Customer:")

        for customer, data in info['requests_by_customer'].items():
            summary_lines.append(f"\n• Customer: {customer}")
            summary_lines.append(f"  ✅ Success: {len(data['successful_requests'])}")

            for req in data['successful_requests']:
                summary_lines.append(
                    f"    - ID: {req['id']}, Component: {req['component']}, Date: {req['date']}"
                )

            summary_lines.append(f"  ❌ Failed: {len(data['unsuccessful_requests'])}")

            for req in data['unsuccessful_requests']:
                summary_lines.append(
                    f"    - ID: {req['id']}, Component: {req['component']}, Date: {req['date']}"
                )
                summary_lines.append(
                    f"      Error: {'...' if len(req['error']) > 300 else ''}{req['error'][-300:]}"
                )

        message = "\n".join(summary_lines)

        send_email_notification(
            settings.DEFAULT_SYSTEM_NOTIFICATION_EMAIL,
            message,
            f"Week report"
        )






        logger.info("finished week report")
