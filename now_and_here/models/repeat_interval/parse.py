from typing import Any

from .repeat_interval import RepeatInterval
from .daily_interval import DailyInterval


def try_parse(text: str) -> RepeatInterval | None:
    """Try to parse a string into a repeat interval."""
    if interval := DailyInterval.try_parse(text):
        return interval
    return None


def parse_json(data: dict[str, Any]) -> RepeatInterval:
    """Parse a repeat interval from JSON data."""
    kind = data["kind"]
    match kind:
        case "DailyInterval":
            return DailyInterval(days=data["days"], at=data["at"])
        case _:
            raise ValueError(f"Unknown repeat interval kind: {kind}")
