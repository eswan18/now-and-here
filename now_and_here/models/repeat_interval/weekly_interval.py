import json
from datetime import datetime, time, timedelta
from typing import Self, Any
from enum import Enum
import re

from pydantic.dataclasses import dataclass, Field


class Weekday(Enum):
    SUNDAY = 0
    MONDAY = 1
    TUESDAY = 2
    WEDNESDAY = 3
    THURSDAY = 4
    FRIDAY = 5
    SATURDAY = 6


@dataclass
class WeeklyInterval:
    weeks: int = 1
    weekdays: set[Weekday] | None = None
    at: time | None = None
    # Unfortunately we have to override match_args so that this class conforms to the
    # RepeatInterval protocol.
    __match_args__ = ()

    @classmethod
    def try_parse(cls, text: str) -> Self | None:
        # Parse strings like: "every week", "every 3 weeks on Tuesday and Thursday",
        # "every 2 weeks at 3:00pm", "8:00 every 4 weeks on Monday, Sunday, and Thursday"
        week_pattern = r"every (?:week|\s*(\d+) weeks?)"
        on_pattern = r"on (\w+(?:(?:,)\s(?:and\s+)?+\w+)*)"
        at_pattern = r"at (\d+)(?::(\d+))?\s*(am|pm)?"
        pattern = f"{week_pattern}(?: {on_pattern})?(?: {at_pattern})?"
        match = re.match(pattern, text.lower())
        if match:
            weeks = match.group(1)
            weeks = int(weeks) if weeks is not None else 1
            weekday_str: str | None = match.group(2)
            if weekday_str is not None:
                weekday_str = weekday_str.replace("and", "").replace(",", " ").strip()
                weekday_names = [w.upper() for w in weekday_str.split(" ") if w != ""]
                weekdays = {Weekday[w.upper()] for w in weekday_names}
            else:
                weekdays = None
            at = None
            if match.group(3) is not None:
                hour = int(match.group(3))
                minute = int(match.group(4) or "0")
                if hour == 12:
                    if match.group(5) == "am":
                        hour = 0
                elif 0 < hour < 12 and match.group(5) == "pm":
                    hour += 12
                at = time(hour, minute)
            return cls(weeks=weeks, weekdays=weekdays, at=at)
        return None

    def as_json(self) -> str:
        data = {
            "kind": "WeeklyInterval",
            "weeks": self.weeks,
            "weekdays": [weekday.name for weekday in self.weekdays]
            if self.weekdays
            else None,
            "at": self.at.isoformat() if self.at else None,
        }
        return json.dumps(data)

    def __str__(self) -> str:
        s = f"every {self.weeks} weeks"
        if self.weekdays:
            s += " on " + ", ".join(weekday.name for weekday in self.weekdays)
        if self.at:
            s += f" at {self.at.strftime('%I:%M %p')}"
        return s
