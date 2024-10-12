from django.db import models
from django.core.cache import cache

from .api import get_linked_sections, get_enrollment_info
from .time_bitmap import TimeBitmap


class Course(models.Model):
    """A course e.g. MATH1010U"""
    subject = models.CharField(max_length=128)
    subject_description = models.CharField(max_length=128)
    subject_course = models.CharField(primary_key=True, max_length=128)
    course_title = models.CharField(max_length=128)
    course_number = models.CharField(max_length=128)

    def __str__(self) -> str:
        return f"Course: {self.subject_course}"
    

class Term(models.Model):
    """A term e.g. 202109"""
    term = models.CharField(primary_key=True, max_length=6)
    term_desc = models.CharField(max_length=128)
    registration_open = models.BooleanField(default=False)

    def __str__(self) -> str:
        return f"Term: {self.term}"


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
    is_primary_section = models.BooleanField()
    _time_bitmap = models.CharField(max_length=512, editable=False)


    def __str__(self) -> str:
        return f"Section: {self.term.term} - {self.course_reference_number}"


    def get_linked_crns(self) -> list[list[str]]:
        """Return the CRNs of the linked sections for this class (from the cache if available)."""

        if not self.is_section_linked:
            return []

        key = f"linked_crns_{self.id}"
        if key not in cache:
            result = get_linked_sections(self.term.term, self.course_reference_number)
            linked_crns = [
                [section['courseReferenceNumber'] for section in sections]
                for sections in result['linkedData']
            ]
            cache.set(key, linked_crns, timeout=None)

        return cache.get(key)
    

    def get_enrollment_info(self, force_refresh=False) -> dict:
        """Return the enrollment information for this section (from the cache if available)."""
        
        key = f"enrollment_info_{self.id}"
        if (key not in cache) or force_refresh:
            result = get_enrollment_info(self.term.term, self.course_reference_number)
            cache.set(key, result, timeout=60 * 60 * 24)

        return cache.get(key)


    def _calculate_time_bitmap(self) -> TimeBitmap:
        """Calculate the TimeBitmap representing all time slots occupied by a section."""

        time_bitmap = TimeBitmap()

        for meeting in self.meetings_faculty:

            # All asynchronous sessions have no time conflicts
            if not meeting["meetingTime"]["beginTime"] or not meeting["meetingTime"]["endTime"]:
                continue

            for day in TimeBitmap.DAYS:
                if meeting["meetingTime"][day]:
                    time_bitmap |= TimeBitmap.from_begin_and_end_time(
                        meeting["meetingTime"]["beginTime"], meeting["meetingTime"]["endTime"], day
                    )

        return time_bitmap
    

    def get_time_bitmap(self) -> TimeBitmap:
        """Get the TimeBitmap representing all time slots occupied by a section."""
        return TimeBitmap(int(self._time_bitmap))
    

    def save(self, *args, **kwargs) -> None:
        self._time_bitmap = str(self._calculate_time_bitmap().bitmap)
        return super().save(*args, **kwargs)