import asyncio
import html
import json
import sys

import aiohttp
from django.core.management.base import BaseCommand, CommandError, CommandParser

from courses.api import get_sections
from courses.models import Course, Section, Term


class Command(BaseCommand):
    help = "Update the courses database with the latest course section data"

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument(
            "term", type=str, help="The term to update the course sections for"
        )
        parser.add_argument(
            "--usecache",
            action="store_true",
            help="Use cached data instead of fetching from the API",
        )
        parser.add_argument(
            "--jsessionid", type=str, help="A valid JSESSIONID cookie value"
        )

    def handle(self, *args, **options):
        if not options["usecache"] and not options["jsessionid"]:
            raise CommandError(
                "You must provide a JSESSIONID cookie value when not using "
                "the --usecache option."
            )

        # Load the course sections from a file or fetch them from the API
        if options["usecache"]:
            try:
                with open(
                    f"courses/data/raw/sections/{options['term']}.json",
                    encoding="utf-8",
                ) as f:
                    sections = json.load(f)
            except FileNotFoundError as e:
                raise CommandError(
                    f"No cached data found for term: {options['term']}"
                ) from e
        else:
            try:
                sections = asyncio.run(
                    get_all_sections(options["term"], options["jsessionid"])
                )
            except BaseException as e:
                raise CommandError(f"Failed to retrieve course sections: {e}") from e

        # Save the raw data to a file
        if not options["usecache"]:
            with open(
                f"courses/data/raw/sections/{options['term']}.json",
                "w",
                encoding="utf-8",
            ) as f:
                json.dump(sections, f, indent=2)

        # Unescape HTML entities
        sections = unescape(sections)

        for section in sections:
            # Create or update each course
            course, _ = Course.objects.update_or_create(
                subject_course=section["subjectCourse"],
                defaults={
                    "subject": section["subject"],
                    "subject_description": section["subjectDescription"],
                    "course_title": section["courseTitle"],
                    "course_number": section["courseNumber"],
                },
            )

            # Create or update each term
            term, _ = Term.objects.update_or_create(
                term=section["term"], defaults={"term_desc": section["termDesc"]}
            )

            # Create or update each section
            section, _ = Section.objects.update_or_create(
                id=section["id"],
                defaults={
                    "course_reference_number": section["courseReferenceNumber"],
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
                    "term": term,
                },
            )

        if "test" not in sys.argv:
            self.stdout.write(
                self.style.SUCCESS(f"Updated data for term: {options['term']}")
            )


async def get_all_sections(term: str, jsessionid: str):
    """Retrieve all course sections for a given term."""

    data = []
    offset = 0
    limit = 500

    async with aiohttp.ClientSession() as session:
        while True:
            result = await get_sections(
                session, jsessionid, term, offset=offset, limit=limit
            )
            data.extend(result["data"])

            offset += limit
            if offset >= result["totalCount"]:
                break

    return data


def unescape(data: dict | list | str):
    """Recursively unescape HTML entities."""
    if isinstance(data, str):
        return html.unescape(data)
    elif isinstance(data, list):
        return [unescape(item) for item in data]
    elif isinstance(data, dict):
        return {key: unescape(value) for key, value in data.items()}
    else:
        return data
