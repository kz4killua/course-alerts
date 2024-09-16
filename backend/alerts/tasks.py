from celery import shared_task

from .models import Subscription


@shared_task
def send_alerts_task():

    # Update enrollment info for all relevant sections
    enrollment_info = {}
    subscriptions = Subscription.objects.all()
    for subscription in subscriptions:
        enrollment_info[subscription.section.id] = (
            subscription.section.get_enrollment_info(force_refresh=True)
        )

    # TODO: Send alerts to users based on enrollment info
    pass