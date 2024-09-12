FROM python:3.11.1-slim

COPY . /app
WORKDIR /app

RUN pip install pip --upgrade && \
    pip install -r requirements.txt && \
    chmod +x entrypoint.sh

CMD ["/app/entrypoint.sh"]