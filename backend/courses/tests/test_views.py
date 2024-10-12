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