import json

from .repeat_interval import RepeatInterval
from .daily_interval import DailyInterval
from .weekly_interval import WeeklyInterval, Weekday


def try_parse(text: str) -> RepeatInterval | None:
    """Try to parse a string into a repeat interval."""
    interval: RepeatInterval | None  # This helps mypy not get confused.
    if interval := DailyInterval.try_parse(text):
        return interval
    if interval := WeeklyInterval.try_parse(text):
        return interval
    return None


def parse_json(text: str) -> RepeatInterval:
    """Parse a repeat interval from JSON data."""
    data = json.loads(text)
    kind = data["kind"]
    match kind:
        case "DailyInterval":
            return DailyInterval(days=data["days"], at=data["at"])
        case "WeeklyInterval":
            weekday_strings: list[str] | None = data.get("weekdays")
            if weekday_strings is not None:
                weekdays = {Weekday[w.upper()] for w in weekday_strings}
            else:
                weekdays = None
            return WeeklyInterval(weeks=data["weeks"], weekdays=weekdays, at=data["at"])
        case _:
            raise ValueError(f"Unknown repeat interval kind: {kind}")
