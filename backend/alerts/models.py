from django.db import models
from django.contrib.auth import get_user_model

from courses.models import Section


User = get_user_model()


class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user} subscribed to {self.section}'