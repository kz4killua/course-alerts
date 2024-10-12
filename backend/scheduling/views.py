from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework import status

from courses.models import Section
from .scheduling import generate_schedules
from .exceptions import SchedulingException


class GenerateSchedules(APIView):

    def post(self, request, *args, **kwargs):
        
        term = request.data.get("term")
        course_codes = request.data.get("course_codes")
        filters = request.data.get("filters")
        preferences = request.data.get("preferences")

        if not term:
            raise APIException(detail="No term provided.")
        if not course_codes or len(course_codes) == 0:
            raise APIException(detail="No course codes provided.")
        if len(course_codes) > 10:
            raise APIException(detail="Too many course codes provided.")
        if not Section.objects.filter(term__term=term).exists():
            raise APIException(detail="No sections found for the given term.")

        try:
            schedules = generate_schedules(
                term=term, course_codes=course_codes, 
                num_schedules=3,
                time_limit=10, max_solutions=None, 
                filters=filters, preferences=preferences,
                solver="cp"
            )
        except SchedulingException as e:
            raise APIException(detail=e.message)

        return Response({"schedules": schedules}, status=status.HTTP_200_OK)