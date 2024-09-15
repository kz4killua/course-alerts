from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, BaseUserManager


class UserManager(BaseUserManager):

    def create_user(self, email, password):

        if not email:
            raise ValueError("Users must have an email address.")

        user = self.model(email=email.lower())
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
    email_verified = models.BooleanField(default=False)
    username = models.CharField(max_length=255, blank=True, null=True)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    objects = UserManager()

    def __str__(self) -> str:
        return self.email
    

class EmailVerificationCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def __str__(self) -> str:
        return self.code
    
    def is_expired(self) -> bool:
        return timezone.now() > self.expires_at
