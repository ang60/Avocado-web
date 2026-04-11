from pathlib import Path
import os
import dj_database_url
from datetime import timedelta

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

# OTP testing/integration controls.
# - OTP_SKIP_SMS=1: don't call SMS provider; OTP is still stored for verify.
# - OTP_ECHO_CODE=1: return the OTP code in JSON responses (dev/testing only).
OTP_SKIP_SMS = os.environ.get('OTP_SKIP_SMS', '0') == '1'
OTP_ECHO_CODE = os.environ.get('OTP_ECHO_CODE', '0') == '1'

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'drf_spectacular',
    'accounts',
    'api',
    'pest_scouting',
    'case_management',
    'knowledge_base',
    'kephis_quarantine',
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
def _clean_database_url(value):
    """
    Accept common .env mishaps like surrounding quotes or a literal "b'...'" prefix.
    Returns a clean string (or empty string if unset).
    """
    if value is None:
        return ""
    if isinstance(value, (bytes, bytearray)):
        value = value.decode("utf-8", errors="ignore")
    value = str(value).strip()
    value = value.strip('"').strip("'").strip()
    # Handle accidental literal representation: b'postgres://...'
    if (value.startswith("b'") and value.endswith("'")) or (value.startswith('b"') and value.endswith('"')):
        value = value[2:-1].strip()
    return value

if DEBUG:
    database_url = _clean_database_url(os.environ.get("DATABASE_URL_LOCAL"))
    if not database_url:
        database_url = _clean_database_url(os.environ.get("DATABASE_URL"))
else:
    database_url = _clean_database_url(os.environ.get("DATABASE_URL"))
    if not database_url:
        database_url = _clean_database_url(os.environ.get("DATABASE_URL_LOCAL"))

if not database_url:
    raise RuntimeError(
        "Database URL is not configured. Set DATABASE_URL (prod) or DATABASE_URL_LOCAL (dev) in your environment."
    )

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

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

# DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'accounts.User'

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
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

SPECTACULAR_SETTINGS = {
    'TITLE': 'AvoGuard API',
    'DESCRIPTION': 'API for AvoGuard',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

_raw_csrf_origins = os.environ.get('CSRF_TRUSTED_ORIGINS', 'http://localhost:5173')
# Sanitize env value: allow comma-separated list, strip quotes/spaces, and ensure scheme.
_cs = []
for _o in _raw_csrf_origins.split(','):
    _o = _o.strip().strip('"').strip("'")
    if not _o:
        continue
    if '://' not in _o:
        _o = f'http://{_o}'
    _cs.append(_o)
CSRF_TRUSTED_ORIGINS = _cs

ADMIN_SITE_HEADER = 'AvoGuard Backend'
ADMIN_SITE_TITLE = 'AvoGuard Backend'
ADMIN_INDEX_TITLE = 'Dashboard'

import django.contrib.admin
django.contrib.admin.AdminSite.site_header = ADMIN_SITE_HEADER
django.contrib.admin.AdminSite.site_title = ADMIN_SITE_TITLE
django.contrib.admin.AdminSite.index_title = ADMIN_INDEX_TITLE

if not DEBUG:
    AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_ENDPOINT_URL = os.environ.get('AWS_S3_ENDPOINT_URL')
    AWS_S3_ACCESS_KEY_ID = os.environ.get('AWS_S3_ACCESS_KEY_ID')
    AWS_S3_SECRET_ACCESS_KEY = os.environ.get('AWS_S3_SECRET_ACCESS_KEY')
    AWS_S3_FILE_OVERWRITE = False
    AWS_QUERYSTRING_AUTH = True
    AWS_DEFAULT_ACL = 'public-read'
    # AWS_S3_CUSTOM_DOMAIN = os.environ.get('AWS_S3_CUSTOM_DOMAIN')
    AWS_SESSION_TOKEN=None
    AWS_S3_SIGNATURE_VERSION = 's3v4'
    STORAGES = {
        "default": {
            "BACKEND": "avo_guard.storages.MediaStorage",
        },
        "staticfiles": {
            "BACKEND": "avo_guard.storages.StaticStorage",
            # "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }
else:
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
            # "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
        },
    }

# django-cors-headers (browser calls from Vite, etc.)
# https://github.com/adamchainz/django-cors-headers
CORS_ALLOW_CREDENTIALS = True
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    # Production: set CORS_ALLOWED_ORIGINS to every browser origin that calls this API (comma-separated),
    # e.g. https://avoguard.cognitron.co.ke — otherwise registration/login from the SPA will fail in the browser.
    _cors_raw = os.environ.get(
        'CORS_ALLOWED_ORIGINS',
        'http://localhost:5173,http://127.0.0.1:5173',
    )
    CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_raw.split(',') if o.strip()]
