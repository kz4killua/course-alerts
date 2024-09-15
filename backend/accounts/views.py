import random
import string

from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import UserSerializer
from .throttles import RequestEmailVerificationHourlyThrottle, RequestEmailVerificationDailyThrottle
from .models import EmailVerificationCode


User = get_user_model()


class SignUp(generics.CreateAPIView):
    """Create an account."""
    authentication_classes = []
    permission_classes = []
    serializer_class = UserSerializer


class RequestEmailVerification(APIView):
    """Request an email verification code."""
    permission_classes = [IsAuthenticated]
    throttle_classes = [RequestEmailVerificationHourlyThrottle, RequestEmailVerificationDailyThrottle]

    def post(self, request):
        
        if request.user.email_verified:
            return Response({
                'detail': 'Email already verified.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email_verification_code, _ = EmailVerificationCode.objects.update_or_create(
            user=request.user,
            defaults={
                'code': ''.join(random.choices(string.digits, k=6)),
                'expires_at': timezone.now() + timezone.timedelta(minutes=15)
            }
        )

        send_mail(
            'Verify your email address',
            f'Your email verification code is {email_verification_code.code}',
            settings.DEFAULT_FROM_EMAIL,
            [request.user.email],
            fail_silently=False,
        )

        return Response({
            'message': 'Email verification code sent.'
        }, status=status.HTTP_200_OK)


class VerifyEmail(APIView):

    def post(self, request):
        
        code = request.data.get('code')
        if not code:
            return Response({
                'detail': 'No code provided.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            email_verification_code = EmailVerificationCode.objects.get(
                user=request.user, code=code
            )
        except EmailVerificationCode.DoesNotExist:
            return Response({
                'detail': 'Invalid code.'
            })
        
        if email_verification_code.is_expired():
            return Response({
                'detail': 'Code expired.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        request.user.email_verified = True
        request.user.save()
        email_verification_code.delete()

        return Response({
            'message': 'Email verified.'
        }, status=status.HTTP_200_OK)
