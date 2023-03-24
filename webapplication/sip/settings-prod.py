from sip.settings import *

DEBUG = False

ALLOWED_HOSTS.append("portal.soilmate.ai")
SITE_ID = 2

CSRF_TRUSTED_ORIGINS = ["portal.soilmate.ai"]

DEFAULT_HTTP_PROTOCOL = "HTTPS"

# AOI app, notebook_executor
NOTEBOOK_EXECUTOR_GPUS = "1"
HOST_VOLUME_DATA_BASENAME = "sip"

MAX_TIMEOUT_FOR_TILE_CREATION_SECONDS = 60 * 60 * 1 * 60

# Email
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
DEFAULT_FROM_EMAIL = "noreply@portal.soilmate.ai"
EMAIL_HOST = "smtp"
EMAIL_PORT = 587

ACCOUNT_EMAIL_VERIFICATION = "optional"
ACCOUNT_EMAIL_REQUIRED = False
