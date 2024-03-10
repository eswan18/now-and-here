from datetime import time

import pytest

from now_and_here.models.repeat_interval import DailyInterval


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every day", DailyInterval(days=1, at=None)),
        ("every 1 day", DailyInterval(days=1, at=None)),
        ("every 3 days", DailyInterval(days=3, at=None)),
    ],
)
def test_try_parse_just_day_interval(text: str, interval: DailyInterval):
    assert DailyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every day at 3:00", DailyInterval(days=1, at=time(3, 0))),
        ("every 2 days at 15:00", DailyInterval(days=2, at=time(15, 0))),
    ],
)
def test_try_parse_day_and_time_interval_valid(text: str, interval: DailyInterval):
    assert DailyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every 2 days at 3:00", DailyInterval(days=2, at=time(3, 0))),
        ("every 2 days at 3:00 am", DailyInterval(days=2, at=time(3, 0))),
        ("every 2 days at 3:00 pm", DailyInterval(days=2, at=time(15, 0))),
        ("every day at 12:00 pm", DailyInterval(days=1, at=time(12, 0))),
        ("every day at 12:00 am", DailyInterval(days=1, at=time(0, 0))),
    ],
)
def test_try_parse_am_pm_valid(text: str, interval: DailyInterval):
    assert DailyInterval.try_parse(text) == interval
