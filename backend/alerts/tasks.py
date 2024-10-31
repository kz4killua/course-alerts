from collections import defaultdict

from celery import shared_task
from celery.utils.log import get_task_logger
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.db.models import Manager

from .models import Subscription
from .sms import send_sms
from courses.models import Section
from accounts.models import User

logger = get_task_logger(__name__)


@shared_task
def send_alerts_task():
    
    subscriptions = Subscription.objects.all()

    logger.info("Getting enrollment info...")
    latest_enrollment_info = get_sections_enrollment_info(subscriptions)

    logger.info("Getting alerts...")
    alerts = get_alerts(subscriptions, latest_enrollment_info)

    logger.info(f"Sending {len(alerts)} alert(s)...")
    send_alerts(alerts, subscriptions)

    logger.info("Done.")


def send_alerts(alerts: dict[User, dict], subscriptions: Manager[Subscription]) -> None:

    # Group subscriptions by (user, section)
    subscriptions = {
        (subscription.user, subscription.section): subscription 
            for subscription in subscriptions
    }

    for user, alert in alerts.items():

        sent = False

        # Send email alerts
        email = render_to_string(
            "alerts/email_update.txt", {"alert": alert}
        )
        try:
            send_mail(
                subject="🔔 Course Alerts: New Sections Available for Registration!",
                message=email,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
            )
            sent = True
        except Exception as e:
            logger.error(f"Failed to send email alert to {user.email}: {e}")

        # Send SMS alerts (if a phone number is provided)
        if user.phone:
            sms = render_to_string(
                "alerts/sms_update.txt", {"alert": alert}
            )
            try:
                send_sms(
                    to=user.phone, 
                    body=sms,
                )
                sent = True
            except Exception as e:
                logger.error(f"Failed to send SMS alert to {user.phone}: {e}")
        
        # Update subscription statuses
        if sent:
            for status, sections in alert.items():
                for section in sections:
                    subscription = subscriptions[(user, section)]
                    subscription.last_status = status
                    subscription.save()


def get_alerts(subscriptions: Manager[Subscription], enrollment_info: dict[Section, dict]) -> dict[User, dict]:

    # Group subscriptions by user
    user_subscriptions = defaultdict(list)
    for subscription in subscriptions:
        user_subscriptions[subscription.user].append(subscription)

    # Check for new updates
    alerts = {}
    for user in user_subscriptions:

        user_alert = {
            Subscription.OPEN: set(), 
            Subscription.WAITLIST_OPEN: set(), 
            Subscription.CLOSED: set()
        }
        is_new = False

        for subscription in user_subscriptions[user]:

            status = get_section_alert_status(
                enrollment_info[subscription.section]
            )
            user_alert[status].add(subscription.section)

            # Keep track of the last enrollment status for each subscription
            if subscription.last_status != status:
                is_new = True

        # Only send alerts if there are new updates
        if is_new:
            alerts[user] = user_alert

    return alerts


def get_sections_enrollment_info(subscriptions: Manager[Subscription]) -> dict[Section, dict]:

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
