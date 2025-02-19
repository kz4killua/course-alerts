# NOTE: Ensure these match the user and group IDs in the Dockerfile.
DOCKERUSER_UID=1001
DOCKERUSER_GID=1001

# Set permissions for mounted volumes
mkdir -p media
sudo chown -R $DOCKERUSER_UID:$DOCKERUSER_GID media
sudo chmod -R 755 media
mkdir -p staticfiles
sudo chown -R $DOCKERUSER_UID:$DOCKERUSER_GID staticfiles
sudo chmod -R 755 staticfiles