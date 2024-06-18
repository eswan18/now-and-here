from datetime import time

import pytest

from now_and_here.models.repeat_interval import (
    DailyInterval,
    MonthlyInterval,
    RepeatIntervalModel,
    RepeatIntervalType,
    WeeklyInterval,
)
from now_and_here.models.repeat_interval.weekly_interval import Weekday

intervals = [
    DailyInterval(days=1),
    DailyInterval(days=3, at=time(4, 0)),
    WeeklyInterval(weeks=1),
    WeeklyInterval(weeks=2, at=time(3, 0)),
    WeeklyInterval(
        weeks=3, weekdays={Weekday.FRIDAY, Weekday.SUNDAY}, at=time(18, 18, 18)
    ),
    MonthlyInterval(months=1),
    MonthlyInterval(months=2, day=14),
    MonthlyInterval(months=1, day=-1, at=time(12, 0)),
]


@pytest.mark.parametrize("interval", intervals)
def test_serialize(interval: RepeatIntervalType):
    serialized = interval.model_dump_json()
    deserialized = RepeatIntervalModel.validate_json(serialized)
    assert interval == deserialized
