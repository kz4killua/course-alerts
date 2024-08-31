from django.test import TestCase
from django.core.management import call_command

from courses.models import Course, Section


class TestSection(TestCase):

    def setUp(self) -> None:
        call_command("updatesections", "202309", "--usecache")


    def test_primary_sections(self):
        
        primary_sections = Section.objects.filter(
            course__subject_course="BIOL1000U",
            is_primary_section=True
        )
        self.assertEqual(primary_sections.count(), 1)

        primary_sections = Section.objects.filter(
            course__subject_course="MATH1010U",
            is_primary_section=True
        )
        self.assertEqual(primary_sections.count(), 5)


    def test_get_linked_crns(self):
        
        section = Section.objects.get(course_reference_number="42684")
        linked_crns = section.get_linked_crns()
        expected = [
            ["42944"], ["45101"], ["42946"], ["42945"], ["42688"], 
            ["42948"], ["42687"], ["42947"], ["42686"], ["42685"],
            ["45100"], ["42943"]
        ]
        linked_crns.sort()
        expected.sort()
        self.assertSequenceEqual(linked_crns, expected)

        section = Section.objects.get(course_reference_number="44746")
        self.assertSequenceEqual(
            section.get_linked_crns(), []
        )