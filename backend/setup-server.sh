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
sudo apt install nginx

echo "In the next step, you will be prompted to create an NGINX configuration file."
echo "Ensure you have the configuration ready before continuing."
echo "Press any key to continue..."
read -n 1 -s

sudo nano /etc/nginx/sites-available/api.coursealerts.fyi

# Paste the following configuration from nginx-config.txt (assuming the server is running on port 8000):
# server {
#     listen 80;
#     server_name api.coursealerts.fyi;

#     location / {
#         proxy_pass http://localhost:8000;
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#     }
# }

if [ ! -f /etc/nginx/sites-available/api.coursealerts.fyi ]; then
    echo "NGINX configuration file was not created. Exiting..."
    exit 1
fi

sudo ln -s /etc/nginx/sites-available/api.coursealerts.fyi /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.coursealerts.fyi
sudo certbot renew --dry-run

# To set up the database, use the following format: 
# docker exec -it backend-web-1 python manage.py updatesections 202409 --usecache
# docker exec -it backend-web-1 python manage.py updatesections 202501 --usecache

# Or, connect to the bash shell using:
# docker exec -it backend-web-1 /bin/bash