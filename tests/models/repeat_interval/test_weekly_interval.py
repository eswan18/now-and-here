from datetime import datetime, time

import pytest

from now_and_here.models.repeat_interval import WeeklyInterval
from now_and_here.models.repeat_interval.weekly_interval import (
    DEFAULT_TIME,
    DEFAULT_WEEKDAY,
    Weekday,
)


@pytest.mark.parametrize(
    "text,interval",
    [
        (
            "every week",
            WeeklyInterval(weeks=1, weekdays={DEFAULT_WEEKDAY}, at=DEFAULT_TIME),
        ),
        (
            "every 1 week",
            WeeklyInterval(weeks=1, weekdays={DEFAULT_WEEKDAY}, at=DEFAULT_TIME),
        ),
        (
            "every 3 weeks",
            WeeklyInterval(weeks=3, weekdays={DEFAULT_WEEKDAY}, at=DEFAULT_TIME),
        ),
    ],
)
def test_try_parse_just_week_interval_valid(text: str, interval: WeeklyInterval):
    assert WeeklyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        (
            "every week at 3:00",
            WeeklyInterval(weeks=1, weekdays={DEFAULT_WEEKDAY}, at=time(3, 0)),
        ),
        (
            "3:00 every 4 weeks",
            WeeklyInterval(weeks=4, weekdays={DEFAULT_WEEKDAY}, at=time(3, 0)),
        ),
        (
            "every 2 weeks at 15:00",
            WeeklyInterval(weeks=2, weekdays={DEFAULT_WEEKDAY}, at=time(15, 0)),
        ),
        (
            "15:00 every 2 weeks",
            WeeklyInterval(weeks=2, weekdays={DEFAULT_WEEKDAY}, at=time(15, 0)),
        ),
    ],
)
def test_try_parse_day_and_time_interval_valid(text: str, interval: WeeklyInterval):
    assert WeeklyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        (
            "every 2 weeks at 3:00",
            WeeklyInterval(weeks=2, weekdays={DEFAULT_WEEKDAY}, at=time(3, 0)),
        ),
        (
            "every 2 weeks at 3:00 am",
            WeeklyInterval(weeks=2, weekdays={DEFAULT_WEEKDAY}, at=time(3, 0)),
        ),
        (
            "every 2 weeks at 3:00am",
            WeeklyInterval(weeks=2, weekdays={DEFAULT_WEEKDAY}, at=time(3, 0)),
        ),
        (
            "every 2 weeks at 3:00 pm",
            WeeklyInterval(weeks=2, weekdays={DEFAULT_WEEKDAY}, at=time(15, 0)),
        ),
        (
            "every 2 weeks at 3:15",
            WeeklyInterval(weeks=2, weekdays={DEFAULT_WEEKDAY}, at=time(3, 15)),
        ),
        (
            "3:15 pm every 2 weeks",
            WeeklyInterval(weeks=2, weekdays={DEFAULT_WEEKDAY}, at=time(15, 15)),
        ),
        (
            "every week at 12:00 pm",
            WeeklyInterval(weeks=1, weekdays={DEFAULT_WEEKDAY}, at=time(12, 0)),
        ),
        (
            "every week at 12:00pm",
            WeeklyInterval(weeks=1, weekdays={DEFAULT_WEEKDAY}, at=time(12, 0)),
        ),
        (
            "every week at 12:00am",
            WeeklyInterval(weeks=1, weekdays={DEFAULT_WEEKDAY}, at=time(0, 0)),
        ),
        (
            "12:00 am every week",
            WeeklyInterval(weeks=1, weekdays={DEFAULT_WEEKDAY}, at=time(0, 0)),
        ),
    ],
)
def test_try_parse_am_pm_valid(text: str, interval: WeeklyInterval):
    assert WeeklyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        (
            "every week on Saturday",
            WeeklyInterval(weeks=1, weekdays={Weekday.SATURDAY}),
        ),
        ("every Saturday", WeeklyInterval(weeks=1, weekdays={Weekday.SATURDAY})),
        (
            "Monday, Sunday, and Thursday every 2 weeks",
            WeeklyInterval(
                weeks=2, weekdays={Weekday.MONDAY, Weekday.SUNDAY, Weekday.THURSDAY}
            ),
        ),
        (
            "every 2 weeks on Monday, Sunday, and Thursday",
            WeeklyInterval(
                weeks=2, weekdays={Weekday.MONDAY, Weekday.SUNDAY, Weekday.THURSDAY}
            ),
        ),
        (
            "every 3 weeks on Tuesday and Wednesday at 3pm",
            WeeklyInterval(
                weeks=3, weekdays={Weekday.TUESDAY, Weekday.WEDNESDAY}, at=time(15, 0)
            ),
        ),
        (
            "3pm every 3 weeks on Tuesday and Wednesday",
            WeeklyInterval(
                weeks=3, weekdays={Weekday.TUESDAY, Weekday.WEDNESDAY}, at=time(15, 0)
            ),
        ),
        (
            "Saturday and Wednesday every 3 weeks",
            WeeklyInterval(weeks=3, weekdays={Weekday.SATURDAY, Weekday.WEDNESDAY}),
        ),
        (
            "Saturday and Sunday at 7am",
            WeeklyInterval(
                weeks=1, weekdays={Weekday.SATURDAY, Weekday.SUNDAY}, at=time(7, 0)
            ),
        ),
        (
            "Saturday and Sunday and Monday at 2:30pm every 3 weeks",
            WeeklyInterval(
                weeks=3,
                weekdays={Weekday.SATURDAY, Weekday.SUNDAY, Weekday.MONDAY},
                at=time(14, 30),
            ),
        ),
    ],
)
def test_try_parse_weekdays_valid(text: str, interval: WeeklyInterval):
    assert WeeklyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "interval,next",
    [
        (WeeklyInterval(weeks=1), datetime(2024, 1, 8, 15, 15)),
        (WeeklyInterval(weeks=2), datetime(2024, 1, 15, 15, 15)),
        (WeeklyInterval(weeks=3), datetime(2024, 1, 22, 15, 15)),
        (WeeklyInterval(weeks=4), datetime(2024, 1, 29, 15, 15)),
        (
            WeeklyInterval(weeks=1, weekdays={Weekday.MONDAY}),
            datetime(2024, 1, 8, 15, 15),
        ),
        (
            WeeklyInterval(weeks=2, weekdays={Weekday.MONDAY}),
            datetime(2024, 1, 15, 15, 15),
        ),
        (
            WeeklyInterval(weeks=3, weekdays={Weekday.MONDAY}),
            datetime(2024, 1, 22, 15, 15),
        ),
        (
            WeeklyInterval(weeks=4, weekdays={Weekday.MONDAY}),
            datetime(2024, 1, 29, 15, 15),
        ),
        (
            WeeklyInterval(weeks=1, weekdays={Weekday.MONDAY, Weekday.TUESDAY}),
            datetime(2024, 1, 2, 15, 15),
        ),
        (
            WeeklyInterval(weeks=1, weekdays={Weekday.MONDAY, Weekday.WEDNESDAY}),
            datetime(2024, 1, 3, 15, 15),
        ),
        (
            WeeklyInterval(weeks=1, weekdays={Weekday.MONDAY, Weekday.THURSDAY}),
            datetime(2024, 1, 4, 15, 15),
        ),
        (
            WeeklyInterval(weeks=1, weekdays={Weekday.MONDAY, Weekday.FRIDAY}),
            datetime(2024, 1, 5, 15, 15),
        ),
        (
            WeeklyInterval(weeks=1, weekdays={Weekday.MONDAY, Weekday.SATURDAY}),
            datetime(2024, 1, 6, 15, 15),
        ),
        (
            WeeklyInterval(weeks=1, weekdays={Weekday.MONDAY, Weekday.SUNDAY}),
            datetime(2024, 1, 7, 15, 15),
        ),
    ],
)
def test_next(interval, next):
    current = datetime(2024, 1, 1, 15, 15)
    assert interval.next(current) == next
