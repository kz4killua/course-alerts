from django.contrib import admin
from .models import Course, Section, Term


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    pass    


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    pass


@admin.register(Term)
class TermAdmin(admin.ModelAdmin):
    pass