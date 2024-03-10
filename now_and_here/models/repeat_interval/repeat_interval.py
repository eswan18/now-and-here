from datetime import datetime
from abc import ABC, abstractmethod
from typing import Self

from pydantic.dataclasses import dataclass

# Some intervals I need to support:
# "Regular"
# - Every day
# - Every week on certain weekdays (weekly on MTWTF but not Saturday or Sunday)
# - Every week (weekly on tuesdays)
# - Every month (monthly on the 3rd of the month)
# - The last day of every month (this is a special case of the above)
# - Every year (yearly on March 23rd)

# "Counting intervals"
# - every 4 hours
# - every 3 days
# - every 2 weeks
# - every 3 months
# - every 2 years


# Even though this abstract class has no data, it must be marked as a pydantic dataclass
# because its subclasses are as well. Without this decorator, we get errors when the
# other classes are created.
@dataclass
class RepeatInterval(ABC):
    @abstractmethod
    def next(self, current: datetime) -> datetime:
        """Get the next occurrence of this interval after the given datetime."""
        pass

    @abstractmethod
    def previous(self, current: datetime) -> datetime:
        """Get the previous occurrence of this interval before the given datetime."""
        pass

    @classmethod
    @abstractmethod
    def try_parse(cls: type[Self], text: str) -> Self | None:
        """Try to parse a string into this repeat interval."""
        pass
