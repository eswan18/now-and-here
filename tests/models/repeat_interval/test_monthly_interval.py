from datetime import time

import pytest

from now_and_here.models.repeat_interval import MonthlyInterval


@pytest.mark.parametrize(
    "text,interval",
    [
        ("every month", MonthlyInterval(months=1, day=None, at=None)),
        ("every 1 month", MonthlyInterval(months=1, day=None, at=None)),
        ("every 3 months", MonthlyInterval(months=3, day=None, at=None)),
    ],
)
def test_try_parse_just_month_interval_valid(text: str, interval: MonthlyInterval):
    assert MonthlyInterval.try_parse(text) == interval


@pytest.mark.parametrize(
    "text,interval",
    [
        ("the 1st of every month", MonthlyInterval(months=1, day=1, at=None)),
        ("the 1st of every month", MonthlyInterval(months=1, day=1, at=None)),
        ("3rd of every month", MonthlyInterval(months=1, day=3, at=None)),
        ("the 3rd of every 2 months", MonthlyInterval(months=2, day=3, at=None)),
        ("the last day of every month", MonthlyInterval(months=1, day=-1, at=None)),
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
        ("the 3rd every 2 months", MonthlyInterval(months=2, day=3, at=None)),
        ("the last day of every month", MonthlyInterval(months=1, day=-1, at=None)),
    ],
)
def test_try_parse_with_time_valid(text: str, interval: MonthlyInterval):
    assert MonthlyInterval.try_parse(text) == interval
