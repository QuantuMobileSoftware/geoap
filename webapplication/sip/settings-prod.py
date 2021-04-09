from sip.settings import *

DEBUG = False

ALLOWED_HOSTS.append("192.168.1.61")
ALLOWED_HOSTS.append("soilmate.xyz")
ALLOWED_HOSTS.append("soilmate.ai")

CSRF_TRUSTED_ORIGINS = ["soilmate.xyz", "soilmate.ai"]

# AOI app, notebook_executor
NOTEBOOK_EXECUTOR_GPUS = "1"
BASE_CONTAINER_NAME = "sip_code_webapplication_1"
HOST_VOLUME_DATA_BASENAME = "sip"
