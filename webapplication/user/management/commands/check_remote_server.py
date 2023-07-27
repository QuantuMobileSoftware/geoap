from django.core.management.base import BaseCommand
from django.conf import settings
from waffle.models import Switch
import os
import json
import urllib3
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Checks the availability of the remote server and updates the feature flag.'

    def handle(self, *args, **options):
        remote_server_available_switch = Switch.get('remote_server_available')
        if remote_server_available_switch:
            timeout = urllib3.Timeout(total=5, connect=1.0, read=1.0)
            http = urllib3.PoolManager(timeout=timeout)
            try:
                with open(os.path.join(settings.PERSISTENT_STORAGE_PATH, settings.GEOAP_CREDS), "r") as f:
                    geoap_creds_data = json.load(f)
                response = http.request("GET", geoap_creds_data["API_ENDPOINT"] + "api/request")
                if response.status >= 500:
                    raise Exception(f"Remote server returned status code {response.status}")

            except urllib3.exceptions.MaxRetryError:
                remote_server_available_switch.active = False
                remote_server_available_switch.save()
                logger.info("Remote server is unavailable. Error: MaxRetryError")
            except Exception as e:
                remote_server_available_switch.active = False
                remote_server_available_switch.save()
                logger.info(f"Remote server is unavailable. Error: {str(e)}")
            else:
                remote_server_available_switch.active = True
                remote_server_available_switch.save()
                logger.info("Remote server is available.")
        else:
            logger.warning("Remote server feature flag is not active.")
