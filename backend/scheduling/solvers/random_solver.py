import random
import time

from courses.time_bitmap import TimeBitmap


def get_valid_time_assignments(course_codes: list[str], combinations: dict[str, set[TimeBitmap]], time_limit: int = None, max_solutions: int = None):
    """Generate valid schedules using a random search."""

    valid_schedules = []
    seen = set()

    start_time = time.time()
    while True:

        if time_limit is not None:
            if time.time() - start_time > time_limit:
                break
        if max_solutions is not None:
            if len(valid_schedules) >= max_solutions:
                break

        # Pick a random time bitmap (CRN combination) for each course
        schedule = dict()
        for course_code in course_codes:
            schedule[course_code] = random.choice(list(combinations[course_code]))

        time_bitmaps = tuple(schedule[course_code] for course_code in course_codes)

        if TimeBitmap.overlaps(*time_bitmaps):
            continue
        elif time_bitmaps in seen:
            continue
        else:
            valid_schedules.append(schedule)

            # Keep track of seen schedules to avoid duplicates
            seen.add(time_bitmaps)

    return valid_schedules