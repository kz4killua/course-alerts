import aiohttp
from django.db import models

from .api import get_enrollment_info


class Course(models.Model):
    """A course e.g. MATH1010U"""

    subject = models.CharField(max_length=128)
    subject_description = models.CharField(max_length=128)
    subject_course = models.CharField(primary_key=True, max_length=128)
    course_title = models.CharField(max_length=128)
    course_number = models.CharField(max_length=128)

    class Meta:
        ordering = ["course_title", "subject_course"]

    def __str__(self) -> str:
        return self.subject_course


class Term(models.Model):
    """A term e.g. 202109"""

    term = models.CharField(primary_key=True, max_length=6)
    term_desc = models.CharField(max_length=128)
    registration_open = models.BooleanField(default=False)

    class Meta:
        ordering = ["term"]

    def __str__(self) -> str:
        return self.term


class Section(models.Model):
    """A section (class) within a course e.g. individual lectures, labs, tutorials"""

    id = models.IntegerField(primary_key=True)
    course_reference_number = models.CharField(max_length=128)
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
    term = models.ForeignKey(Term, on_delete=models.CASCADE)

    class Meta:
        ordering = [
            "course__subject_course",
            "schedule_type_description",
            "course_reference_number",
        ]

    def __str__(self) -> str:
        return f"{self.term} - {self.course_reference_number}"

    async def get_enrollment_info(self, session: aiohttp.ClientSession) -> dict:
        """Return the enrollment information for this section."""
        return await get_enrollment_info(
            session, self.term.term, self.course_reference_number
        )
