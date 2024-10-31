from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Subscription

from accounts.permissions import EmailVerifiedPermission
from courses.models import Section
from courses.serializers import SectionSerializer


class SubscriptionListCreateDeleteView(APIView):
    permission_classes = [IsAuthenticated, EmailVerifiedPermission]


    def get(self, request):
        """List all sections the user is subscribed to."""

        term = request.query_params.get('term')
        
        subscriptions = Subscription.objects.filter(
            user=self.request.user, 
        )

        if term:
            subscriptions = subscriptions.filter(section__term__term=term)

        sections = [subscription.section for subscription in subscriptions]

        serializer = SectionSerializer(sections, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    def post(self, request):
        """Create subscriptions for the user to the given sections."""

        term = request.data.get('term')
        course_reference_numbers = request.data.get('course_reference_numbers')

        if not term:
            return Response({'detail': 'No term provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if not course_reference_numbers:
            return Response({'detail': 'No course reference numbers provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Ensure the sections exist
        sections = Section.objects.filter(
            term__term=term, 
            term__registration_open=True,
            course_reference_number__in=course_reference_numbers,
        )
        if len(sections) != len(course_reference_numbers):
            return Response({'detail': 'One or more sections not found.'}, status=status.HTTP_400_BAD_REQUEST)
        
        sections = {
            section.course_reference_number: section
            for section in Section.objects.filter(
                term__term=term, course_reference_number__in=course_reference_numbers
            )
        }
        
        subscriptions = []
        for crn in course_reference_numbers:
            subscription, created = Subscription.objects.get_or_create(
                user=request.user, section=sections[crn]
            )
            if created:
                subscriptions.append(subscription)

        serializer = SectionSerializer([
            subscription.section for subscription in subscriptions
        ], many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    
    def delete(self, request):
        """Delete subscriptions for the user to the given sections."""

        term = request.data.get('term')
        course_reference_numbers = request.data.get('course_reference_numbers')

        if not term:
            return Response({'detail': 'No term provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if not course_reference_numbers:
            return Response({'detail': 'No course reference numbers provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        subscriptions = Subscription.objects.filter(
            user=self.request.user, 
            section__term__term=term,
            section__course_reference_number__in=course_reference_numbers
        )
        subscriptions.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
