import requests
from django.core.mail.backends.base import BaseEmailBackend
from django.core.mail import EmailMessage
from django.conf import settings


class MailgunEmailBackend(BaseEmailBackend):

    def send_messages(self, email_messages: list[EmailMessage]) -> int:
        
        count = 0

        for message in email_messages:
            response = requests.post(
                f"https://api.mailgun.net/v3/{settings.MAILGUN_DOMAIN}/messages",
                auth=("api", settings.MAILGUN_API_KEY),
                data={
                    "from": message.from_email,
                    "to": message.to,
                    "subject": message.subject,
                    "text": message.body,
                },
            )

            if response.ok:
                count += 1

        return count