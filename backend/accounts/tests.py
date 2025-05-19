from django.urls import reverse
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import EmailVerificationCode
from accounts.views import RequestSignInCode


User = get_user_model()


class TestSignIn(APITestCase):


    def setUp(self):
        self._request_email_verification_throttle_classes = RequestSignInCode.throttle_classes
        RequestSignInCode.throttle_classes = []


    def test_request_signin_code(self):

        url = reverse('accounts:request-signin-code')

        data = {"email": "user1@example.com"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(EmailVerificationCode.objects.count(), 1)

        # Repeated requests are allowed
        data = {"email": "user1@example.com"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(EmailVerificationCode.objects.count(), 1)
        
        # Emails are case-insensitive
        data = {"email": "User1@example.com"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(EmailVerificationCode.objects.count(), 1)

        data = {"email": "user2@example.com"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 2)
        self.assertEqual(EmailVerificationCode.objects.count(), 2)

        user1 = User.objects.get(email="user1@example.com")
        self.assertFalse(user1.email_verified)
        user2 = User.objects.get(email="user2@example.com")
        self.assertFalse(user2.email_verified)


    def test_verify_signin_code(self):

        # Create a user and request a sign-in code
        data = {"email": "user1@example.com"}
        response = self.client.post(reverse('accounts:request-signin-code'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(EmailVerificationCode.objects.count(), 1)

        # Retrieve the user and the verification code
        user1 = User.objects.get(email="user1@example.com")
        email_verification_code, code = EmailVerificationCode.generate(user1)

        url = reverse('accounts:verify-signin-code')

        # Invalid code
        data = {"email": user1.email, "code": "******"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Wrong email
        data = {"email": "wrong@example.com", "code": code}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Expired code
        default_expires_at = email_verification_code.expires_at
        email_verification_code.expires_at = timezone.now() - timezone.timedelta(minutes=1)
        email_verification_code.save()
        data = {"email": user1.email, "code": code}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        email_verification_code.expires_at = default_expires_at
        email_verification_code.save()

        # Valid code (even if the email is capitalized)
        data = {"email": user1.email.capitalize(), "code": code}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Used code
        data = {"email": user1.email, "code": code}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def tearDown(self) -> None:
        RequestSignInCode.throttle_classes = self._request_email_verification_throttle_classes