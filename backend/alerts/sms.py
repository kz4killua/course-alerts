import os

from twilio.rest import Client

account_sid = os.getenv('TWILIO_ACCOUNT_SID')
auth_token = os.getenv('TWILIO_AUTH_TOKEN')
phone_number = os.getenv('TWILIO_PHONE_NUMBER')
client = Client(account_sid, auth_token)

def send_sms(to: str, body: str) -> str:
    message = client.messages.create(
        from_=phone_number,
        body=body,
        to=to
    )
    return message.sid