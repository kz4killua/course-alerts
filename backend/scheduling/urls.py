from django.urls import path
from . import views

urlpatterns = [
    path('generate', views.GenerateSchedules.as_view(), name='generate-schedules'),
]
