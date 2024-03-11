import json
from datetime import datetime, time, timedelta
from typing import Self, Any
import re

from pydantic.dataclasses import dataclass


@dataclass
class DailyInterval:
    days: int = 1
    at: time | None = None
    # Unfortunately we have to override match_args so that this class conforms to the
    # RepeatInterval protocol.
    __match_args__ = ()

    def next(self, current: datetime) -> datetime:
        if self.at is None:
            return current + timedelta(days=self.days)
        else:
            if current.time() > self.at:
                return datetime.combine(
                    current.date() + timedelta(days=self.days), self.at
                )
            else:
                return datetime.combine(current.date(), self.at)

    def previous(self, current: datetime) -> datetime:
        if self.at is None:
            return current - timedelta(days=self.days)
        else:
            if current.time() < self.at:
                return datetime.combine(
                    current.date() - timedelta(days=self.days), self.at
                )
            else:
                return datetime.combine(current.date(), self.at)

    @classmethod
    def try_parse(cls, text: str) -> Self | None:
        # Parse strings like "every day" or "every 3 days" or "every 2 days at 3:00 PM"
        pattern = r"every (?:day|\s*(\d+) days?)(?: at (\d+)(?::(\d+))?\s*(am|pm)?)?"
        match = re.match(pattern, text.lower())
        if match:
            days = match.group(1)
            days = int(days) if days is not None else 1
            at = None
            if match.group(2) is not None:
                hour = int(match.group(2))
                minute = int(match.group(3) or "0")
                if hour == 12:
                    if match.group(4) == "am":
                        hour = 0
                elif 0 < hour < 12 and match.group(4) == "pm":
                    hour += 12
                at = time(hour, minute)
            return cls(days=days, at=at)
        # Parse strings like "3:00 every 4 days" or "3:00 pm every day"
        pattern = r"(\d+):(\d+)\s*(am|pm)?\s*every (?:day|\s*(\d+) days?)"
        match = re.match(pattern, text.lower())
        if match:
            hour = int(match.group(1))
            minute = int(match.group(2))
            days = match.group(4)
            if hour == 12:
                if match.group(3) == "am":
                    hour = 0
            elif 0 < hour < 12 and match.group(3) == "pm":
                hour += 12
            at = time(hour, minute)
            days = int(days) if days else 1
            return cls(days=days, at=at)
        return None

    def as_json(self) -> str:
        data = {
            "kind": "DailyInterval",
            "days": self.days,
            "at": self.at.isoformat() if self.at else None,
        }
        return json.dumps(data)

    def __str__(self) -> str:
        if self.at is None:
            return f"every {self.days} days"
        else:
            return f"every {self.days} days at {self.at.strftime('%I:%M %p')}"
