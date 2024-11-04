import random
import string

from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer
from .throttles import RequestEmailVerificationHourlyThrottle, RequestEmailVerificationDailyThrottle
from .models import EmailVerificationCode, clean_email


User = get_user_model()


class RequestSignInCode(APIView):
    authentication_classes = []
    permission_classes = []
    throttle_classes = [RequestEmailVerificationHourlyThrottle, RequestEmailVerificationDailyThrottle]

    def post(self, request):

        email = request.data.get('email')
        if not email: 
            return Response({
                'detail': 'No email provided.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = clean_email(email)

        # Create the user if it doesn't exist
        user, _ = User.objects.get_or_create(email=email)
        
        email_verification_code, _ = EmailVerificationCode.objects.update_or_create(
            user=user,
            defaults={
                'code': ''.join(random.choices(string.digits, k=6)),
                'expires_at': timezone.now() + timezone.timedelta(minutes=15)
            }
        )

        subject = render_to_string('accounts/verification_code_subject.txt')
        html_message = render_to_string('accounts/verification_code_body.html', {
            'code': email_verification_code.code
        })
        plain_message = strip_tags(html_message)

        send_mail(
            subject=subject,
            message=plain_message,
            recipient_list=[email],
            html_message=html_message,
            fail_silently=False,
        )

        return Response({
            'detail': 'Email verification code sent.'
        }, status=status.HTTP_200_OK)


class VerifySignInCode(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        
        code = request.data.get('code')
        email = request.data.get('email')

        if not email: 
            return Response({
                'detail': 'No email provided.'
            }, status=status.HTTP_400_BAD_REQUEST)
        if not code:
            return Response({
                'detail': 'No code provided.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        email = clean_email(email)
        
        try:
            email_verification_code = EmailVerificationCode.objects.get(
                user__email=email, code=code
            )
        except EmailVerificationCode.DoesNotExist:
            return Response({
                'detail': 'Invalid code.', 
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if email_verification_code.is_expired():
            return Response({
                'detail': 'Code expired.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = email_verification_code.user
        user.email_verified = True
        user.save()
        email_verification_code.delete()

        # Provide a set of tokens to the user
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)


class Me(generics.RetrieveUpdateAPIView):
    """Returns the current user's information."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user