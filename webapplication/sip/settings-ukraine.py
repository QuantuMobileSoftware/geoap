from sip.settings import *

DEBUG = False

ALLOWED_HOSTS.append("soilmateukraine.quantumobile.co")

CSRF_TRUSTED_ORIGINS = ["soilmateukraine.quantumobile.co"]

# AOI app, notebook_executor
NOTEBOOK_EXECUTOR_GPUS = "1"
BASE_CONTAINER_NAME = "sip_code_webapplication_1"
HOST_VOLUME_DATA_BASENAME = "sip"
