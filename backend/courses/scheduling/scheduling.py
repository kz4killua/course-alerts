import heapq
import itertools
import functools
from collections import defaultdict

from courses.models import Section
from .time_bitmap import TimeBitmap
from .solvers import random_solver, cp_solver


def generate_schedules(term: str, course_codes: list[str], time_limit: int, max_solutions: int, solver: str = "random") -> list[dict]:
    """Create a schedule for a set of courses."""

    # Get valid combinations of LEC, TUT, LAB, etc. for each course
    options = dict()
    for course_code in course_codes:
        options[course_code] = get_valid_section_combinations(term, course_code)
        if len(options[course_code]) == 0:
            raise ValueError(f"No valid section combinations found for {course_code}.")

    # Create a single TimeBitmap for each valid combination of CRNs
    time_bitmap_options = defaultdict(set)
    time_bitmap_to_crns = defaultdict(list)

    for course_code, section_combinations in options.items():
        for combination in section_combinations:

            time_bitmaps = [
                get_section_time_bitmap(section) 
                for section in Section.objects.filter(
                    term=term,
                    course_reference_number__in=combination
                )
            ]

            # Skip combinations with time conflicts
            if TimeBitmap.overlaps(*time_bitmaps):
                continue

            time_bitmaps = functools.reduce(
                lambda x, y: x | y, time_bitmaps
            )

            time_bitmap_options[course_code].add(time_bitmaps)
            time_bitmap_to_crns[course_code, time_bitmaps].append(combination)

    # Generate valid schedules
    if solver == "random":
        time_assignments = random_solver.get_valid_time_assignments(
            course_codes, time_bitmap_options, time_limit, max_solutions
        )
    elif solver == "cp":
        time_assignments = cp_solver.get_valid_time_assignments(
            course_codes, time_bitmap_options, time_limit, max_solutions
        )
    else:
        raise ValueError(f"Invalid solver: {solver}")

    valid_schedules = get_matching_schedules(time_assignments, time_bitmap_to_crns)

    # Return (at most) the 3 best schedules
    return heapq.nlargest(3, valid_schedules, key=evaluate_schedule)


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


def evaluate_schedule(schedule: dict) -> int:
    """Calculate a "goodness" score for a schedule based on given preferences."""
    return 0


def get_valid_section_combinations(term: str, course_code: str) -> list[list[str]]:
    """Return the CRNs of all valid section combinations (LEC, TUT, LAB, etc.) for a course."""
    
    # Get all primary sections for the course
    primary_sections = Section.objects.filter(
        term=term, 
        course__subject_course=course_code,
        is_primary_section=True
    )

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


def get_section_time_bitmap(section: Section) -> TimeBitmap:
    """Get the TimeBitmap representing all time slots occupied by a section."""

    time_bitmap = TimeBitmap()

    for meeting in section.meetings_faculty:

        # All asynchronous sessions have no time conflicts
        if not meeting["meetingTime"]["beginTime"] or not meeting["meetingTime"]["endTime"]:
            continue

        for day in TimeBitmap.DAYS:
            if meeting["meetingTime"][day]:
                time_bitmap |= TimeBitmap.from_begin_and_end_time(
                    meeting["meetingTime"]["beginTime"], meeting["meetingTime"]["endTime"], day
                )

    return time_bitmap
