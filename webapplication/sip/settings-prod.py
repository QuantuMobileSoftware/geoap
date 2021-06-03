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

KUBERNETES_ENV = True
K8S_NAME_SPACE = 'sip-prod'
IMAGE_PULL_SECRETS = 'regcred'
VALIDATE_NOTEBOOK_BACKOFF_LIMIT = 1
VALIDATE_NOTEBOOK_ACTIVE_DEADLINE_SECONDS = 60 * 5
EXECUTE_NOTEBOOK_BACKOFF_LIMIT = 1
EXECUTE_NOTEBOOK_ACTIVE_DEADLINE_SECONDS = 60 * 15
NOTEBOOK_EXECUTION_PATH = '/home/jovyan/code/src/notebook.ipynb'
