from collections import defaultdict
from courses.time_bitmap import TimeBitmap
from courses.models import Section


def apply_filters(options: dict, filters: dict, sections: dict[str, Section]) -> dict:
    """Apply filters to the given course options."""

    filtered = defaultdict(list)
    memo = dict()

    for course_code, section_combinations in options.items():
        for combination in section_combinations:
            for crn in combination:
                
                if crn not in memo:
                    section = sections[crn]
                    memo[crn] = is_section_filtered(section, filters)
                
                if memo[crn]:
                    break

            else:
                filtered[course_code].append(combination)

    return filtered


def is_section_filtered(section: Section, filters: dict) -> bool:
    """Returns True if the section should be filtered out."""
    
    # Evaluate filters (from the least to the most expensive to compute)
    if filters.get("remove_downtown_classes", False):
        if is_section_downtown(section):
            return True
    if "remove_classes_before" in filters:
        if is_section_before(section, filters["remove_classes_before"]):
            return True
    if "remove_classes_after" in filters:
        if is_section_after(section, filters["remove_classes_after"]):
            return True
    if filters.get("remove_closed_sections", False):
        if is_section_closed(section):
            return True
        
    return False


def is_section_closed(section: Section) -> bool:
    """Returns True if the section is closed."""
    enrollment_info = section.get_enrollment_info()
    if enrollment_info["seatsAvailable"] is None:
        return True
    return enrollment_info["seatsAvailable"] <= 0


def is_section_downtown(section: Section) -> bool:
    """Returns True if the section located in the downtown campus."""
    return section.campus_description == "OT-Downtown Oshawa"


def is_section_before(section: Section, time: str):
    """Returns True if the section starts before the given time."""
    time_bitmap = section.get_time_bitmap()
    
    mask = TimeBitmap()
    for day in TimeBitmap.DAYS:
        mask |= TimeBitmap.from_begin_and_end_time(TimeBitmap.TIME_SLOTS[0][0], time, day)

    return mask & time_bitmap


def is_section_after(section: Section, time: str):
    """Returns True if the section starts after the given time."""
    time_bitmap = section.get_time_bitmap()
    
    mask = TimeBitmap()
    for day in TimeBitmap.DAYS:
        mask |= TimeBitmap.from_begin_and_end_time(time, TimeBitmap.TIME_SLOTS[-1][1], day)

    return mask & time_bitmap
