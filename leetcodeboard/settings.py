from pathlib import Path
import os
import mimetypes

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARENT_DIR = os.path.dirname(BASE_DIR)
mimetypes.add_type("text/javascript", ".js", True)
SECRET_KEY = os.environ.get('SECRET_KEY')
# DISCORD_CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID')
# DISCORD_CLIENT_SECRET = os.environ.get('DISCORD_CLIENT_SECRET')

SITE_ID = 2

# Prod
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
ALLOWED_HOSTS = ['studygrouppal.com', 'sdashboard.herokuapp.com']
DISCORD_REDIRECT_URI = 'https://' + ALLOWED_HOSTS[0] + '/callback'

# Debug
# DEBUG = True
# ALLOWED_HOSTS = ['127.0.0.1']
# DISCORD_REDIRECT_URI = 'http://' + ALLOWED_HOSTS[0] + ':8000/callback'

INSTALLED_APPS = [
    'dashboard.apps.DashboardConfig',
    'users.apps.UsersConfig',
    'tracker.apps.TrackerConfig',
    'crispy_forms',
    "crispy_bootstrap5",
    'django.contrib.admin',
    'django.contrib.sites',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_filters',
    # 3rd party
    "allauth", # new
    "allauth.account", # new
    "allauth.socialaccount", # new
    # social providers
    'allauth.socialaccount.providers.discord',
    'allauth.socialaccount.providers.github',
    'allauth.socialaccount.providers.google',
]

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "SCOPE": {
            "profile",
            "email"
        },
        "AUTH_PARAMS": {"access_type": "online"}
    }
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
]

ROOT_URLCONF = 'leetcodeboard.urls'

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
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
                'django.template.context_processors.request',
            ],
        },
    },
]

WSGI_APPLICATION = 'leetcodeboard.wsgi.application'

DATABASES = {
    'default': {
            'ENGINE': 'djongo',
            'NAME': 'studyDB',
            'ENFORCE_SCHEMA': False,
            'CLIENT': {
                'host': os.environ.get('MONGODB_CONNECTION')
            }  
        }
}

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]


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
# https://docs.djangoproject.com/en/4.0/topics/i18n/

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'leetcodeboard/static'),
    os.path.join(BASE_DIR, 'dashboard/static'),
    os.path.join(BASE_DIR, 'users/static'),
    os.path.join(BASE_DIR, 'tracker/static'),
    os.path.join(BASE_DIR, 'node_modules'),
]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
MEDIA_URL = '/media/'

CRISPY_ALLOWED_TEMPLATE_PACKS = "bootstrap5"
CRISPY_TEMPLATE_PACK = 'bootstrap5'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_REDIRECT_URL = 'tracker'
LOGOUT_REDIRECT_URL = '/'
LOGIN_URL = 'login'

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_ACCOUNT')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_PASSWORD')

# django_heroku.settings(locals())

if __name__ == '__main__':
    # Print all static folder paths
    for path in STATICFILES_DIRS:
        print("Static folder path:", path)

