import pytz
from datetime import datetime, timedelta
from typing import Callable

import dateparser


def relative_time(
    dt: datetime, today: datetime | Callable[..., datetime] = datetime.now
) -> str:
    # If today is a callable, call it to get the current date.
    if callable(today):
        today = today()
    # If today doesn't have a timezone, assume it's local time.
    if today.tzinfo is None:
        today = today.astimezone(pytz.utc)
    delta = dt - today
    if delta > timedelta(days=2):
        return f"in {delta.days} days"
    if delta > timedelta(hours=1, minutes=30):
        return f"in {delta.seconds // 3600} hours"
    return f"in {delta.seconds // 60} minutes"


def parse_time(input: str) -> datetime:
    """Parse user input into a datetime and converts it to UTC."""
    date = dateparser.parse(input)
    if date is None:
        raise ValueError(f"Could not parse date: {input}")
    # Convert to UTC.
    date = date.astimezone(tz=pytz.utc)
    return date


def format_time(dt: datetime) -> str:
    """Format a datetime in a user-friendly way, accounting for timezone."""
    # Convert from UTC to local time.
    dt = dt.astimezone()
    return dt.strftime("%Y-%m-%d %H:%M")
