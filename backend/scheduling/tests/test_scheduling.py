from django.test import TestCase
from django.core.management import call_command

from courses.models import Section
from scheduling.scheduling import get_valid_section_combinations, generate_schedules, get_sections
from scheduling.filtering import is_section_downtown, is_section_before, is_section_after, is_section_closed
from scheduling.scoring import count_days_with_scheduled_classes, count_breaks_between_classes, count_online_classes


class TestScheduling(TestCase):

    def setUp(self) -> None:
        call_command("updatesections", "202309", "--usecache")


    def test_generate_schedules(self):

        schedules = generate_schedules("202309", ["BIOL1000U", "EAP1000E"], num_schedules=3, time_limit=3, max_solutions=5, solver="random")
        self.assertEqual(len(schedules), 0)

        schedules = generate_schedules("202309", ["BIOL1000U", "EAP1000E"], num_schedules=3, time_limit=3, max_solutions=5, solver="cp")
        self.assertEqual(len(schedules), 0)

        schedules = generate_schedules("202309", ["BIOL1000U", "CRMN1000U"], num_schedules=3, time_limit=3, max_solutions=5, solver="random")
        self.assertEqual(len(schedules), 2)
        for schedule in schedules:
            self.assertEqual(len(schedule.keys()), 2)

        schedules = generate_schedules("202309", ["BIOL1000U", "CRMN1000U"], num_schedules=3, time_limit=3, max_solutions=5, solver="cp")
        self.assertEqual(len(schedules), 2)
        for schedule in schedules:
            self.assertEqual(len(schedule.keys()), 2)


    def test_get_valid_section_combinations(self):

        sections = get_sections("202309", ["BIOL1000U", "CRMN1000U", "CRMN1000U", "CSCI2000U"])

        combinations = get_valid_section_combinations("BIOL1000U", sections)
        self.assertEqual(len(combinations), 1)

        combinations = get_valid_section_combinations("CRMN1000U", sections)
        self.assertEqual(len(combinations), 2)

        combinations = get_valid_section_combinations("CSCI2000U", sections)
        self.assertEqual(len(combinations), 7)



class TestFiltering(TestCase):

    def setUp(self) -> None:
        call_command("updatesections", "202309", "--usecache")


    def test_is_section_downtown(self):
            
        section = Section.objects.get(term="202309", course_reference_number="40424")
        self.assertTrue(is_section_downtown(section))
    
        section = Section.objects.get(term="202309", course_reference_number="43546")
        self.assertFalse(is_section_downtown(section))


    def test_is_section_before(self):

        section = Section.objects.get(term="202309", course_reference_number="40291")
        self.assertTrue(is_section_before(section, "0900"))
    
        section = Section.objects.get(term="202309", course_reference_number="40288")
        self.assertFalse(is_section_before(section, "0900"))


    def test_is_section_after(self):

        section = Section.objects.get(term="202309", course_reference_number="40291")
        self.assertFalse(is_section_after(section, "0940"))

        section = Section.objects.get(term="202309", course_reference_number="40288")
        self.assertTrue(is_section_after(section, "1210"))


    def test_is_section_closed(self):

        section = Section.objects.get(term="202309", course_reference_number="40372")
        self.assertFalse(is_section_closed(section))
    
        section = Section.objects.get(term="202309", course_reference_number="40371")
        self.assertTrue(is_section_closed(section))


class TestScoring(TestCase):

    def setUp(self) -> None:
        call_command("updatesections", "202309", "--usecache")

    
    def test_count_days_with_scheduled_classes(self):

        sections = get_sections("202309", ["COMM1050U", "CSCI1030U", "MATH1010U"])

        schedule = {
            'COMM1050U': ['42750', '42768']
        }
        self.assertEqual(count_days_with_scheduled_classes(schedule, sections), 1)

        schedule = {
            'CSCI1030U': ['42684', '42944']
        }
        self.assertEqual(count_days_with_scheduled_classes(schedule, sections), 3)

        schedule = {
            'CSCI1030U': ['42684', '42946']
        }
        self.assertEqual(count_days_with_scheduled_classes(schedule, sections), 2)

        schedule = {
            'CSCI1030U': ['42684', '42946'],
            'MATH1010U': ['40288', '45708']
        }
        self.assertEqual(count_days_with_scheduled_classes(schedule, sections), 5)


    def test_count_breaks_between_classes(self):

        sections = get_sections("202309", ["BIOL1000U", "MATH1010U"])

        schedule = {
            'BIOL1000U': ['44746']
        }
        self.assertEqual(count_breaks_between_classes(schedule, sections), 0)

        schedule = {
            'MATH1010U': ['40288', '40301']
        }
        self.assertEqual(count_breaks_between_classes(schedule, sections), 1)

        schedule = {
            'MATH1010U': ['40288', '45708']
        }
        self.assertEqual(count_breaks_between_classes(schedule, sections), 0)

        schedule = {
            'MATH1010U': ['40288', '40294']
        }
        self.assertEqual(count_breaks_between_classes(schedule, sections), 1)

        schedule = {
            'MATH1010U': ['40288', '42959']
        }
        self.assertEqual(count_breaks_between_classes(schedule, sections), 10)


    def test_count_online_classes(self):

        sections = get_sections("202309", ["COMM1050U", "PSYC1000U", "MATH1010U", "BIOL1000U"])
        
        schedule = {
            'COMM1050U': ['42750', '42768'],
            'PSYC1000U': ['43546']
        }
        self.assertEqual(count_online_classes(schedule, sections), 3)


        schedule = {
            'MATH1010U': ['40288', '40294'],
            'PSYC1000U': ['43546']
        }
        self.assertEqual(count_online_classes(schedule, sections), 1)

        schedule = {
            'MATH1010U': ['40288', '40294'],
            'BIOL1000U': ['44746']
        }
        self.assertEqual(count_online_classes(schedule, sections), 0)
