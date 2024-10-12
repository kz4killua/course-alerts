from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import APIException
from rest_framework import status
from rest_framework import generics

from .models import Term
from .serializers import TermSerializer


class TermsView(generics.ListAPIView):
    serializer_class = TermSerializer

    def get_queryset(self):
        queryset = Term.objects.all()

        registration_open = self.request.query_params.get("registration_open")
        if registration_open is None:
            pass
        elif registration_open.lower() == "true":
            registration_open = True
        elif registration_open.lower() == "false":
            registration_open = False
        else:
            registration_open = None

        if registration_open is not None:
            queryset = queryset.filter(registration_open=registration_open)

        return queryset