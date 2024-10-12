from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework import status
from rest_framework import generics
from rest_framework import filters
import django_filters.rest_framework

from .models import Term, Course
from .serializers import TermSerializer, CourseSerializer


class TermsView(generics.ListAPIView):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = ["registration_open"]


class CoursesView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["subject_description", "subject_course", "course_title"]
    

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        term = self.request.query_params.get("term")
        if term:
            queryset = queryset.filter(section__term__term=term).distinct()
        queryset = queryset[:20]
        return queryset