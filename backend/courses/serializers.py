from rest_framework import serializers
from .models import Course, Section, Term


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = "__all__"


class SectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = "__all__"


class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = "__all__"