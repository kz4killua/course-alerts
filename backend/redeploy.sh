#!/bin/bash

set -e

docker compose down
git pull origin main
docker compose up --build -d