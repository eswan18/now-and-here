from typing import Annotated

from pydantic import Field, TypeAdapter

from .daily_interval import DailyInterval
from .monthly_interval import MonthlyInterval
from .weekly_interval import WeeklyInterval

RepeatIntervalType = Annotated[
    DailyInterval | WeeklyInterval | MonthlyInterval, Field(discriminator="kind")
]
RepeatIntervalModel = TypeAdapter(RepeatIntervalType)
