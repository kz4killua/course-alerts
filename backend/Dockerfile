FROM python:3.11.1

# Create a non-root, non-sudo user to run the container
ARG UID=1001
ARG GID=1001
RUN groupadd --gid ${GID} dockeruser && \
    useradd --uid ${UID} --gid ${GID} -m dockeruser

# Install system packages
RUN apt-get update && apt-get install -y --no-install-recommends netcat \
    && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:0.8.8 /uv /uvx /bin/

# Set working directory
WORKDIR /app

# Install project dependencies
COPY pyproject.toml uv.lock /app/
RUN uv sync --no-dev

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# Copy application files and set permissions
COPY --chown=dockeruser:dockeruser . /app
RUN chmod +x docker-entrypoint.sh

# Run the application as a non-root, non-sudo user
USER dockeruser
CMD ["/app/docker-entrypoint.sh"]