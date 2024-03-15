from datetime import datetime, timedelta
from typing import Callable

import dateparser
from rich.text import Text
from tzlocal import get_localzone
from zoneinfo import ZoneInfo

from now_and_here.console import console


def relative_time(
    dt: datetime, today: datetime | Callable[..., datetime] = datetime.now
) -> str:
    # If today is a callable, call it to get the current date.
    if callable(today):
        today = today()
    # If today doesn't have a timezone, assume it's local time.
    if today.tzinfo is None:
        today = today.replace(tzinfo=get_localzone())
    if dt > today:
        delta_str = _timedelta_to_str(dt - today)
        return f"in {delta_str}"
    else:
        delta_str = _timedelta_to_str(today - dt)
        return f"{delta_str} ago"


def _timedelta_to_str(delta: timedelta) -> str:
    """Convert a timedelta to a human-readable string."""
    if delta < timedelta():
        # Don't allow negative deltas.
        raise ValueError(f"delta must be positive, got {delta}")
    if delta > timedelta(days=2):
        return f"{delta.days} days"
    if delta > timedelta(hours=1, minutes=30):
        return f"{delta.days * 24 + delta.seconds // 3600} hours"
    return f"{delta.seconds // 60} minutes"


def parse_time(
    input: str, warn_on_past: bool = False, tz: ZoneInfo | None = None
) -> datetime:
    """Parse user input into a datetime and convert it to UTC."""
    if tz is None:
        tz = get_localzone()
    date = dateparser.parse(input, settings={"PREFER_DATES_FROM": "future"})
    if date is None:
        raise ValueError(f"Could not parse date: {input}")
    # Mark the date as local time with .astimezone, then convert it to UTC.
    date = date.replace(tzinfo=tz).astimezone(ZoneInfo("UTC"))
    if warn_on_past and date < datetime.now(tz=ZoneInfo("UTC")):
        warning = Text(
            f"Warning: parsed date is in the past. ({date})\n"
            "This is probably not what you want.",
            style="bold red",
        )
        console.print(warning, highlight=False)
    return date


def format_time(dt: datetime) -> str:
    """Format a datetime in a user-friendly way, accounting for timezone."""
    # Convert from UTC to local time.
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=ZoneInfo("UTC"))
    dt = dt.astimezone(get_localzone())
    return dt.strftime("%Y-%m-%d %H:%M")
