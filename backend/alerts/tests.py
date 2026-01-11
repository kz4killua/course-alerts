from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from alerts.models import Subscription
from alerts.tasks import get_alerts, get_status, get_statuses, update_statuses
from courses.models import Section, Term

User = get_user_model()


class TestSubscriptionListCreateDeleteView(APITestCase):
    def setUp(self) -> None:
        call_command(
            "updatesections",
            "202309",
            jsonpath=settings.BASE_DIR / "courses/tests/data/202309.json",
            verbosity=0,
        )
        call_command(
            "updatesections",
            "202401",
            jsonpath=settings.BASE_DIR / "courses/tests/data/202401.json",
            verbosity=0,
        )

    def test_list_create_delete_subscriptions(self):
        user = User.objects.create_user(email="email@example.com", password="password")
        user.save()
        self.client.force_authenticate(user=user)

        s1 = Section.objects.get(term__term="202309", course_reference_number="42684")
        s2 = Section.objects.get(term__term="202309", course_reference_number="44746")
        s3 = Section.objects.get(term__term="202401", course_reference_number="73772")
        s4 = Section.objects.get(term__term="202401", course_reference_number="70154")

        url = reverse("subscriptions-list-create-delete")

        # Test subscriptions to sections not open for registration
        response = self.client.post(
            url,
            {"section_ids": [s1.id, s2.id, s3.id, s4.id]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Subscription.objects.filter(user=user).count(), 0)

        # Open up registration for both terms
        t1 = Term.objects.get(term="202309")
        t2 = Term.objects.get(term="202401")
        t1.registration_open = True
        t2.registration_open = True
        t1.save()
        t2.save()

        # Test subscriptions to valid sections
        response = self.client.post(
            url,
            {"section_ids": [s1.id, s2.id, s3.id, s4.id]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Subscription.objects.filter(user=user).count(), 4)

        # Test subscriptions to invalid sections
        response = self.client.post(
            url,
            {"section_ids": [99999, 88888, 77777, 66666]},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Subscription.objects.filter(user=user).count(), 4)

        # Test listing subscriptions
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 4)

        # Test deleting subscriptions
        response = self.client.delete(
            url,
            {
                "subscription_ids": [
                    subscription["id"] for subscription in response.data
                ]
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Subscription.objects.filter(user=user).count(), 0)


class TestAlerts(TestCase):
    def setUp(self) -> None:
        call_command(
            "updatesections",
            "202309",
            jsonpath=settings.BASE_DIR / "courses/tests/data/202309.json",
            verbosity=0,
        )

    def test_get_status(self):
        # No seats available
        enrollment_info = {
            "enrollment": 250,
            "maximumEnrollment": 250,
            "seatsAvailable": None,
            "waitCapacity": None,
            "waitCount": None,
            "waitAvailable": None,
        }
        self.assertEqual(get_status(enrollment_info), Subscription.CLOSED)

        # No seats available + class over-enrolled
        enrollment_info = {
            "enrollment": 255,
            "maximumEnrollment": 250,
            "seatsAvailable": -5,
            "waitCapacity": None,
            "waitCount": None,
            "waitAvailable": None,
        }
        self.assertEqual(get_status(enrollment_info), Subscription.CLOSED)

        # No seats available + waitlist open
        enrollment_info = {
            "enrollment": 250,
            "maximumEnrollment": 250,
            "seatsAvailable": 0,
            "waitCapacity": 20,
            "waitCount": 10,
            "waitAvailable": 10,
        }
        self.assertEqual(get_status(enrollment_info), Subscription.WAITLIST_OPEN)

        # No seats available + waitlist full
        enrollment_info = {
            "enrollment": 250,
            "maximumEnrollment": 250,
            "seatsAvailable": 0,
            "waitCapacity": 20,
            "waitCount": 20,
            "waitAvailable": 0,
        }
        self.assertEqual(get_status(enrollment_info), Subscription.CLOSED)

        # Seats available + no waitlist
        enrollment_info = {
            "enrollment": 245,
            "maximumEnrollment": 250,
            "seatsAvailable": 5,
            "waitCapacity": None,
            "waitCount": None,
            "waitAvailable": None,
        }
        self.assertEqual(get_status(enrollment_info), Subscription.OPEN)

        # Seats available, but reserved for waitlisted students
        enrollment_info = {
            "enrollment": 248,
            "maximumEnrollment": 250,
            "seatsAvailable": 2,
            "waitCapacity": 25,
            "waitCount": 25,
            "waitAvailable": 0,
        }
        self.assertEqual(get_status(enrollment_info), Subscription.CLOSED)

        # Seats available + waitlist open
        enrollment_info = {
            "enrollment": 245,
            "maximumEnrollment": 250,
            "seatsAvailable": 5,
            "waitCapacity": 20,
            "waitCount": 10,
            "waitAvailable": 10,
        }
        self.assertEqual(get_status(enrollment_info), Subscription.WAITLIST_OPEN)

    def test_get_alerts(self):
        user = User.objects.create_user(email="user@example.com", password="password")

        # Create sections
        section1 = Section.objects.get(
            term__term="202309", course_reference_number="42684"
        )
        section2 = Section.objects.get(
            term__term="202309", course_reference_number="44746"
        )
        section3 = Section.objects.get(
            term__term="202309", course_reference_number="42752"
        )
        section4 = Section.objects.get(
            term__term="202309", course_reference_number="41942"
        )

        # Create subscriptions
        Subscription.objects.create(user=user, section=section1)
        Subscription.objects.create(user=user, section=section2)
        Subscription.objects.create(user=user, section=section3)
        Subscription.objects.create(user=user, section=section4)

        # Mock enrollment infos
        enrollment_infos = {
            section1: {
                "enrollment": 250,
                "maximumEnrollment": 250,
                "seatsAvailable": None,
                "waitCapacity": None,
                "waitCount": None,
                "waitAvailable": None,
            },
            section2: {
                "enrollment": 245,
                "maximumEnrollment": 250,
                "seatsAvailable": 5,
                "waitCapacity": None,
                "waitCount": None,
                "waitAvailable": None,
            },
            section3: {
                "enrollment": 250,
                "maximumEnrollment": 250,
                "seatsAvailable": 0,
                "waitCapacity": 20,
                "waitCount": 10,
                "waitAvailable": 10,
            },
            section4: {
                "enrollment": 250,
                "maximumEnrollment": 250,
                "seatsAvailable": 0,
                "waitCapacity": 20,
                "waitCount": 20,
                "waitAvailable": 0,
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
                Subscription.CLOSED: {section1, section4},
            }
        }
        self.assertEqual(alerts, expected)

        # Test repeated alerts
        update_statuses(subscriptions, statuses, [])
        statuses = get_statuses(subscriptions, enrollment_infos)
        alerts = get_alerts(subscriptions, statuses)
        expected = {}
        self.assertEqual(alerts, expected)
