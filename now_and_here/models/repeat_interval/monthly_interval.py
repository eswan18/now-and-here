import calendar
import json
import re
from datetime import datetime, time
from typing import Literal, Self

from pydantic import BaseModel

DEFAULT_DAY = 1
DEFAULT_TIME = time(9, 0)


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


class MonthlyInterval(BaseModel):
    kind: Literal["monthly"] = "monthly"
    months: int = 1
    day: int = DEFAULT_DAY
    at: time = DEFAULT_TIME
    # Unfortunately we have to override match_args so that this class conforms to the
    # RepeatInterval protocol.
    __match_args__ = ()

    def next(self, current: datetime) -> datetime:
        # Get the number of days in the current month
        if self.day > 0:
            looking_for_day = self.day
        else:
            # Count backward from the end of the current month
            _, days_in_month = calendar.monthrange(current.year, current.month)
            looking_for_day = days_in_month + (self.day + 1)
        looking_for_dt = datetime(current.year, current.month, looking_for_day)
        looking_for_dt.replace(hour=self.at.hour, minute=self.at.minute)
        if current <= looking_for_dt:
            return looking_for_dt
        else:
            new_year, new_month = current.year, current.month
            new_month += self.months
            if new_month > 12:
                new_year += new_month // 12
                new_month = new_month % 12
            if self.day > 0:
                return datetime(
                    new_year, new_month, self.day, self.at.hour, self.at.minute
                )
            else:
                _, days_in_new_month = calendar.monthrange(new_year, new_month)
                new_day = days_in_new_month + (self.day + 1)
                return datetime(
                    new_year, new_month, new_day, self.at.hour, self.at.minute
                )

    def previous(self, current: datetime) -> datetime:
        raise NotImplementedError

    @classmethod
    def try_parse(cls, text: str) -> Self | None:
        day = DEFAULT_DAY
        at = DEFAULT_TIME

        month_pattern = r"(?:month|\s*(?P<months>\d+) months?)"
        at_pattern = r"(?P<hours>\d+)(?::(?P<minutes>\d+))?\s*(?P<ampm>am|pm)?"
        day_pattern = r"(?P<day>\d+)(?:st|nd|rd|th)"
        day_of_month_pattern = rf"({day_pattern})?(?P<last>\s*last)?( day)?"
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
                elif match.groupdict().get("last") is not None:
                    # The word "day" may be ommitted in this case,
                    # e.g. "the last [day] of every month"
                    day = -1
                return cls(months=months, day=day, at=at)
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
