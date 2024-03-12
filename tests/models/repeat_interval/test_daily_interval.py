from datetime import time

import pytest

from now_and_here.models.repeat_interval import DailyInterval
from now_and_here.models.repeat_interval.daily_interval import DEFAULT_TIME


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every day", DailyInterval(days=1, at=DEFAULT_TIME)),
        ("every 1 day", DailyInterval(days=1, at=DEFAULT_TIME)),
        ("every 3 days", DailyInterval(days=3, at=DEFAULT_TIME)),
    ],
)
def test_try_parse_just_day_interval_valid(text: str, interval: DailyInterval):
    assert DailyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every day at 3:00", DailyInterval(days=1, at=time(3, 0))),
        ("3:00 every 4 days", DailyInterval(days=4, at=time(3, 0))),
        ("every 2 days at 15:00", DailyInterval(days=2, at=time(15, 0))),
        ("15:00 every 2 days", DailyInterval(days=2, at=time(15, 0))),
    ],
)
def test_try_parse_day_and_time_interval_valid(text: str, interval: DailyInterval):
    assert DailyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every 2 days at 3:00", DailyInterval(days=2, at=time(3, 0))),
        ("every 2 days at 3:00 am", DailyInterval(days=2, at=time(3, 0))),
        ("every 2 days at 3:00am", DailyInterval(days=2, at=time(3, 0))),
        ("every 2 days at 3:00 pm", DailyInterval(days=2, at=time(15, 0))),
        ("every 2 days at 3:00pm", DailyInterval(days=2, at=time(15, 0))),
        ("3:00 pm every 2 days", DailyInterval(days=2, at=time(15, 0))),
        ("every day at 12:00 pm", DailyInterval(days=1, at=time(12, 0))),
        ("every day at 12:00pm", DailyInterval(days=1, at=time(12, 0))),
        ("every day at 12:00am", DailyInterval(days=1, at=time(0, 0))),
        ("12:00 am every day", DailyInterval(days=1, at=time(0, 0))),
    ],
)
def test_try_parse_am_pm_valid(text: str, interval: DailyInterval):
    assert DailyInterval.try_parse(text) == interval
