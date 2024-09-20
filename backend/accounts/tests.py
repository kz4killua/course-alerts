from django.urls import reverse
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import EmailVerificationCode
from accounts.views import RequestEmailVerification


User = get_user_model()


class TestRegistration(APITestCase):


    def setUp(self):
        self._request_email_verification_throttle_classes = RequestEmailVerification.throttle_classes
        RequestEmailVerification.throttle_classes = []


    def test_create_account(self):

        url = reverse('accounts:signup')

        data = {"email": "user1@example.com", "password": "password"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        
        data = {"email": "user2@example.com", "password": "password"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 2)

        data = {"email": "User2@example.com", "password": "password"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 2)

        user1 = User.objects.get(email="user1@example.com")
        self.assertFalse(user1.email_verified)
        user2 = User.objects.get(email="user2@example.com")
        self.assertFalse(user2.email_verified)


    def test_request_email_verification(self):

        url = reverse('accounts:request-email-verification')

        user1 = User.objects.create_user(
            email="user1@example.com", password="password"
        )
        user2 = User.objects.create_user(
            email="user2@example.com", password="password"
        )

        user1.email_verified = False
        user1.save()
        user2.email_verified = True
        user2.save()

        self.client.force_authenticate(user=user1)
        response = self.client.post(url)
        self.assertFalse(user1.email_verified)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(EmailVerificationCode.objects.count(), 1)

        self.client.force_authenticate(user=user2)
        response = self.client.post(url)
        self.assertTrue(user2.email_verified)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(EmailVerificationCode.objects.count(), 1)


    def test_verify_email(self):
        
        url = reverse('accounts:verify-email')

        user = User.objects.create_user(
            email="user@example.com", password="password"
        )
        self.client.force_authenticate(user=user)

        response = self.client.post(
            reverse('accounts:request-email-verification')
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        email_verification_code = EmailVerificationCode.objects.get(user=user)
        code = email_verification_code.code

        # invalid code
        data = {"code": "******"}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # expired code
        default_expires_at = email_verification_code.expires_at
        email_verification_code.expires_at = timezone.now() - timezone.timedelta(minutes=1)
        email_verification_code.save()
        data = {"code": code}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # valid code
        email_verification_code.expires_at = default_expires_at
        email_verification_code.save()
        data = {"code": code}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # used code
        data = {"code": code}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


    def tearDown(self) -> None:
        RequestEmailVerification.throttle_classes = self._request_email_verification_throttle_classes