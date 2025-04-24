from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from django.core.management import call_command
from rest_framework import status

from courses.models import Section, Term
from alerts.models import Subscription
from alerts.tasks import get_alerts, get_status, get_statuses, update_statuses


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

        # Test closed terms
        response = self.client.post(url, {
            'term': '202309',
            'course_reference_numbers': ["42684", "44746"]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.client.post(url, {
            'term': '202401',
            'course_reference_numbers': ["73772", "70154"]
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Open up registration for both terms
        t1 = Term.objects.get(term='202309')
        t2 = Term.objects.get(term='202401')
        t1.registration_open = True
        t2.registration_open = True
        t1.save()
        t2.save()

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


    def test_get_status(self):
        
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
            get_status(enrollment_info), Subscription.CLOSED
        )

        # No seats available + class over-enrolled
        enrollment_info = {
            'enrollment': 255,
            'maximumEnrollment': 250,
            'seatsAvailable': -5,
            'waitCapacity': None,
            'waitCount': None,
            'waitAvailable': None
        }
        self.assertEqual(
            get_status(enrollment_info), Subscription.CLOSED
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
            get_status(enrollment_info), Subscription.WAITLIST_OPEN
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
            get_status(enrollment_info), Subscription.CLOSED
        )

        # Seats available + no waitlist
        enrollment_info = {
            'enrollment': 245,
            'maximumEnrollment': 250,
            'seatsAvailable': 5,
            'waitCapacity': None,
            'waitCount': None,
            'waitAvailable': None
        }
        self.assertEqual(
            get_status(enrollment_info), Subscription.OPEN
        )

        # Seats available, but reserved for waitlisted students
        enrollment_info = {
            'enrollment': 248, 
            'maximumEnrollment': 250, 
            'seatsAvailable': 2, 
            'waitCapacity': 25, 
            'waitCount': 25, 
            'waitAvailable': 0
        }
        self.assertEqual(
            get_status(enrollment_info), Subscription.CLOSED
        )

        # Seats available + waitlist open
        enrollment_info = {
            'enrollment': 245,
            'maximumEnrollment': 250,
            'seatsAvailable': 5,
            'waitCapacity': 20,
            'waitCount': 10,
            'waitAvailable': 10
        }
        self.assertEqual(
            get_status(enrollment_info), Subscription.WAITLIST_OPEN
        )


    def test_get_alerts(self):

        user = User.objects.create_user(
            email="user@example.com", password="password"
        )

        # Create sections
        section1 = Section.objects.get(term__term='202309', course_reference_number='42684')
        section2 = Section.objects.get(term__term='202309', course_reference_number='44746')
        section3 = Section.objects.get(term__term='202309', course_reference_number='42752')
        section4 = Section.objects.get(term__term='202309', course_reference_number='41942')

        # Create subscriptions
        Subscription.objects.create(user=user, section=section1)
        Subscription.objects.create(user=user, section=section2)
        Subscription.objects.create(user=user, section=section3)
        Subscription.objects.create(user=user, section=section4)

        # Mock enrollment infos
        enrollment_infos = {
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

        # Test alerts
        subscriptions = Subscription.objects.all()
        statuses = get_statuses(subscriptions, enrollment_infos)
        alerts = get_alerts(subscriptions, statuses)
        expected = {
            user: {
                Subscription.OPEN: {section2},
                Subscription.WAITLIST_OPEN: {section3},
                Subscription.CLOSED: {section1, section4}
            }
        }
        self.assertEqual(alerts, expected)

        # Test repeated alerts
        update_statuses(subscriptions, statuses, [])
        statuses = get_statuses(subscriptions, enrollment_infos)
        alerts = get_alerts(subscriptions, statuses)
        expected = {}
        self.assertEqual(alerts, expected)