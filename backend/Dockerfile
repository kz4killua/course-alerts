FROM python:3.11.1

# Install netcat for TCP health checks
RUN apt-get update && apt-get install -y netcat

COPY . /app
WORKDIR /app

RUN pip install pip --upgrade && \
    pip install -r requirements.txt && \
    chmod +x entrypoint.sh

# Run the application as a non-root, non-sudo user
RUN useradd -m dockeruser
RUN chown -R dockeruser /app
USER dockeruser

CMD ["/app/entrypoint.sh"]