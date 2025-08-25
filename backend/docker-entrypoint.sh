#!/bin/bash
set -euo pipefail

uv run python manage.py migrate --noinput
uv run python manage.py collectstatic --noinput
uv run python manage.py createsuperuser --email ${DJANGO_SUPERUSER_EMAIL} --noinput || true
exec uv run gunicorn --worker-tmp-dir /dev/shm config.wsgi:application --bind "0.0.0.0:${PORT}"