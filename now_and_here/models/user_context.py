import dataclasses

from pydantic.dataclasses import dataclass
from zoneinfo import ZoneInfo


@dataclasses.dataclass
class UserContext:
    """Context about the current user session."""

    timezone: ZoneInfo


@dataclass
class UserContextFE:
    """A UserContext that uses serializable types."""

    timezone: str

    def to_user_context(self) -> UserContext:
        return UserContext(timezone=ZoneInfo(self.timezone))
