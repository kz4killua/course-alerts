from courses.models import Section
from courses.time_bitmap import TimeBitmap


# Precompute the time bitmaps for each day
DAY_BITMAPS = {
    day: TimeBitmap.from_begin_and_end_time(
        TimeBitmap.TIME_SLOTS[0][0], TimeBitmap.TIME_SLOTS[-1][1], day
    )
    for day in TimeBitmap.DAYS
}


def score_schedule(schedule: dict[str, list[str]], preferences: dict, sections: dict[str, Section]) -> float:
    """Score a schedule based on the given preferences."""

    score = 0

    if preferences.get("more_free_days", False):
        score -= count_days_with_scheduled_classes(schedule, sections)
    if preferences.get("less_breaks_between_classes", False):
        score -= count_breaks_between_classes(schedule, sections)
    if preferences.get("more_online_classes", False):
        score += count_online_classes(schedule, sections)

    return score


def count_days_with_scheduled_classes(schedule: dict[str, list[str]], sections: dict[str, Section]) -> list[dict]:
    """Count the number of days a student has scheduled classes."""

    time_bitmap = get_schedule_time_bitmap(schedule, sections)
    days_on_campus = 0

    for day in TimeBitmap.DAYS:
        mask = DAY_BITMAPS[day]
        if time_bitmap & mask:
            days_on_campus += 1

    return days_on_campus


def count_breaks_between_classes(schedule: dict[str, list[str]], sections: dict[str, Section]) -> list[dict]:
    """Count the number of breaks (10-minute intervals) between classes for a given schedule."""

    time_bitmap = get_schedule_time_bitmap(schedule, sections)
    breaks_between_classes = 0

    for day in TimeBitmap.DAYS:
        mask = DAY_BITMAPS[day]
        mask &= time_bitmap
        if mask:
            breaks_between_classes += bin(mask.bitmap)[2:].strip("0").count("0")

    return breaks_between_classes


def count_online_classes(schedule: dict[str, list[str]], sections: dict[str, Section]) -> list[dict]:
    """Count the number of online classes in a schedule."""

    online_classes = 0
    
    for crns in schedule.values():
        for crn in crns:
            section = sections[crn]
            if section.campus_description == "OT-Online":
                online_classes += 1

    return online_classes
            

def get_schedule_time_bitmap(schedule: dict[str, list[str]], sections: dict[str, Section]) -> TimeBitmap:
    """Get the time bitmap of a schedule."""
    time_bitmap = TimeBitmap()

    for crns in schedule.values():
        for crn in crns:
            section = sections[crn]
            time_bitmap |= section.get_time_bitmap()

    return time_bitmap