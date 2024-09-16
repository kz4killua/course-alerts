from django.urls import path
from . import views

urlpatterns = [
    path('subscriptions', views.SubscriptionListCreateDeleteView.as_view(), name='subscriptions-list-create-delete'),
]
