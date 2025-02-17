# Set permissions for mounted volumes
mkdir -p media
sudo chown -R 1001:1001 media
sudo chmod -R 755 media
mkdir -p staticfiles
sudo chown -R 1001:1001 staticfiles
sudo chmod -R 755 staticfiles