from datetime import time

import pytest

from now_and_here.models.repeat_interval import MonthlyInterval
from now_and_here.models.repeat_interval.monthly_interval import (
    DEFAULT_DAY,
    DEFAULT_TIME,
)


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every month", MonthlyInterval(months=1, day=DEFAULT_DAY, at=DEFAULT_TIME)),
        ("every 1 month", MonthlyInterval(months=1, day=DEFAULT_DAY, at=DEFAULT_TIME)),
        ("every 3 months", MonthlyInterval(months=3, day=DEFAULT_DAY, at=DEFAULT_TIME)),
    ],
)
def test_try_parse_inferred_day_valid(text: str, interval: MonthlyInterval):
    assert MonthlyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        ("the 1st of every month", MonthlyInterval(months=1, day=1, at=DEFAULT_TIME)),
        ("the 1st of every month", MonthlyInterval(months=1, day=1, at=DEFAULT_TIME)),
        ("3rd of every month", MonthlyInterval(months=1, day=3, at=DEFAULT_TIME)),
        (
            "the 3rd of every 2 months",
            MonthlyInterval(months=2, day=3, at=DEFAULT_TIME),
        ),
        (
            "the last day of every month",
            MonthlyInterval(months=1, day=-1, at=DEFAULT_TIME),
        ),
    ],
)
def test_try_parse_with_day_valid(text: str, interval: MonthlyInterval):
    assert MonthlyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        (
            "the 1st of every month at 9:00am",
            MonthlyInterval(months=1, day=1, at=time(9, 0)),
        ),
        (
            "the 3rd of every month at 9:00pm",
            MonthlyInterval(months=1, day=3, at=time(21, 0)),
        ),
        (
            "the 3rd of every month at 21:00",
            MonthlyInterval(months=1, day=3, at=time(21, 0)),
        ),
        ("the 3rd every 2 months", MonthlyInterval(months=2, day=3, at=DEFAULT_TIME)),
        (
            "the last day of every month",
            MonthlyInterval(months=1, day=-1, at=DEFAULT_TIME),
        ),
    ],
)
def test_try_parse_with_time_valid(text: str, interval: MonthlyInterval):
    assert MonthlyInterval.try_parse(text) == interval
