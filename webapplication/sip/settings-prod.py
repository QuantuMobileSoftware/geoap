from sip.settings import *

DEBUG = False

# AOI app, notebook_executor
NOTEBOOK_EXECUTOR_GPUS = "all"

ALLOWED_HOSTS.append("192.168.1.61")
ALLOWED_HOSTS.append("soilmate.xyz")

CSRF_TRUSTED_ORIGINS = ["soilmate.xyz"]

BASE_CONTAINER_NAME = "sip_code_webapplication_1"
