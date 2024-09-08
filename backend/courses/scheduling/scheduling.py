import heapq
import itertools
import functools
from collections import defaultdict

from courses.models import Section
from .time_bitmap import TimeBitmap
from .solvers import random_solver, cp_solver
from .filtering import apply_filters
from .scoring import score_schedule
from .exceptions import SchedulingException


def generate_schedules(term: str, course_codes: list[str], num_schedules: int, time_limit: int | None, max_solutions: int | None, filters: dict | None = None, preferences: dict | None = None, solver: str = "cp") -> list[dict]:
    """Find the best schedules for a given term and list of course codes."""

    sections = get_sections(term, course_codes)

    # Get valid combinations of LEC, TUT, LAB, etc. for each course
    options = dict()
    for course_code in course_codes:
        options[course_code] = get_valid_section_combinations(course_code, sections)
        
    if filters:
        options = apply_filters(options, filters, sections)

    for course_code in course_codes:
        if len(options[course_code]) == 0:
            raise SchedulingException(f"No valid section combinations found for {course_code}.")
    
    # Create a single TimeBitmap for each valid combination of CRNs
    course_code_to_time_bitmaps = defaultdict(set)
    time_bitmap_to_crns = defaultdict(list)

    for course_code, section_combinations in options.items():
        for combination in section_combinations:

            time_bitmaps = []
            for crn in combination:
                section = sections[crn]
                time_bitmaps.append(
                    section.get_time_bitmap()
                )

            # Skip combinations with time conflicts
            if TimeBitmap.overlaps(*time_bitmaps):
                continue

            time_bitmaps = functools.reduce(
                lambda x, y: x | y, time_bitmaps
            )

            course_code_to_time_bitmaps[course_code].add(time_bitmaps)
            time_bitmap_to_crns[course_code, time_bitmaps].append(combination)

    # Generate valid schedules
    if solver == "random":
        time_assignments = random_solver.get_valid_time_assignments(
            course_codes, course_code_to_time_bitmaps, time_limit, max_solutions
        )
    elif solver == "cp":
        time_assignments = cp_solver.get_valid_time_assignments(
            course_codes, course_code_to_time_bitmaps, time_limit, max_solutions
        )
    else:
        raise ValueError(f"Invalid solver: {solver}")

    valid_schedules = get_matching_schedules(time_assignments, time_bitmap_to_crns)

    # Return the best schedules
    if preferences is None:
        return valid_schedules[:num_schedules]
    return heapq.nlargest(num_schedules, valid_schedules, key=lambda x: score_schedule(x, preferences, sections))


def get_matching_schedules(schedules: list[dict], time_bitmap_to_crns: dict) -> list[dict]:
    """List out all schedules matching the given TimeBitmap assignments."""

    results = []

    # Retrieve the section combinations matching each TimeBitmap
    for schedule in schedules:
        for course_code, time_bitmap in schedule.items():
            schedule[course_code] = time_bitmap_to_crns[course_code, time_bitmap]

    # Generate all possible combinations of section CRNs
    for schedule in schedules:
        keys = schedule.keys()
        for combination in itertools.product(*schedule.values()):
            results.append(
                dict(zip(keys, combination))
            )

    return results


def get_valid_section_combinations(course_code: str, sections: dict[str, Section]) -> list[list[str]]:
    """Return the CRNs of all valid section combinations (LEC, TUT, LAB, etc.) for a course."""
    
    # Get all primary sections for the course
    primary_sections = []
    for section in sections.values():
        if section.is_primary_section and section.course.subject_course == course_code:
            primary_sections.append(section)

    # Pre-fetch linked CRNs for each primary section
    for section in primary_sections:
        section.get_linked_crns()

    # List out all valid CRN combinations e.g. [LEC, TUT, LAB] for each course
    section_combinations = []
    for section in primary_sections:

        if not section.is_section_linked:
            section_combinations.append([section.course_reference_number])
        else:
            linked_crns = section.get_linked_crns()
            for option in linked_crns:
                section_combinations.append(
                    [section.course_reference_number] + option
                )

    return section_combinations


def get_sections(term: str, course_codes: list[str]) -> dict[str, Section]:
    """Create a mapping of CRNs to course sections for a given term."""
    sections = dict()
    for section in Section.objects.filter(term=term, course__subject_course__in=course_codes):
        sections[section.course_reference_number] = section
    return sections