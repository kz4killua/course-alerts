from datetime import datetime, timedelta


def _get_time_slots(start_time: str, end_time: str, increment: int) -> list[tuple[str, str]]:
    """Return a list of time slots between the start and end times."""
    
    time_slots = []

    start_time = datetime.strptime(start_time, "%H%M")
    end_time = datetime.strptime(end_time, "%H%M")

    a = start_time
    while a < end_time:
        b = a + timedelta(minutes=increment)
        time_slots.append((a.strftime("%H%M"), b.strftime("%H%M")))
        a = b

    return time_slots


class TimeBitmap:
    """A data structure optimized for checking time conflicts"""

    TIME_SLOTS = _get_time_slots("0800", "2200", 10)

    DAYS = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
    ]


    @staticmethod
    def _get_time_indices(start_time: str, end_time: str):
        """Return the bit indices for the start and end times."""

        start_time_index = None
        end_time_index = None

        for i, slot in enumerate(TimeBitmap.TIME_SLOTS):
            if slot[0] == start_time:
                start_time_index = i
            if slot[1] == end_time:
                end_time_index = i

        if start_time_index is None:
            raise ValueError(f"Unrecognized start time: {start_time}.")
        if end_time_index is None:
            raise ValueError(f"Unrecognized end time: {end_time}.")

        return start_time_index, end_time_index
    

    @staticmethod
    def _get_day_index(day: str):
        """Return the bit index for the day."""
        index = TimeBitmap.DAYS.index(day)
        if index != -1:
            return index
        else:
            raise ValueError(f"Unrecognized day: {day}.")


    @staticmethod
    def _create_bitmap(start_time_index: int, end_time_index: int, day_index: int):
        """Return the bitmap for the given time range and day."""
        
        # Find the FSB and LSB for the resulting bitmap
        first_set_bit = start_time_index + (day_index * len(TimeBitmap.TIME_SLOTS))
        last_set_bit = end_time_index + (day_index * len(TimeBitmap.TIME_SLOTS))

        # Create the bitmap, setting all bits from first_set_bit to last_set_bit
        bitmap = (1 << (last_set_bit - first_set_bit + 1)) - 1
        bitmap <<= first_set_bit

        return bitmap
    

    def __init__(self, bitmap: int = 0):
        self.bitmap = bitmap


    def __hash__(self) -> int:
        return self.bitmap
    

    def __eq__(self, other: 'TimeBitmap') -> bool:
        return self.bitmap == other.bitmap
    

    def __and__(self, other: 'TimeBitmap') -> 'TimeBitmap':
        """Return the intersection of the two meeting times."""
        return TimeBitmap(self.bitmap & other.bitmap)
    

    def __or__(self, other: 'TimeBitmap') -> 'TimeBitmap':
        """Return the union of the two meeting times."""
        return TimeBitmap(self.bitmap | other.bitmap)
    

    def __bool__(self) -> bool:
        return bool(self.bitmap)
    

    def __repr__(self) -> str:
        return f"TimeBitmap({hex(self.bitmap)})"
    

    @classmethod
    def from_begin_and_end_time(cls, begin_time: str, end_time: str, day: str) -> 'TimeBitmap':
        start_time_index, end_time_index = cls._get_time_indices(begin_time, end_time)
        day_index = cls._get_day_index(day)
        bitmap = cls._create_bitmap(start_time_index, end_time_index, day_index)
        return cls(bitmap)
    

    @staticmethod
    def overlaps(*time_bitmaps: list['TimeBitmap']) -> bool:
        """Return True if any of the given times overlap."""
        x = TimeBitmap()
        for t in time_bitmaps:
            if x & t:
                return True
            x |= t
        return False