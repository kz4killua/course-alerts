from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from django.core.management import call_command
from rest_framework import status

from courses.models import Section
from alerts.models import Subscription
from alerts.tasks import get_latest_alerts, get_latest_enrollment_info


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
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.client.post(url, {
            'term': '202401',
            'course_reference_numbers': ["73772", "70154"]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Test invalid terms and course reference numbers
        response = self.client.post(url, {
            'term': '199009',
            'course_reference_numbers': ["42684", "44746"]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.post(url, {
            'term': '202309',
            'course_reference_numbers': ["73772", "70154"]
        }, format='json')
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
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(url, {'term': '202309'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

        response = self.client.delete(url, {
            'term': '202401',
            'course_reference_numbers': ["73772"]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        response = self.client.get(url, {'term': '202401'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class TestAlerts(TestCase):

    def setUp(self) -> None:
        call_command("updatesections", "202309", "--usecache")
        call_command("updatesections", "202401", "--usecache")


    def test_send_alerts_task(self):

        user = User.objects.create_user(
            email="user@example.com", password="password"
        )

        # Create subscriptions
        subscriptions = [
            ('202309', '42684'),
            ('202309', '44746'),
            ('202401', '73772'),
            ('202401', '70154'),
            ('202309', '42752'),
            ('202309', '41942'),
            ('202401', '73773'),
            ('202401', '72741'),
        ]
        for term, crn in subscriptions:
            section = Section.objects.get(
                term__term=term, course_reference_number=crn
            )
            Subscription.objects.create(user=user, section=section)


        subscriptions = Subscription.objects.all()

        latest_enrollment_info = get_latest_enrollment_info(subscriptions)
        latest_alerts = get_latest_alerts(subscriptions, latest_enrollment_info)

        expected = {
            user: {
                Subscription.OPEN: {
                    Section.objects.get(term__term='202309', course_reference_number='44746'),
                    Section.objects.get(term__term='202309', course_reference_number='42684'),
                    Section.objects.get(term__term='202401', course_reference_number='73772'),
                    Section.objects.get(term__term='202401', course_reference_number='70154'),
                },
                Subscription.WAITLIST_OPEN: set(),
                Subscription.CLOSED: {
                    Section.objects.get(term__term='202309', course_reference_number='42752'),
                    Section.objects.get(term__term='202309', course_reference_number='41942'),
                    Section.objects.get(term__term='202401', course_reference_number='73773'),
                    Section.objects.get(term__term='202401', course_reference_number='72741'),
                }
            }
        }

        self.assertEqual(latest_alerts, expected)
