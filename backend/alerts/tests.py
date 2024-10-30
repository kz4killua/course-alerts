from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from django.core.management import call_command
from rest_framework import status

from courses.models import Section
from alerts.models import Subscription
from alerts.tasks import get_alerts, get_section_alert_status


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


    def test_get_section_alert_status(self):
        
        # No seats available
        enrollment_info = {
            'enrollment': 250,
            'maximumEnrollment': 250,
            'seatsAvailable': None,
            'waitCapacity': None,
            'waitCount': None,
            'waitAvailable': None
        }
        self.assertEqual(
            get_section_alert_status(enrollment_info), Subscription.CLOSED
        )

        # No seats available (class overenrolled)
        enrollment_info = {
            'enrollment': 255,
            'maximumEnrollment': 250,
            'seatsAvailable': -5,
            'waitCapacity': None,
            'waitCount': None,
            'waitAvailable': None
        }
        self.assertEqual(
            get_section_alert_status(enrollment_info), Subscription.CLOSED
        )

        # Seats available + waitlist unavailable
        enrollment_info = {
            'enrollment': 245,
            'maximumEnrollment': 250,
            'seatsAvailable': 5,
            'waitCapacity': None,
            'waitCount': None,
            'waitAvailable': None
        }
        self.assertEqual(
            get_section_alert_status(enrollment_info), Subscription.OPEN
        )

        # Seats available + waitlist open
        enrollment_info = {
            'enrollment': 240,
            'maximumEnrollment': 250,
            'seatsAvailable': 10,
            'waitCapacity': 20,
            'waitCount': 10,
            'waitAvailable': 10
        }
        self.assertEqual(
            get_section_alert_status(enrollment_info), Subscription.OPEN
        )

        # No seats available + waitlist open
        enrollment_info = {
            'enrollment': 250,
            'maximumEnrollment': 250,
            'seatsAvailable': 0,
            'waitCapacity': 20,
            'waitCount': 10,
            'waitAvailable': 10
        }
        self.assertEqual(
            get_section_alert_status(enrollment_info), Subscription.WAITLIST_OPEN
        )

        # No seats available + waitlist full
        enrollment_info = {
            'enrollment': 250,
            'maximumEnrollment': 250,
            'seatsAvailable': 0,
            'waitCapacity': 20,
            'waitCount': 20,
            'waitAvailable': 0
        }
        self.assertEqual(
            get_section_alert_status(enrollment_info), Subscription.CLOSED
        )

    
    def test_get_alerts(self):

        user = User.objects.create_user(
            email="user@example.com", password="password"
        )

        section1 = Section.objects.get(term__term='202309', course_reference_number='42684')
        section2 = Section.objects.get(term__term='202309', course_reference_number='44746')
        section3 = Section.objects.get(term__term='202309', course_reference_number='42752')
        section4 = Section.objects.get(term__term='202309', course_reference_number='41942')

        # Create subscriptions
        subscription1 = Subscription.objects.create(user=user, section=section1)
        subscription2 = Subscription.objects.create(user=user, section=section2)
        subscription3 = Subscription.objects.create(user=user, section=section3)
        subscription4 = Subscription.objects.create(user=user, section=section4)

        enrollment_info = {
            section1: {
                'enrollment': 250,
                'maximumEnrollment': 250,
                'seatsAvailable': None,
                'waitCapacity': None,
                'waitCount': None,
                'waitAvailable': None
            },
            section2: {
                'enrollment': 245,
                'maximumEnrollment': 250,
                'seatsAvailable': 5,
                'waitCapacity': None,
                'waitCount': None,
                'waitAvailable': None
            },
            section3: {
                'enrollment': 250,
                'maximumEnrollment': 250,
                'seatsAvailable': 0,
                'waitCapacity': 20,
                'waitCount': 10,
                'waitAvailable': 10
            },
            section4: {
                'enrollment': 250,
                'maximumEnrollment': 250,
                'seatsAvailable': 0,
                'waitCapacity': 20,
                'waitCount': 20,
                'waitAvailable': 0
            },
        }

        alerts = get_alerts(Subscription.objects.all(), enrollment_info)

        expected = {
            user: {
                Subscription.OPEN: {section2},
                Subscription.WAITLIST_OPEN: {section3},
                Subscription.CLOSED: {section1, section4}
            }
        }

        self.assertEqual(alerts, expected)

        # Update the last status of the subscriptions
        subscription1.last_status = Subscription.CLOSED
        subscription1.save()
        subscription2.last_status = Subscription.OPEN
        subscription2.save()
        subscription3.last_status = Subscription.WAITLIST_OPEN
        subscription3.save()
        subscription4.last_status = Subscription.CLOSED
        subscription4.save()

        alerts = get_alerts(Subscription.objects.all(), enrollment_info)

        expected = {}

        self.assertEqual(alerts, expected)