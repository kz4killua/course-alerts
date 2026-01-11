from django.conf import settings
from django.core.management import call_command
from django.urls import reverse
from rest_framework.test import APITestCase

from courses.models import Term


class TestTermsView(APITestCase):
    def setUp(self) -> None:
        Term.objects.create(term="202309", registration_open=True)
        Term.objects.create(term="202401", registration_open=True)
        Term.objects.create(term="202409")

    def test_terms_view(self):
        url = reverse("terms")

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)

        response = self.client.get(url, {"registration_open": "true"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

        response = self.client.get(url, {"registration_open": "True"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 2)

        response = self.client.get(url, {"registration_open": "false"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        response = self.client.get(url, {"registration_open": "False"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)

        response = self.client.get(url, {"registration_open": "invalid"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 3)


class TestCoursesView(APITestCase):
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

    def test_courses_view(self):
        url = reverse("courses")

        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 20)

        response = self.client.get(url, {"term": "202309"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 20)

        response = self.client.get(url, {"term": "202401"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 20)

        response = self.client.get(url, {"term": "invalid"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)

        response = self.client.get(url, {"term": "202309", "search": "Discrete Math"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 4)

        response = self.client.get(url, {"term": "202401", "search": "Discrete Math"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 0)
