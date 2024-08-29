from django.db import models


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

    def __str__(self) -> str:
        return f"Section: {self.course_reference_number}"