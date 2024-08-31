from django.db import models
from django.core.cache import cache

from .api import get_linked_sections


class Course(models.Model):
    """A course e.g. MATH1010U"""
    subject = models.CharField(max_length=128)
    subject_description = models.CharField(max_length=128)
    subject_course = models.CharField(primary_key=True, max_length=128)
    course_title = models.CharField(max_length=128)
    course_number = models.CharField(max_length=128)

    def __str__(self) -> str:
        return f"Course: {self.subject_course}"


class Section(models.Model):
    """A section (class) within a course e.g. individual lectures, labs, tutorials"""
    term = models.CharField(max_length=6)
    term_desc = models.CharField(max_length=128)
    course_reference_number = models.CharField(primary_key=True, max_length=5)
    part_of_term = models.CharField(max_length=128)
    sequence_number = models.CharField(max_length=128)
    campus_description = models.CharField(max_length=128)
    schedule_type_description = models.CharField(max_length=128)
    credit_hours = models.IntegerField(null=True)
    credit_hour_high = models.IntegerField(null=True)
    credit_hour_low = models.IntegerField(null=True)
    credit_hour_indicator = models.CharField(max_length=128, null=True)
    link_identifier = models.CharField(max_length=128, null=True)
    is_section_linked = models.BooleanField()
    faculty = models.JSONField()
    meetings_faculty = models.JSONField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    is_primary_section = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Section: {self.course_reference_number}"
    
    def get_linked_crns(self) -> list[list[str]]:
        """
        Return the CRNs of the linked sections for this class.

        These will be retrieved from the cache if available, otherwise they will be fetched from the API.
        """

        if not self.is_section_linked:
            return []

        key = f"linked_crns_{self.course_reference_number}"
        if key not in cache:
            result = get_linked_sections(self.term, self.course_reference_number)
            linked_crns = [
                [section['courseReferenceNumber'] for section in sections]
                for sections in result['linkedData']
            ]
            cache.set(key, linked_crns, timeout=None)

        return cache.get(key)