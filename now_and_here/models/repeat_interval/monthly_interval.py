import json
from datetime import datetime, time
from typing import Self
import re

from pydantic.dataclasses import dataclass


def _make_ordinal(n):
    """
    Convert an integer into its ordinal representation::

        make_ordinal(0)   => '0th'
        make_ordinal(3)   => '3rd'
        make_ordinal(122) => '122nd'
        make_ordinal(213) => '213th'
    From https://stackoverflow.com/a/50992575/7191513
    """
    n = int(n)
    if 11 <= (n % 100) <= 13:
        suffix = "th"
    else:
        suffix = ["th", "st", "nd", "rd", "th"][min(n % 10, 4)]
    return str(n) + suffix


@dataclass
class MonthlyInterval:
    months: int = 1
    day: int | None = None
    at: time | None = None
    # Unfortunately we have to override match_args so that this class conforms to the
    # RepeatInterval protocol.
    __match_args__ = ()

    def next(self, current: datetime) -> datetime:
        raise NotImplementedError

    def previous(self, current: datetime) -> datetime:
        raise NotImplementedError

    @classmethod
    def try_parse(cls, text: str) -> Self | None:
        month_pattern = r"(?:month|\s*(?P<months>\d+) months?)"
        at_pattern = r"(?P<hours>\d+)(?::(?P<minutes>\d+))?\s*(?P<ampm>am|pm)?"
        day_pattern = r"(?P<day>\d+)(?:st|nd|rd|th)"
        day_of_month_pattern = fr"({day_pattern})?(?P<last>\s*last)?( day)?"
        patterns = [
            # Strings like "every 3 months" or "every month at 3:00 PM"
            f"every {month_pattern}(?: at {at_pattern})?",
            # Strings like "3:00 every 3 months"
            f"{at_pattern}\\s*every {month_pattern}",
            # Strings like "the 1st of every month" or "the last day of every third month"
            f"(the )?{day_of_month_pattern} (of )?every {month_pattern}(?: at {at_pattern})?",
        ]
        for pattern in patterns:
            match = re.match(pattern, text.lower())
            if match:
                months_match = match.group("months")
                months = int(months_match) if months_match is not None else 1
                at = None
                if match.group("hours") is not None:
                    hour = int(match.group("hours"))
                    minute = int(match.group("minutes") or "0")
                    if hour == 12:
                        if match.group("ampm") == "am":
                            hour = 0
                    elif 0 < hour < 12 and match.group("ampm") == "pm":
                        hour += 12
                    at = time(hour, minute)
                if match.groupdict().get("day") is not None:
                    day = int(match.group("day"))
                    if match.group("last") is not None:
                        day = -day
                    return cls(months=months, day=day, at=at)
                elif match.groupdict().get("last") is not None:
                    # The word "day" may be ommitted in this case,
                    # e.g. "the last [day] of every month"
                    return cls(months=months, day=-1, at=at)
                return cls(months=months, at=at)
        return None

    def as_json(self) -> str:
        data = {
            "kind": "MonthlyInterval",
            "months": self.months,
            "day": self.day,
            "at": self.at.isoformat() if self.at else None,
        }
        return json.dumps(data)

    def __str__(self) -> str:
        s = f"every {self.months} months"
        match self.day:
            case int(i) if i > 0:
                s += f" on the {_make_ordinal(i)}"
            case -1:
                s += " on the last day"
            case int(i) if i < -1:
                s += f" on the {_make_ordinal(abs(i))} to last day"
            case _:
                pass
        if self.at is not None:
            s += f" at {self.at.strftime('%H:%M')}"
        return s
