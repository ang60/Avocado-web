from pathlib import Path
import os
import dj_database_url
from datetime import timedelta
import json
import firebase_admin
from firebase_admin import credentials

from dotenv import load_dotenv
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG", "0").lower() in ["true", "t", "1"]

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'django_filters',
    'rest_framework',
    'drf_spectacular',
    'accounts',
    'api.apps.ApiConfig',
    'pest_scouting',
    'case_management',
    'knowledge_base',
    'kephis_quarantine',
    'hcda_registry',
    'advisory_services',
    'alerts',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'avo_guard.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'avo_guard.wsgi.application'

# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
if not DEBUG:
    database_url = os.environ.get('DATABASE_URL')
else:
    database_url = os.environ.get('DATABASE_URL_LOCAL')

DATABASES = {
    "default": dj_database_url.parse(
        database_url,
        engine='django.db.backends.postgresql_psycopg2',
        # default=DATABASE_URL,
        conn_max_age=600,
        conn_health_checks=True,
    ),
}

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

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
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Africa/Nairobi'
USE_I18N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/
STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, "assets", "staticfiles")

STATICFILES_DIRS = (
    os.path.join(BASE_DIR, "assets"),
)

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, "assets", "mediafiles")

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Firebase Cloud Messaging initialization
FIREBASE_CREDENTIALS_JSON = os.environ.get('FIREBASE_CREDENTIALS_JSON')
if FIREBASE_CREDENTIALS_JSON:
    try:
        cred_dict = json.loads(FIREBASE_CREDENTIALS_JSON)
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Error initializing Firebase: {e}")

AUTH_USER_MODEL = 'accounts.User'

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'avo_guard.pagination.StandardResultsSetPagination',
    'PAGE_SIZE': 10
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# Advanta SMS Settings
ADVANTA_API_KEY = os.environ.get('ADVANTA_API_KEY')
ADVANTA_PARTNER_ID = os.environ.get('ADVANTA_PARTNER_ID')
ADVANTA_SHORT_CODE = os.environ.get('ADVANTA_SHORT_CODE')

# OTP Configuration
# Options: 'SMS', 'EMAIL', 'BOTH'
OTP_DELIVERY_METHOD = os.environ.get('OTP_DELIVERY_METHOD', 'SMS')

# Email Settings
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'AvoGuard <noreply@avoguard.cognitron.co.ke>')


SPECTACULAR_SETTINGS = {
    'TITLE': 'AvoGuard API',
    'DESCRIPTION': 'API for AvoGuard',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'ENUM_NAME_OVERRIDES': {
        'AnyDiseasesObservedEnum': 'pest_scouting.models.WeeklyRecord.YES_NO_CHOICES',
        'DiseasePlantPartEnum': 'pest_scouting.models.WeeklyRecord.PLANT_PART_CHOICES',
        'DiseaseCropStageEnum': 'pest_scouting.models.WeeklyRecord.CROP_STAGE_CHOICES',
        'DiseaseDetectionMethodEnum': 'pest_scouting.models.WeeklyRecord.DETECTION_METHOD_CHOICES',
    },
}

# CSRF_TRUSTED_ORIGINS = os.environ.get('CSRF_TRUSTED_ORIGINS', 'http://localhost:5173').split(',')

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'https://avoguard.cognitron.co.ke',
    'http://localhost:3000',  # Common for local React/Vue development
    'https://avo-guard.vercel.app',
    'https://avo-guard-frontend.vercel.app/',
]

CORS_ALLOWED_ORIGINS = CSRF_TRUSTED_ORIGINS
ADMIN_SITE_HEADER = 'AvoGuard Backend'
ADMIN_SITE_TITLE = 'AvoGuard Backend'
ADMIN_INDEX_TITLE = 'Dashboard'

import django.contrib.admin
django.contrib.admin.AdminSite.site_header = ADMIN_SITE_HEADER
django.contrib.admin.AdminSite.site_title = ADMIN_SITE_TITLE
django.contrib.admin.AdminSite.index_title = ADMIN_INDEX_TITLE

# Media: use Railway/S3 when credentials exist (same DB as production uploads).
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_ENDPOINT_URL = os.environ.get('AWS_S3_ENDPOINT_URL')
AWS_S3_ACCESS_KEY_ID = os.environ.get('AWS_S3_ACCESS_KEY_ID')
AWS_S3_SECRET_ACCESS_KEY = os.environ.get('AWS_S3_SECRET_ACCESS_KEY')
AWS_S3_FILE_OVERWRITE = False
AWS_QUERYSTRING_AUTH = True
AWS_DEFAULT_ACL = 'public-read'
AWS_SESSION_TOKEN = None
AWS_S3_SIGNATURE_VERSION = 's3v4'

USE_S3_STORAGE = bool(AWS_STORAGE_BUCKET_NAME and AWS_S3_ACCESS_KEY_ID and AWS_S3_SECRET_ACCESS_KEY)

if USE_S3_STORAGE:
    STORAGES = {
        'default': {
            'BACKEND': 'avo_guard.storages.MediaStorage',
        },
        'staticfiles': {
            'BACKEND': 'avo_guard.storages.StaticStorage',
        },
    }
else:
    STORAGES = {
        'default': {
            'BACKEND': 'django.core.files.storage.FileSystemStorage',
        },
        'staticfiles': {
            'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage',
        },
    }

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://avo-guard.vercel.app',
    'https://avoguard.cognitron.co.ke',
    'https://avo-guard-frontend.vercel.app',
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

CORS_ALLOW_HEADERS = [
    'access-control-allow-origin',
    'access-control-allow-headers',
    'content-type',
    'authorization',
    'x-auth-token',
]
