from __future__ import annotations
import functools
import json
from datetime import datetime, time, timedelta
from typing import Self
from enum import Enum
import re

from pydantic.dataclasses import dataclass


@functools.total_ordering
class Weekday(Enum):
    MONDAY = 0
    TUESDAY = 1
    WEDNESDAY = 2
    THURSDAY = 3
    FRIDAY = 4
    SATURDAY = 5
    SUNDAY = 6

    def __str__(self) -> str:
        return self.name.title()

    def __lt__(self, other: Weekday) -> bool:
        return self.value < other.value


@dataclass
class WeeklyInterval:
    weeks: int = 1
    weekdays: set[Weekday] | None = None
    at: time | None = None
    # Unfortunately we have to override match_args so that this class conforms to the
    # RepeatInterval protocol.
    __match_args__ = ()

    def next(self, current: datetime) -> datetime:
        at = self.at
        if at is None:
            at = current.time()
        current_weekday = Weekday(current.weekday())
        if self.weekdays is not None:
            weekdays = sorted(list(self.weekdays))
        else:
            # Get the day of the week that the current date is on
            weekdays = [current_weekday]
        if current_weekday not in weekdays:
            raise ValueError(
                f"The current day of the week ({current.weekday()}) is not in the list "
                f"of repeating weekdays ({weekdays})"
            )
        # If we're on the last repeating day of the week, we need to skip to the "next"
        # valid week before searching for the next included weekday. If we repeat every
        # week, that means doing nothing. If we repeat on a longer interval than that,
        # we need to skip over some weeks.
        if current_weekday >= weekdays[-1] and self.weeks > 1:
            current = current + timedelta(weeks=self.weeks - 1)
        while True:
            current = current + timedelta(days=1)
            if Weekday(current.weekday()) in weekdays:
                return current

    def previous(self, current: datetime) -> datetime:
        raise NotImplementedError

    @classmethod
    def try_parse(cls, text: str) -> Self | None:
        week_pattern = r"(?:week|\s*(?P<weeks>\d+) weeks?)"
        weekday_name_pattern = "(" + "|".join(w.name.lower() for w in Weekday) + ")"
        on_pattern = rf"(?P<weekdays>{weekday_name_pattern}+(?:(?:,)?\s(?:and\s+)?{weekday_name_pattern}+)*)"
        at_pattern = r"(?P<at>(?P<hours>\d+)(?::(?P<minutes>\d+))?\s*(?P<ampm>am|pm)?)"

        patterns = [
            # Strings like: "every week", "every 3 weeks on Tuesday and Thursday",
            # "every 2 weeks at 3:00pm", "8:00 every 4 weeks on Monday, Sunday, and Thursday"
            f"every {week_pattern}(?: on {on_pattern})?(?: at {at_pattern})?$",
            # Strings like "3:00 pm every 2 weeks" or "12:00 every week on Tuesday, Wednesday, and Thursday"
            f"{at_pattern}\\s*every {week_pattern}(?: on {on_pattern})?$",
            # Strings like "every Friday and Saturday at 3:00pm"
            f"every {on_pattern}(?: at {at_pattern})?$",
            # "Sunday and Tuesday every week"
            f"{on_pattern}(?: every {week_pattern})$",
            # "Sunday and Tuesday at 4:15pm"
            f"{on_pattern}(?: at {at_pattern})$",
            # "Saturday, Sunday, and Monday every 2 weeks at 3:00pm"
            # Having the $ sign is necessary to avoid this pattern scooping up longer, better matches.
            f"{on_pattern}(?: every {week_pattern})?(?: at {at_pattern})$",
            # Strings like "Saturday at 1am every 4 weeks"
            # Having the $ sign is necessary to avoid this pattern scooping up longer, better matches.
            f"{on_pattern}(?: at {at_pattern})?(?: every {week_pattern})$",
        ]

        for pattern in patterns:
            match = re.match(pattern, text.lower())
            if match:
                # Extract
                weeks_match = match.groupdict().get("weeks", "1")
                weekday_match: str | None = match.group("weekdays")
                hours_match = match.groupdict().get("hours", None)
                # Parse
                weeks = int(weeks_match) if weeks_match is not None else 1
                if weekday_match is not None:
                    weekday_match = (
                        weekday_match.replace("and", "").replace(",", " ").strip()
                    )
                    weekday_names = [
                        w.upper() for w in weekday_match.split(" ") if w != ""
                    ]
                    weekdays = {Weekday[w.upper()] for w in weekday_names}
                else:
                    weekdays = None
                at = None
                if hours_match is not None:
                    minutes_match = match.group("minutes")
                    ampm_match = match.group("ampm")
                    hour = int(hours_match)
                    minute = int(minutes_match or "0")
                    if hour == 12:
                        if ampm_match == "am":
                            hour = 0
                    elif 0 < hour < 12 and ampm_match == "pm":
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
            s += " on " + ", ".join(str(w) for w in self.weekdays)
        if self.at:
            s += f" at {self.at.strftime('%H:%M')}"
        return s
