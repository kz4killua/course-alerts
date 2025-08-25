from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import EmailVerifiedPermission
from courses.models import Section
from courses.serializers import SectionSerializer

from .models import Subscription
from .serializers import CreateSubscriptionSerializer, DeleteSubscriptionSerializer


class SubscriptionListCreateDeleteView(APIView):
    permission_classes = [IsAuthenticated, EmailVerifiedPermission]

    def get(self, request):
        """List all sections the user is subscribed to."""

        term = request.query_params.get("term")

        subscriptions = Subscription.objects.filter(user=self.request.user)
        if term:
            subscriptions = subscriptions.filter(section__term__term=term)

        sections = [subscription.section for subscription in subscriptions]
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create user subscriptions to the specified sections."""

        serializer = CreateSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        term = serializer.validated_data["term"]
        course_reference_numbers = serializer.validated_data["course_reference_numbers"]

        sections = Section.objects.filter(
            term__term=term,
            term__registration_open=True,
            course_reference_number__in=course_reference_numbers,
        )
        if len(sections) != len(course_reference_numbers):
            return Response(
                {"detail": "One or more sections not found."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subscriptions = []
        for section in sections:
            subscription, created = Subscription.objects.get_or_create(
                user=request.user, section=section
            )
            if created:
                subscriptions.append(subscription)

        sections = [subscription.section for subscription in subscriptions]
        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        """Delete user subscriptions to the specified sections."""

        serializer = DeleteSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        term = serializer.validated_data["term"]
        course_reference_numbers = serializer.validated_data["course_reference_numbers"]

        subscriptions = Subscription.objects.filter(
            user=self.request.user,
            section__term__term=term,
            section__course_reference_number__in=course_reference_numbers,
        )
        subscriptions.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
