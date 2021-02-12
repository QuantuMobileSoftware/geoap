from sip.settings import *

DEBUG = False

ALLOWED_HOSTS.append("192.168.1.61")
ALLOWED_HOSTS.append("soilmate.xyz")

CSRF_TRUSTED_ORIGINS = ["soilmate.xyz"]

# AOI app, notebook_executor
NOTEBOOK_EXECUTOR_GPUS = "all"
BASE_CONTAINER_NAME = "sip_code_webapplication_1"
HOST_VOLUME_DATA_BASENAME = "sip"
