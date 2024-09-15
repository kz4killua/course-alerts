from django.test import TestCase
from django.core.management import call_command

from courses.models import Course, Section
from courses.time_bitmap import TimeBitmap


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
        
        section = Section.objects.get(
            term="202309",
            course_reference_number="42684"
        )
        linked_crns = section.get_linked_crns()
        expected = [
            ["42944"], ["45101"], ["42946"], ["42945"], ["42688"], 
            ["42948"], ["42687"], ["42947"], ["42686"], ["42685"],
            ["45100"], ["42943"]
        ]
        linked_crns.sort()
        expected.sort()
        self.assertSequenceEqual(linked_crns, expected)

        section = Section.objects.get(
            term="202309",
            course_reference_number="44746"
        )
        self.assertSequenceEqual(
            section.get_linked_crns(), []
        )


    def test_get_section_time_bitmap(self):
        
        # COMM1050U, LEC, Online
        section = Section.objects.get(term="202309", course_reference_number="42750")
        self.assertEqual(section.get_time_bitmap(), TimeBitmap())

        # SCCO 0999U, LEC, Online
        section = Section.objects.get(term="202309", course_reference_number="45203")
        self.assertEqual(section.get_time_bitmap(), TimeBitmap())

        # MATH1010U, LEC, Tuesday + Friday 12:40 - 14:00
        section = Section.objects.get(term="202309", course_reference_number="40288")
        self.assertEqual(section.get_time_bitmap(), TimeBitmap.from_begin_and_end_time('1240', '1400', 'tuesday') | TimeBitmap.from_begin_and_end_time('1240', '1400', 'friday'))

        # CSCI1030U, LAB, Thursday 09:40 - 11:00
        section = Section.objects.get(term="202309", course_reference_number="42685")
        self.assertEqual(section.get_time_bitmap(), TimeBitmap.from_begin_and_end_time('0940', '1100', 'thursday'))