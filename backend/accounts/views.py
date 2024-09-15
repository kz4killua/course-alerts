from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model, authenticate
from django.utils import timezone
from rest_framework import status


User = get_user_model()


class SignUp(generics.CreateAPIView):
    """Create an account."""
    authentication_classes = []
    permission_classes = []
    serializer_class = UserSerializer