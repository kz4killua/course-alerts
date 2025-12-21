import string
from datetime import timedelta

from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.db.models import F
from django.utils import timezone
from django.utils.crypto import get_random_string


def clean_email(email: str):
    return email.lower().strip()


class UserManager(BaseUserManager):
    def create_user(self, email, password):
        user = self.model(email=clean_email(email))
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password):
        user = self.create_user(email, password)
        user.is_superuser = True
        user.is_staff = True
        user.save()
        return user


class User(AbstractUser):
    email = models.EmailField(max_length=255, unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    username = None
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self) -> str:
        return self.email


class EmailVerificationCode(models.Model):
    email = models.EmailField(max_length=255, unique=True)
    code = models.CharField(max_length=128)
    attempts = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    CODE_LENGTH = 6
    CODE_EXPIRATION_TIME = 15
    CODE_MAX_ATTEMPTS = 10

    def __str__(self) -> str:
        return f"EmailVerificationCode(email={self.email})"

    @classmethod
    def generate(cls, email: str):
        """Generate a verification code for the given email."""
        code = get_random_string(length=cls.CODE_LENGTH, allowed_chars=string.digits)
        expires_at = timezone.now() + timedelta(minutes=cls.CODE_EXPIRATION_TIME)
        obj, _ = cls.objects.update_or_create(
            email=email,
            defaults={
                "attempts": 0,
                "expires_at": expires_at,
                "code": make_password(code),
            },
        )
        return obj, code

    def verify(self, code: str) -> bool:
        """Verify the provided code against the stored hash."""
        # Check if the code is expired
        if timezone.now() > self.expires_at:
            return False

        # Check if too many attempts have been made
        EmailVerificationCode.objects.filter(pk=self.pk).update(
            attempts=F("attempts") + 1
        )
        self.refresh_from_db()

        if self.attempts > self.CODE_MAX_ATTEMPTS:
            return False

        return check_password(code, self.code)
