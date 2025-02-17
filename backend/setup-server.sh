#!/bin/bash

set -e

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
rm get-docker.sh

sudo curl -L "https://github.com/docker/compose/releases/download/$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -oP '"tag_name": "\K(.*)(?=")')/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

git clone https://github.com/kz4killua/course-alerts.git
cd course-alerts/backend

echo "Ensure that the environment variables are set in the .env file."
echo "Press any key to continue..."
read -n 1 -s

chmod 600 .env

# Enable memory overcommit to prevent Redis from crashing
echo "vm.overcommit_memory = 1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

docker compose up -d --build

sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

echo "Log into your domain registrar and create the following record:"
echo "Type: A"
echo "Name: api"
echo "Value: <server-ip>"
echo "Press any key to continue..."
read -n 1 -s

sudo apt update

# Install and configure Nginx
sudo apt install nginx
sudo cat nginx.conf | sudo tee /etc/nginx/sites-available/api.coursealerts.fyi > /dev/null
sudo ln -s /etc/nginx/sites-available/api.coursealerts.fyi /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.coursealerts.fyi
sudo certbot renew --dry-run

# Enable automatic updates for security patches
sudo dpkg-reconfigure --priority=low unattended-upgrades

# To set up the database, use the following format: 
# docker exec -it backend-web-1 python manage.py updatesections 202409 --usecache
# docker exec -it backend-web-1 python manage.py updatesections 202501 --usecache

# Or, connect to the bash shell using:
# docker exec -it backend-web-1 /bin/bash