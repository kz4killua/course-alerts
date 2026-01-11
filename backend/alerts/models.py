from django.contrib.auth import get_user_model
from django.db import models

from courses.models import Section

User = get_user_model()


class Subscription(models.Model):
    OPEN = "open"
    WAITLIST_OPEN = "waitlist_open"
    CLOSED = "closed"
    LAST_STATUS_CHOICES = {
        OPEN: "Open",
        WAITLIST_OPEN: "Waitlist Open",
        CLOSED: "Closed",
    }

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_status = models.CharField(
        max_length=20, choices=LAST_STATUS_CHOICES, null=True, blank=True
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "section"], name="unique_user_section"
            )
        ]

    def __str__(self):
        return f"Subscription(user={self.user}, section={self.section})"
