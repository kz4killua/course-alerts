from django.db import models
from django.contrib.auth import get_user_model

from courses.models import Section


User = get_user_model()


class Subscription(models.Model):

    OPEN = "open"
    WAITLIST_OPEN = "waitlist_open"
    CLOSED = "closed"

    LAST_STATUS_CHOICES = {
        OPEN: OPEN,
        WAITLIST_OPEN: WAITLIST_OPEN,
        CLOSED: CLOSED,
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    last_status = models.CharField(max_length=20, choices=LAST_STATUS_CHOICES, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user} - {self.section}'