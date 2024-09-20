from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

from . import views


app_name = 'accounts'


urlpatterns = [
    path('signup', views.SignUp.as_view(), name='signup'),
    path('token/request', TokenObtainPairView.as_view(), name='token-request'),
    path('token/refresh', TokenRefreshView.as_view(), name='token-refresh'),
    path('token/verify', TokenVerifyView.as_view(), name='token-verify'),
    path('email/requestverification', views.RequestEmailVerification.as_view(), name='request-email-verification'),
    path('email/verify', views.VerifyEmail.as_view(), name='verify-email'),
]