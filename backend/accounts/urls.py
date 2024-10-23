from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView
)

from . import views


app_name = 'accounts'


urlpatterns = [
    path('token/refresh', TokenRefreshView.as_view(), name='token-refresh'),
    path('token/verify', TokenVerifyView.as_view(), name='token-verify'),
    path('signin/request', views.RequestSignInCode.as_view(), name='request-signin-code'),
    path('signin/verify', views.VerifySignInCode.as_view(), name='verify-signin-code')
]