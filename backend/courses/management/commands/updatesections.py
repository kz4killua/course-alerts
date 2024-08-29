import json
from collections import defaultdict

from django.core.management.base import BaseCommand, CommandError, CommandParser

from courses.models import Course, Section
from courses.api import get_sections


class Command(BaseCommand):
    help = "Update the courses database with the latest course section data"

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("term", type=str, help="The term to update the course sections for")
        parser.add_argument("--usecache", action="store_true", help="Use cached data instead of fetching from the API")
        parser.add_argument("--jsessionid", type=str, help="A valid JSESSIONID cookie value")

    def handle(self, *args, **options):

        if not options["usecache"] and not options["jsessionid"]:
            raise CommandError("You must provide a JSESSIONID cookie value when not the --usecache option")

        # Load the course sections from a file or fetch them from the API
        if options["usecache"]:
            try:
                with open(f"courses/data/raw/sections/{options['term']}.json", "r") as f:
                    sections = json.load(f)
            except FileNotFoundError:
                raise CommandError(f"No cached data found for term: {options['term']}")
        else:
            try:
                sections = get_all_sections(options["term"], options["jsessionid"])
            except BaseException as e:
                raise CommandError(f"Failed to retrieve course sections: {e}")
        
        # Save the raw data to a file
        if not options["usecache"]:
            with open(f"courses/data/raw/sections/{options['term']}.json", "w") as f:
                json.dump(sections, f, indent=2)

        # Get the CRNs of the primary sections for each course
        primary_section_crns = get_primary_section_crns(sections)

        for section in sections:

            # Create or update each course
            course, _ = Course.objects.update_or_create(
                subject_course=section["subjectCourse"],
                defaults={
                    "subject": section["subject"],
                    "subject_description": section["subjectDescription"],
                    "course_title": section["courseTitle"],
                    "course_number": section["courseNumber"],
                }
            )

            # Create or update each section
            section, _ = Section.objects.update_or_create(
                course_reference_number=section["courseReferenceNumber"],
                defaults={
                    "term": section["term"],
                    "term_desc": section["termDesc"],
                    "part_of_term": section["partOfTerm"],
                    "sequence_number": section["sequenceNumber"],
                    "campus_description": section["campusDescription"],
                    "schedule_type_description": section["scheduleTypeDescription"],
                    "credit_hours": section["creditHours"],
                    "credit_hour_high": section["creditHourHigh"],
                    "credit_hour_low": section["creditHourLow"],
                    "credit_hour_indicator": section["creditHourIndicator"],
                    "link_identifier": section["linkIdentifier"],
                    "is_section_linked": section["isSectionLinked"],
                    "faculty": section["faculty"],
                    "meetings_faculty": section["meetingsFaculty"],
                    "course": course,
                    "is_primary_section": section['courseReferenceNumber'] in primary_section_crns,
                }
            )

        self.stdout.write(
            self.style.SUCCESS('Updated data for term: "%s"' % options["term"])
        )


def get_all_sections(term: str, jsessionid: str):
    """Retrieve all course sections for a given term."""
    
    data = []
    offset = 0
    limit = 500

    while True:
        result = get_sections(jsessionid, term, offset=offset, limit=limit)
        data.extend(result["data"])

        offset += limit
        if offset >= result['totalCount']:
            break

    return data


def get_primary_section_crns(sections: list) -> set:
    """
    Return the CRNs of the primary sections for each course.

    The primary sections for a course are the section types (e.g. lectures, labs, tutorials),
    that have the fewest sections. Any sections without links are also considered primary sections. 
    These are used to retrieve linked sections from the API.
    """

    primary_sections = set()

    # Any unlinked section is considered a primary section
    for section in sections:
        if not section['isSectionLinked']:
            primary_sections.add(section['courseReferenceNumber'])
    sections = [section for section in sections if section['isSectionLinked']]

    # Group the remaining sections by course code
    courses = defaultdict(list)
    for section in sections:
        courses[section['subjectCourse']].append(section)

    for course_sections in courses.values():

        # Count the number of sections of each link type
        link_counts = defaultdict(int)
        for section in course_sections:
            link_counts[section['linkIdentifier']] += 1

        # The link type with the fewest sections is the primary link type
        primary_link = min(link_counts, key=link_counts.get)
        for section in course_sections:
            if (section['linkIdentifier'] == primary_link):
                primary_sections.add(section['courseReferenceNumber'])

    return primary_sections