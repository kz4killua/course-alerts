#!/bin/bash

SUPERUSER_USERNAME=${DJANGO_SUPERUSER_USERNAME}
SUPERUSER_EMAIL=${DJANGO_SUPERUSER_EMAIL}
APP_PORT=${PORT:-8000}

cd /app/

python manage.py migrate --noinput
python manage.py collectstatic --noinput
python manage.py createsuperuser --username $SUPERUSER_USERNAME --email $SUPERUSER_EMAIL --noinput || true

gunicorn --worker-tmp-dir /dev/shm config.wsgi:application --bind "0.0.0.0:${APP_PORT}"