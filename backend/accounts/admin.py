from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from accounts.models import User, EmailVerificationCode


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ['email']
    list_display = ['email', 'email_verified', 'phone', 'phone_verified']
    list_filter = ['email_verified', 'phone_verified']
    search_fields = ['email']
    fieldsets = [
        ("Personal info", {"fields": ("email", "phone")}),
        ("Verifications", {"fields": ("email_verified", "phone_verified")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    ]
    add_fieldsets = [
        ("Personal info", {"fields": ("email", "phone", "password1", "password2")}),
        ("Verifications", {"fields": ("email_verified", "phone_verified")}),
    ]


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    pass