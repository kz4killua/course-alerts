from django.urls import path
from . import views

urlpatterns = [
    path("terms/", views.TermsView.as_view(), name="terms"),
]
