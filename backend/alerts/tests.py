from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from django.core.management import call_command
from rest_framework import status


User = get_user_model()


class TestSubscriptionListCreateDeleteView(APITestCase):

    def setUp(self) -> None:
        call_command("updatesections", "202309", "--usecache")
        call_command("updatesections", "202401", "--usecache")


    def test_list_create_delete_subscriptions(self):
        
        user = User.objects.create_user(
            email="email@example.com", password="password"
        )
        user.email_verified = True
        user.save()
        self.client.force_authenticate(user=user)

        url = reverse('subscriptions-list-create-delete')

        # Test creating valid subscriptions
        response = self.client.post(url, {
            'term': '202309',
            'course_reference_numbers': ["42684", "44746"]
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.client.post(url, {
            'term': '202401',
            'course_reference_numbers': ["73772", "70154"]
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Test invalid terms and course reference numbers
        response = self.client.post(url, {
            'term': '199009',
            'course_reference_numbers': ["42684", "44746"]
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.post(url, {
            'term': '202309',
            'course_reference_numbers': ["73772", "70154"]
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Test listing subscriptions
        response = self.client.get(url, {'term': '202309'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        response = self.client.get(url, {'term': '202401'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Test deleting subscriptions
        response = self.client.delete(url, {
            'term': '202309',
            'course_reference_numbers': ["42684", "44746"]
        })
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(url, {'term': '202309'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

        response = self.client.delete(url, {
            'term': '202401',
            'course_reference_numbers': ["73772"]
        })
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(url, {'term': '202401'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)