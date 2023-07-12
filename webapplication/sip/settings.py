"""
Django settings for sip project.

Generated by 'django-admin startproject' using Django 2.2.12.

For more information on this file, see
https://docs.djangoproject.com/en/2.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.2/ref/settings/
"""

import os

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'bnc-3!@tium@48wg*d(bdqqczssab=ykl2$30-%*%w9g3&945*'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0', 'webapplication', 'webserver']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.gis',

    # Third-Party Apps
    'django_filters',
    'rest_framework',
    'rest_framework.authtoken',
    'allauth',
    'allauth.account',
    'dj_rest_auth.registration',
    'flat_json_widget',
    'drf_yasg',
    'rangefilter',

    # Local Apps
    'user',
    'publisher',
    'aoi'
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'user.authentication.TokenAuthenticationWithQueryString',
    ],
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
    'COERCE_DECIMAL_TO_STRING': False,
}

REST_AUTH = {
    'USER_DETAILS_SERIALIZER': 'user.serializers.UserSerializer',
    'PASSWORD_RESET_SERIALIZER': 'user.serializers.PasswordResetSerializer',
    'PASSWORD_RESET_USE_SITES_DOMAIN': True
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'sip.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'sip.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': os.getenv('POSTGRES_DB', ''),
        'USER': os.getenv('POSTGRES_USER', ''),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', ''),
        'HOST': os.getenv('POSTGRES_HOST', 'db'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    },
}


# Password validation
# https://docs.djangoproject.com/en/2.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = False

USE_TZ = True

DATE_FORMAT = "Y-m-d"
DATETIME_FORMAT = "Y-m-d H:i:s"

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')
MEDIA_ROOT = "/media"
COMPONENT_DESCRIPTION_PICTURE_MEDIA_PATH = "description_picture"
MEDIA_URL = "media/"

# Session
SESSION_COOKIE_AGE = 28800  # 8 hours, in seconds

# Account
AUTH_USER_MODEL = 'user.User'
ACCOUNT_ADAPTER = 'user.adapters.AccountAdapter'
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_LOGOUT_ON_GET = True

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# Publisher app
TILES_FOLDER = "/data/tiles"
RESULTS_FOLDER = "/data/results"
SATELLITE_IMAGES_FOLDER = "/data/satellite_imagery"
STORE_SATELLITE_IMAGES_DAYS = 90
MIN_GEOJSON_SIZE_TO_CREATE_MVT_BYTES = 1024 * 500
MAX_TIMEOUT_FOR_TILE_CREATION_SECONDS = 60 * 60 * 1
MAX_TIMEOUT_FOR_FOLDER_CLEANING = 60 * 3


# AOI app, notebook_executor
NOTEBOOK_EXECUTOR_MAX_NOTEBOOKS_IN_PROGRESS = 2
NOTEBOOK_EXECUTOR_THREADS_RESTART_TIMEOUT = 60 * 30
COMPONENT_EXECUTOR_GPUS = None
CELL_EXECUTION_TIMEOUT = 60 * 60 * 24
NOTEBOOK_EXECUTION_TIMEOUT = 60 * 60 * 36

PERSISTENT_STORAGE_PATH = '/data'
SENTINEL2_GOOGLE_API_KEY = '.secret/google-api-key.json'
SENTINEL1_AWS_CREDS =  '.secret/sentinel1_aws_creds.json'
SCIHUB_CREDS = '.secret/scihub_creds.json'
GEOAP_CREDS = '.secret/geoap_creds.json'
ZOOM_LEVEL_MIN = 10
ZOOM_LEVEL_MAX = 17

AREA_IS_OVER_LIMITED_CODE = 603

NOTEBOOK_EXECUTION_ENVIRONMENT = os.getenv("NOTEBOOK_EXECUTION_ENVIRONMENT", "docker")
NOTEBOOK_JOB_BACKOFF_LIMIT = int(os.getenv("NOTEBOOK_JOB_BACKOFF_LIMIT", 1))
NOTEBOOK_VALIDATION_JOB_ACTIVE_DEADLINE = int(os.getenv('NOTEBOOK_VALIDATION_JOB_ACTIVE_DEADLINE', 3000)) # 5 minutes
K8S_NAME_SPACE = os.getenv('K8S_NAME_SPACE','sip')
IMAGE_PULL_SECRETS = os.getenv('IMAGE_PULL_SECRETS', 'regcred')
NOTEBOOK_EXECUTOR_MAX_JOBS = int(os.getenv('NOTEBOOK_EXECUTOR_MAX_JOBS', 2))
NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH = os.getenv('NOTEBOOK_POD_DATA_VOLUME_MOUNT_PATH', '/home/jovyan/work')
GPU_CORES_PER_NOTEBOOK = int(os.getenv('GPU_CORES_PER_NOTEBOOK', 1))

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
DEFAULT_FROM_EMAIL = 'noreply@geoap.quantumobile.com'
EMAIL_SUBJECT = 'Geoap Notification'

TRIAL_PERIOD_IN_DAYS = 30
TRIAL_PERIOD_BALANCE = 100
TRIAL_PERIOD_START_COMMENT = 'Started trial period'
TRIAL_PERIOD_FINISH_COMMENT = 'Finished trial period'

SITE_ID = 1

DEFAULT_SYSTEM_NOTIFICATION_EMAIL = ""
DEFAULT_REMOTE_SERVER = "http://10.8.0.8:8080"

