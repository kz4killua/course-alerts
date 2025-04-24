from typing import Iterable
from collections import defaultdict

from celery import shared_task
from celery.utils.log import get_task_logger
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.html import strip_tags

from .models import Subscription
from .sms import send_sms
from courses.models import Section
from accounts.models import User

logger = get_task_logger(__name__)


@shared_task
def send_alerts_task():
    subscriptions = list(Subscription.objects.all())
    enrollment_infos = get_enrollment_infos(subscriptions)
    statuses = get_statuses(subscriptions, enrollment_infos)
    alerts = get_alerts(subscriptions, statuses)
    failed = send_alerts(alerts)
    update_statuses(subscriptions, statuses, failed)
    logger.info(f"Sent {len(alerts) - len(failed)}/{len(alerts)} alerts")


def send_alerts(alerts: dict[User, dict]) -> list[User]:
    """Send email and SMS alerts to users."""

    # Keep track of users who failed to receive alerts
    failed = []

    for user, alert in alerts.items():

        sent = False

        # Send email alerts
        subject = render_to_string("alerts/email_update_subject.txt").strip()
        html_message = render_to_string(
            "alerts/email_update_body.html", {"alert": alert}
        )
        plain_message = strip_tags(html_message)

        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
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
        
        # Update the list of failed alerts
        if not sent:
            failed.append(user)

    return failed


def get_alerts(subscriptions: Iterable[Subscription], statuses: dict[Section, str]) -> dict[User, dict]:
    """Returns notifications of new OPEN or WAITLIST_OPEN sections per user."""

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

            status = statuses[subscription.section]
            user_alert[status].add(subscription.section)

            # Keep track of the last enrollment status for each subscription
            if subscription.last_status != status:
                is_new = True

        # Only send alerts if there are new open or waitlist open sections
        if is_new and (user_alert[Subscription.OPEN] or user_alert[Subscription.WAITLIST_OPEN]):
            alerts[user] = user_alert

    return alerts


def update_statuses(subscriptions: Iterable[Subscription], statuses: dict[Section, str], failed: list[User]) -> None:
    """Update the last status of successfully sent alerts."""
    updates = []
    for subscription in subscriptions:
        status = statuses[subscription.section]
        # Skip status updates for users who failed to receive alerts
        if subscription.user in failed:
            continue
        # Skip status updates for unchanged statuses
        if subscription.last_status == status:
            continue
        # Update statuses
        subscription.last_status = status
        updates.append(subscription)
    # Update the database with the new statuses
    if updates:
        Subscription.objects.bulk_update(updates, ["last_status"])


def get_statuses(subscriptions: Iterable[Subscription], enrollment_infos: dict[Section, dict]) -> dict[Section, str]:
    """Map each section to its enrollment status."""
    statuses = {}
    for subscription in subscriptions:
        if subscription.section not in statuses:
            statuses[subscription.section] = get_status(
                enrollment_infos[subscription.section]
            )
    return statuses


def get_status(enrollment_info: dict) -> str:
    """Determine if a section is OPEN, WAITLIST_OPEN, or CLOSED."""
    if (enrollment_info["seatsAvailable"] or 0) > 0:
        # Sections are only open if there are no waitlisted students
        if (enrollment_info["waitCount"] or 0) == 0:
            return Subscription.OPEN
    if (enrollment_info["waitAvailable"] or 0) > 0:
        return Subscription.WAITLIST_OPEN
    return Subscription.CLOSED


def get_enrollment_infos(subscriptions: Iterable[Subscription]) -> dict[Section, dict]:
    """Map each section to its enrollment info."""
    enrollment_infos = {}
    for subscription in subscriptions:
        if subscription.section not in enrollment_infos:
            enrollment_infos[subscription.section] = (
                subscription.section.get_enrollment_info(force_refresh=True)
            )
    return enrollment_infos