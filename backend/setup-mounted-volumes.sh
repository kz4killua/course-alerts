# NOTE: Ensure these match the user and group IDs in the Dockerfile.
UID=1001
GID=1001

# Set permissions for mounted volumes
mkdir -p media
sudo chown -R $UID:$GID media
sudo chmod -R 755 media
mkdir -p staticfiles
sudo chown -R $UID:$GID staticfiles
sudo chmod -R 755 staticfiles