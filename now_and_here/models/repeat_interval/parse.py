from .repeat_interval import RepeatInterval
from .daily_interval import DailyInterval

def try_parse(text: str) -> RepeatInterval | None:
    """Try to parse a string into a repeat interval."""
    if interval := DailyInterval.try_parse(text):
        return interval
    return None