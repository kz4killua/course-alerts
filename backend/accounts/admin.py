from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from accounts.models import EmailVerificationCode, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ["email"]
    list_display = ["email", "phone", "last_login"]
    search_fields = ["email"]
    fieldsets = [
        ("Personal info", {"fields": ("email", "phone")}),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    ]
    add_fieldsets = [
        ("Personal info", {"fields": ("email", "phone", "password1", "password2")}),
    ]


@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    pass
