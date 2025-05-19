from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer, RequestSignInCodeSerializer, VerifySignInCodeSerializer
from .throttles import RequestEmailVerificationHourlyThrottle, RequestEmailVerificationDailyThrottle
from .models import EmailVerificationCode


User = get_user_model()


class RequestSignInCode(APIView):
    authentication_classes = []
    permission_classes = []
    throttle_classes = [RequestEmailVerificationHourlyThrottle, RequestEmailVerificationDailyThrottle]

    def post(self, request):

        serializer = RequestSignInCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        # Create the user if it doesn't exist
        user, _ = User.objects.get_or_create(email=email)
        _, code = EmailVerificationCode.generate(user)

        # Send the verification code to the user's email
        subject = render_to_string('accounts/verification_code_subject.txt')
        html_message = render_to_string('accounts/verification_code_body.html', {
            'code': code
        })
        plain_message = strip_tags(html_message)
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
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

        serializer = VerifySignInCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        
        # Retrieve the email verification code for the user
        try:
            email_verification_code = EmailVerificationCode.objects.get(
                user__email=email
            )
        except EmailVerificationCode.DoesNotExist:
            return Response({
                'detail': 'Invalid code.', 
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate the provided code
        if not email_verification_code.verify(code):
            return Response({
                'detail': 'Invalid code.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Verify the user's email and delete the verification code
        user = email_verification_code.user
        user.email_verified = True
        user.save()
        email_verification_code.delete()

        # Provide a set of tokens to the user
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        return Response({
            'refresh': str(refresh),
            'access': str(access),
        }, status=status.HTTP_200_OK)


class Me(generics.RetrieveUpdateAPIView):
    """Returns the current user's information."""
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user