#!/bin/bash

set -e

docker compose down
docker system prune -f
git pull origin main
docker compose up --build -d