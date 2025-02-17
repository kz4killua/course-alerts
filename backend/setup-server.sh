#!/bin/bash

set -e

sudo apt update

# Set up the environment variables and fix permissions
echo "Ensure that the environment variables are set in the .env file."
echo "Press any key to continue..."
read -n 1 -s
chmod 600 .env

# Enable memory overcommit to prevent Redis from crashing
echo "vm.overcommit_memory = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Start the services
sudo sh setup-mounted-volumes.sh
docker compose up -d --build

# Set up the firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# Set up the domain name
echo "Log into your domain registrar and create the following record:"
echo "Type: A"
echo "Name: api"
echo "Value: <server-ip>"
echo "Press any key to continue..."
read -n 1 -s

# Install and configure Nginx
sudo apt install nginx
sudo cat nginx.conf | sudo tee /etc/nginx/sites-available/api.coursealerts.fyi > /dev/null
sudo ln -s /etc/nginx/sites-available/api.coursealerts.fyi /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

# Install and configure Certbot
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.coursealerts.fyi
sudo certbot renew --dry-run

# Enable automatic updates for security patches
sudo dpkg-reconfigure --priority=low unattended-upgrades