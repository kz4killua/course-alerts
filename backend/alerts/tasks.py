from collections import defaultdict

from celery import shared_task
from celery.utils.log import get_task_logger
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.db.models import Manager

from .models import Subscription
from courses.models import Section
from accounts.models import User

logger = get_task_logger(__name__)


@shared_task
def send_alerts_task():
    
    subscriptions = Subscription.objects.all()

    logger.info("Getting enrollment info...")
    latest_enrollment_info = get_latest_enrollment_info(subscriptions)

    logger.info("Checking for new alerts...")
    alerts = get_latest_alerts(subscriptions, latest_enrollment_info)

    logger.info(f"Sending {len(alerts)} alert(s)...")
    send_alerts(alerts)

    logger.info("Done.")



def send_alerts(alerts: dict[User, dict]) -> None:

    for user, alert in alerts.items():
        message = render_to_string(
            "alerts/update.txt", {"alert": alert}
        )
        send_mail(
            subject="Course enrollment updates",
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )


def get_latest_alerts(subscriptions: Manager[Subscription], enrollment_info: dict[Section, dict]) -> dict[User, dict]:

    # Group subscriptions by user
    user_subscriptions = defaultdict(list)
    for subscription in subscriptions:
        user_subscriptions[subscription.user].append(subscription)

    # Check for new updates
    new_alerts = {}
    for user in user_subscriptions:

        user_alert = {
            Subscription.OPEN: set(), 
            Subscription.WAITLIST_OPEN: set(), 
            Subscription.CLOSED: set()
        }
        user_alert_is_new = False

        for subscription in user_subscriptions[user]:

            status = get_section_alert_status(
                enrollment_info[subscription.section]
            )
            user_alert[status].add(subscription.section)

            # Keep track of the last enrollment status for each subscription
            if subscription.last_status != status:
                user_alert_is_new = True
                subscription.last_status = status
                subscription.save()

        # Only send alerts if there are new updates
        if user_alert_is_new:
            new_alerts[user] = user_alert

    return new_alerts


def get_latest_enrollment_info(subscriptions: Manager[Subscription]) -> dict[Section, dict]:

    enrollment_info = {}
    for subscription in subscriptions:
        if subscription.section not in enrollment_info:
            enrollment_info[subscription.section] = (
                subscription.section.get_enrollment_info(force_refresh=True)
            )

    return enrollment_info


def get_section_alert_status(section_enrollment_info: dict) -> str:
    if (section_enrollment_info["seatsAvailable"] is not None) and (section_enrollment_info["seatsAvailable"] > 0):
        return Subscription.OPEN
    elif (section_enrollment_info["waitAvailable"] is not None) and (section_enrollment_info["waitAvailable"] > 0):
        return Subscription.WAITLIST_OPEN
    else:
        return Subscription.CLOSED
