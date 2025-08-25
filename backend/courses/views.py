import django_filters.rest_framework
from rest_framework import filters, generics

from .models import Course, Section, Term
from .serializers import CourseSerializer, SectionSerializer, TermSerializer


class TermsView(generics.ListAPIView):
    queryset = Term.objects.all()
    serializer_class = TermSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = ["registration_open"]


class CoursesView(generics.ListAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["subject_course", "course_title"]

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        term = self.request.query_params.get("term")
        if term:
            queryset = queryset.filter(section__term__term=term).distinct()
        queryset = queryset[:20]
        return queryset


class SectionsView(generics.ListAPIView):
    queryset = Section.objects.all()
    serializer_class = SectionSerializer
    filter_backends = [django_filters.rest_framework.DjangoFilterBackend]
    filterset_fields = []

    def get_queryset(self):
        return Section.objects.filter(course__subject_course=self.kwargs.get("course"))

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        term = self.request.query_params.get("term")
        if term:
            queryset = queryset.filter(term__term=term)
        return queryset
