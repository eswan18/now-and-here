# Parse strings like: "every week", "every 3 weeks on Tuesday and Thursday",
# "every 2 weeks at 3:00pm", "8:00 every 4 weeks on Monday, Sunday, and Thursday"

from datetime import time

import pytest

from now_and_here.models.repeat_interval import WeeklyInterval
from now_and_here.models.repeat_interval.weekly_interval import Weekday


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every week", WeeklyInterval(weeks=1, at=None)),
        ("every 1 week", WeeklyInterval(weeks=1, at=None)),
        ("every 3 weeks", WeeklyInterval(weeks=3, at=None)),
    ],
)
def test_try_parse_just_week_interval_valid(text: str, interval: WeeklyInterval):
    assert WeeklyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every week at 3:00", WeeklyInterval(weeks=1, at=time(3, 0))),
        # ("3:00 every 4 weeks", WeeklyInterval(weeks=4, at=time(3, 0))),
        ("every 2 weeks at 15:00", WeeklyInterval(weeks=2, at=time(15, 0))),
        # ("15:00 every 2 weeks", WeeklyInterval(weeks=2, at=time(15, 0))),
    ],
)
def test_try_parse_day_and_time_interval_valid(text: str, interval: WeeklyInterval):
    assert WeeklyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every 2 weeks at 3:00", WeeklyInterval(weeks=2, at=time(3, 0))),
        ("every 2 weeks at 3:00 am", WeeklyInterval(weeks=2, at=time(3, 0))),
        ("every 2 weeks at 3:00am", WeeklyInterval(weeks=2, at=time(3, 0))),
        ("every 2 weeks at 3:00 pm", WeeklyInterval(weeks=2, at=time(15, 0))),
        ("every 2 weeks at 3:00pm", WeeklyInterval(weeks=2, at=time(15, 0))),
        # ("3:00 pm every 2 days", WeeklyInterval(weeks=2, at=time(15, 0))),
        ("every week at 12:00 pm", WeeklyInterval(weeks=1, at=time(12, 0))),
        ("every week at 12:00pm", WeeklyInterval(weeks=1, at=time(12, 0))),
        ("every week at 12:00am", WeeklyInterval(weeks=1, at=time(0, 0))),
        # ("12:00 am every day", WeeklyInterval(weeks=1, at=time(0, 0))),
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
        (
            "every 2 weeks on Monday, Sunday, and Thursday",
            WeeklyInterval(
                weeks=2, weekdays={Weekday.MONDAY, Weekday.SUNDAY, Weekday.THURSDAY}
            ),
        ),
    ],
)
def test_try_parse_weekdays_valid(text: str, interval: WeeklyInterval):
    assert WeeklyInterval.try_parse(text) == interval
