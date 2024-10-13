from rest_framework import serializers
from .models import Course, Section, Term
from .time_bitmap import TimeBitmap


class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ["subject", "subject_description", "subject_course", "course_title", "course_number"]


class SectionSerializer(serializers.ModelSerializer):
    meeting_times = serializers.SerializerMethodField()
    class Meta:
        model = Section
        fields = ["id", "course_reference_number", "course", "term", "schedule_type_description", "meeting_times"]


    def get_meeting_times(self, obj: Section) -> list[dict]:
        return [
            {
                "begin_time": meeting["meetingTime"]["beginTime"],
                "end_time": meeting["meetingTime"]["endTime"],
                "start_date": meeting["meetingTime"]["startDate"],
                "end_date": meeting["meetingTime"]["endDate"],
                "days": [
                    day for day in TimeBitmap.DAYS if meeting["meetingTime"][day]
                ],
            }
            for meeting in obj.meetings_faculty
        ]




class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ["term", "term_desc", "registration_open"]