from django.test import TestCase

from courses.scheduling.time_bitmap import TimeBitmap


class TestTimeBitmap(TestCase):

    def test_overlaps(self):

        tb1 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        tb2 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'tuesday')
        self.assertFalse(TimeBitmap.overlaps(tb1, tb2))

        tb1 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        tb2 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        self.assertTrue(TimeBitmap.overlaps(tb1, tb2))

        tb1 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        tb2 = TimeBitmap.from_begin_and_end_time('0940', '1100', 'monday')
        self.assertFalse(TimeBitmap.overlaps(tb1, tb2))

        tb1 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        tb1 |= TimeBitmap.from_begin_and_end_time('0810', '0930', 'wednesday')
        tb2 = TimeBitmap.from_begin_and_end_time('0840', '0930', 'tuesday')
        tb2 |= TimeBitmap.from_begin_and_end_time('0840', '0930', 'wednesday')
        self.assertTrue(TimeBitmap.overlaps(tb1, tb2))

        tb1 = TimeBitmap.from_begin_and_end_time('0810', '0930', 'monday')
        tb1 |= TimeBitmap.from_begin_and_end_time('0810', '0930', 'wednesday')
        tb2 = TimeBitmap.from_begin_and_end_time('0840', '0930', 'tuesday')
        tb2 |= TimeBitmap.from_begin_and_end_time('0840', '0930', 'thursday')
        self.assertFalse(TimeBitmap.overlaps(tb1, tb2))