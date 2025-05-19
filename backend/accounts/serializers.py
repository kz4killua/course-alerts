from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import clean_email


User = get_user_model()


class EmailValidationMixin:
    def validate_email(self, value):
        return clean_email(value)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'email_verified', 'phone', 'phone_verified']
        read_only_fields = ['id', 'email', 'email_verified', 'phone_verified']


class RequestSignInCodeSerializer(serializers.Serializer, EmailValidationMixin):
    email = serializers.EmailField(required=True)


class VerifySignInCodeSerializer(serializers.Serializer, EmailValidationMixin):
    email = serializers.EmailField(required=True)
    code = serializers.CharField(required=True, max_length=6)