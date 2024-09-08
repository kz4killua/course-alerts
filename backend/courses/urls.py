from django.urls import path
from . import views

urlpatterns = [
    path('scheduling/generate', views.GenerateSchedules.as_view(), name='generate-schedules'),
]
