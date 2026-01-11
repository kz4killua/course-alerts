from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Section

from .models import Subscription
from .serializers import (
    CreateSubscriptionSerializer,
    DeleteSubscriptionSerializer,
    SubscriptionSerializer,
)


class SubscriptionListCreateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all sections the user is subscribed to."""
        subscriptions = Subscription.objects.filter(
            user=self.request.user
        ).select_related("section", "section__term")

        serializer = SubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        """Create user subscriptions to the specified sections."""
        serializer = CreateSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        section_ids = set(serializer.validated_data["section_ids"])

        sections = Section.objects.filter(
            id__in=section_ids,
            term__registration_open=True,
        )
        if len(sections) != len(section_ids):
            return Response(
                {
                    "detail": (
                        "One or more sections are invalid or not open for registration."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        Subscription.objects.bulk_create(
            [Subscription(user=request.user, section=section) for section in sections],
            ignore_conflicts=True,
        )

        # Use a single query to efficiently fetch subscriptions and related data
        subscriptions = Subscription.objects.filter(
            user=request.user, section__in=sections
        ).select_related("section", "section__term")

        serializer = SubscriptionSerializer(subscriptions, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request):
        """Delete user subscriptions to the specified sections."""
        serializer = DeleteSubscriptionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscription_ids = serializer.validated_data["subscription_ids"]

        Subscription.objects.filter(user=request.user, id__in=subscription_ids).delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
