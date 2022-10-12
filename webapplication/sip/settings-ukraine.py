from sip.settings import *

DEBUG = False

ALLOWED_HOSTS.append("soilmateukraine.quantumobile.co")
ALLOWED_HOSTS.append("demo.soilmate.ai")

CSRF_TRUSTED_ORIGINS = ["soilmateukraine.quantumobile.co", "demo.soilmate.ai"]

# AOI app, notebook_executor
NOTEBOOK_EXECUTOR_GPUS = "1"
BASE_CONTAINER_NAME = "sip_webapplication_1"
HOST_VOLUME_DATA_BASENAME = "sip"

MAX_TIMEOUT_FOR_TILE_CREATION_SECONDS = 60 * 60 * 1 * 60