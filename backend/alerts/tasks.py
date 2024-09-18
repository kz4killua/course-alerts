from collections import defaultdict

from celery import shared_task
from celery.utils.log import get_task_logger
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string
from django.conf import settings

from .models import Subscription


User = get_user_model()


@shared_task
def send_alerts_task():
    
    subscriptions = Subscription.objects.all()

    # Get enrollment info for all relevant sections
    enrollment_info = {}
    for subscription in subscriptions:
        if subscription.section.id not in enrollment_info:
            enrollment_info[subscription.section.id] = (
                subscription.section.get_enrollment_info(force_refresh=True)
            )

    new_alerts = get_new_alerts(subscriptions, enrollment_info)

    # Send emails to users
    for user_id, user_alert in new_alerts.items():
        user = User.objects.get(id=user_id)
        message = render_to_string(
            "alerts/update.txt", {"alert": user_alert}
        )
        send_mail(
            subject="Course enrollment updates",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )


def get_new_alerts(subscriptions, enrollment_info):

    # Group subscriptions by user
    user_subscriptions = defaultdict(list)
    for subscription in subscriptions:
        user_subscriptions[subscription.user.id].append(subscription)

    # Check for new updates
    new_alerts = {}
    for user_id in user_subscriptions:

        user_alert = {
            Subscription.OPEN: set(), 
            Subscription.WAITLIST_OPEN: set(), 
            Subscription.CLOSED: set()
        }
        user_alert_is_new = False

        for subscription in user_subscriptions[user_id]:

            status = get_enrollment_status(
                enrollment_info[subscription.section.id]
            )
            user_alert[status].add(subscription.section)

            # Keep track of the last enrollment status for each subscription
            if subscription.last_status != status:
                user_alert_is_new = True
                subscription.last_status = status
                subscription.save()

        # Only send alerts if there are new updates
        if user_alert_is_new:
            new_alerts[user_id] = user_alert

    return new_alerts


def get_enrollment_status(enrollment_info: dict) -> str:
    if (enrollment_info["seatsAvailable"] is not None) and (enrollment_info["seatsAvailable"] > 0):
        return Subscription.OPEN
    elif (enrollment_info["waitlistAvailable"] is not None) and (enrollment_info["waitlistAvailable"] > 0):
        return Subscription.WAITLIST_OPEN
    else:
        return Subscription.CLOSED
