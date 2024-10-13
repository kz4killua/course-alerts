from django.urls import path
from . import views

urlpatterns = [
    path("", views.CoursesView.as_view(), name="courses"),
    path("terms/", views.TermsView.as_view(), name="terms"),
    path("<str:course>/sections/", views.SectionsView.as_view(), name="sections"),
]
