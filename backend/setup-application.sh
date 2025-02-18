#!/bin/bash

set -e

# Update the package list
sudo apt update

# Set up environment variables
echo "Ensure that the environment variables are set in the .env file."
read -n 1 -s -r -p "Press any key to continue..."
chmod 600 .env

# Load environment variables
set -o allexport
source .env
set +o allexport

# Start services
sudo sh setup-mounted-volumes.sh
sudo sh redeploy.sh

# Set up DNS
echo "Log into your domain registrar and create the following record:"
echo "Type: A"
echo "Name: api"
echo "Value: <server-ip>"
read -n 1 -s -r -p "Press any key to continue..."

# Set up Nginx
sudo apt install nginx
envsubst < nginx.conf | sudo tee /etc/nginx/sites-available/${DOMAIN} > /dev/null
sudo ln -sf /etc/nginx/sites-available/${DOMAIN} /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

# Set up Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d ${DOMAIN}
sudo certbot renew --dry-run