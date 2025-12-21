from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from accounts.models import EmailVerificationCode

User = get_user_model()


class TestSignIn(APITestCase):
    def test_request_signin_code(self):
        url = reverse("accounts:request-signin-code")

        # Request a sign-in code for a new user
        data = {"email": "user1@example.com"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailVerificationCode.objects.count(), 1)

        # Repeated requests should be allowed
        data = {"email": "user1@example.com"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailVerificationCode.objects.count(), 1)

        # Emails should be case-insensitive
        data = {"email": "USER1@EXAMPLE.COM"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailVerificationCode.objects.count(), 1)

        # Request a sign-in code for another new user
        data = {"email": "user2@example.com"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailVerificationCode.objects.count(), 2)

    def test_verify_signin_code(self):
        # Create a sign-in code for a new user
        email = "user@example.com"
        data = {"email": email}
        response = self.client.post(
            reverse("accounts:request-signin-code"), data, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailVerificationCode.objects.count(), 1)

        # Retrieve the user and regenerate the verification code
        email_verification_code, code = EmailVerificationCode.generate(email)

        # Test an invalid verification code
        url = reverse("accounts:verify-signin-code")
        data = {"email": "email", "code": "******"}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test wrong email with valid code
        data = {"email": "wrong@example.com", "code": code}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test expired verification codes
        previous_expires_at = email_verification_code.expires_at
        email_verification_code.expires_at = timezone.now() - timezone.timedelta(
            minutes=1
        )
        email_verification_code.save()

        data = {"email": email, "code": code}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        email_verification_code.expires_at = previous_expires_at
        email_verification_code.save()

        # Test valid codes (with case insensitivity)
        data = {"email": email.capitalize(), "code": code}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.count(), 1)

        # Test used verification codes
        data = {"email": email, "code": code}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_brute_force_protection(self):
        email = "user@example.com"
        _, code = EmailVerificationCode.generate(email)
        url = reverse("accounts:verify-signin-code")

        # Exceed the maximum number of attempts
        for _ in range(EmailVerificationCode.CODE_MAX_ATTEMPTS):
            data = {"email": email, "code": "******"}
            response = self.client.post(url, data, format="json")
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # The next attempt should be blocked
        data = {"email": email, "code": code}
        response = self.client.post(url, data, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
