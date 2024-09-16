from rest_framework.permissions import BasePermission


class EmailVerifiedPermission(BasePermission):
    message = "Your email must be verified to perform this action."
    def has_permission(self, request, view):
        return request.user.email_verified