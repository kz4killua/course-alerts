from django.test import TestCase
from django.core.management import call_command

from courses.scheduling.time_bitmap import TimeBitmap
from courses.scheduling.scheduling import get_section_time_bitmap, get_valid_section_combinations, generate_schedules
from courses.models import Section


class TestTimeBitmap(TestCase):

    def setUp(self) -> None:
        call_command("updatesections", "202309", "--usecache")


    def test_overlaps(self):

        tb1 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        tb2 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'tuesday')
        self.assertFalse(TimeBitmap.overlaps(tb1, tb2))

        tb1 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        tb2 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        self.assertTrue(TimeBitmap.overlaps(tb1, tb2))

        tb1 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        tb2 = TimeBitmap.from_begin_and_end_time('0940', '1100', 'monday')
        self.assertFalse(TimeBitmap.overlaps(tb1, tb2))

        tb1 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        tb1 |= TimeBitmap.from_begin_and_end_time('0810', '0930', 'wednesday')
        tb2 = TimeBitmap.from_begin_and_end_time('0840', '0930', 'tuesday')
        tb2 |= TimeBitmap.from_begin_and_end_time('0840', '0930', 'wednesday')
        self.assertTrue(TimeBitmap.overlaps(tb1, tb2))

        tb1 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        tb1 |= TimeBitmap.from_begin_and_end_time('0810', '0930', 'wednesday')
        tb2 = TimeBitmap.from_begin_and_end_time('0840', '0930', 'tuesday')
        tb2 |= TimeBitmap.from_begin_and_end_time('0840', '0930', 'thursday')
        self.assertFalse(TimeBitmap.overlaps(tb1, tb2))


class TestScheduling(TestCase):

    def setUp(self) -> None:
        call_command("updatesections", "202309", "--usecache")
    

    def test_generate_schedules(self):

        schedules = generate_schedules("202309", ["BIOL1000U", "EAP1000E"], time_limit=3, max_solutions=5, solver="random")
        self.assertEqual(len(schedules), 0)

        schedules = generate_schedules("202309", ["BIOL1000U", "EAP1000E"], time_limit=3, max_solutions=5, solver="cp")
        self.assertEqual(len(schedules), 0)

        schedules = generate_schedules("202309", ["BIOL1000U", "CRMN1000U"], time_limit=3, max_solutions=5, solver="random")
        self.assertEqual(len(schedules), 2)
        self.assertEqual(len(schedules.keys()), 2)

        schedules = generate_schedules("202309", ["BIOL1000U", "CRMN1000U"], time_limit=3, max_solutions=5, solver="cp")
        self.assertEqual(len(schedules), 2)
        self.assertEqual(len(schedules.keys()), 2)


    def test_get_valid_section_combinations(self):

        combinations = get_valid_section_combinations("202309", "BIOL1000U")
        self.assertEqual(len(combinations), 1)

        combinations = get_valid_section_combinations("202309", "CRMN1000U")
        self.assertEqual(len(combinations), 2)

        combinations = get_valid_section_combinations("202309", "CSCI2000U")
        self.assertEqual(len(combinations), 7)


    def test_get_section_time_bitmap(self):
        
        # COMM1050U, LEC, Online
        section = Section.objects.get(term="202309", course_reference_number="42750")
        tb = get_section_time_bitmap(section)
        self.assertEqual(tb, TimeBitmap())

        # SCCO 0999U, LEC, Online
        section = Section.objects.get(term="202309", course_reference_number="45203")
        tb = get_section_time_bitmap(section)
        self.assertEqual(tb, TimeBitmap())

        # MATH1010U, LEC, Tuesday + Friday 12:40 - 14:00
        section = Section.objects.get(term="202309", course_reference_number="40288")
        tb = get_section_time_bitmap(section)
        self.assertEqual(tb, TimeBitmap.from_begin_and_end_time('1240', '1400', 'tuesday') | TimeBitmap.from_begin_and_end_time('1240', '1400', 'friday'))

        # CSCI1030U, LAB, Thursday 09:40 - 11:00
        section = Section.objects.get(term="202309", course_reference_number="42685")
        tb = get_section_time_bitmap(section)
        self.assertEqual(tb, TimeBitmap.from_begin_and_end_time('0940', '1100', 'thursday'))


    def test_get_matching_schedules(self):
        pass


    def test_evaluate_schedule(self):
        pass