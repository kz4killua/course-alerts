from courses.models import Section
from .time_bitmap import TimeBitmap


def score_schedule(schedule: dict[str, list[str]], term: str, preferences: dict) -> float:
    """Score a schedule based on the given preferences."""

    score = 0

    if preferences.get("more_free_days", False):
        score -= count_days_with_scheduled_classes(schedule, term)
    if preferences.get("less_breaks_between_classes", False):
        score -= count_breaks_between_classes(schedule, term)
    if preferences.get("more_online_classes", False):
        score += count_online_classes(schedule, term)

    return score


def count_days_with_scheduled_classes(schedule: dict[str, list[str]], term: str) -> list[dict]:
    """Count the number of days a student has scheduled classes."""

    time_bitmap = get_schedule_time_bitmap(schedule, term)
    days_on_campus = 0

    for day in TimeBitmap.DAYS:
        mask = TimeBitmap.from_begin_and_end_time(
            TimeBitmap.SLOTS[0][0], TimeBitmap.SLOTS[-1][1], day
        )
        if time_bitmap & mask:
            days_on_campus += 1

    return days_on_campus


def count_breaks_between_classes(schedule: dict[str, list[str]], term: str) -> list[dict]:
    """Count the number of breaks between classes for a given schedule."""

    time_bitmap = get_schedule_time_bitmap(schedule, term)
    breaks_between_classes = 0

    for day in TimeBitmap.DAYS:
        mask = TimeBitmap.from_begin_and_end_time(
            TimeBitmap.SLOTS[0][0], TimeBitmap.SLOTS[-1][1], day
        )
        mask &= time_bitmap
        if mask:
            breaks_between_classes += bin(mask.bitmap)[2:].strip("0").count("0")

    return breaks_between_classes


def count_online_classes(schedule: dict[str, list[str]], term: str) -> list[dict]:
    """Count the number of online classes in a schedule."""

    crns = set()
    for values in schedule.values():
        crns.update(values)

    return Section.objects.filter(
        term=term, 
        course_reference_number__in=crns,
        campus_description="OT-Online"
    ).count()
            

def get_schedule_time_bitmap(schedule: dict[str, list[str]], term: str) -> TimeBitmap:
    """Get the time bitmap of a schedule."""
    time_bitmap = TimeBitmap()

    for crns in schedule.values():
        for crn in crns:
            section = Section.objects.get(term=term, course_reference_number=crn)
            time_bitmap |= section.get_time_bitmap()

    return time_bitmap