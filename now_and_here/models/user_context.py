import re
from typing import Annotated, Any

from pydantic import BaseModel, field_validator
from pydantic_core import core_schema
from zoneinfo import ZoneInfo


class ZoneInfoType:
    @classmethod
    def __get_pydantic_core_schema__(cls, *args, **kwargs):
        def validate(value: Any, _info: core_schema.ValidationInfo) -> ZoneInfo:
            if isinstance(value, ZoneInfo):
                return value
            if isinstance(value, str):
                try:
                    return ZoneInfo(value)
                except Exception as e:
                    raise ValueError(f"Invalid time zone: {value}") from e
            raise TypeError(f"Expected str or ZoneInfo, got {type(value)}")

        return core_schema.json_or_python_schema(
            python_schema=core_schema.with_info_plain_validator_function(validate),
            json_schema=core_schema.with_info_plain_validator_function(validate),
        )


class UserContext(BaseModel):
    """Context about the current user session."""

    timezone: Annotated[ZoneInfo, ZoneInfoType]

    @field_validator("timezone", mode="before")
    def check_timezone(cls, value):
        if isinstance(value, str):
            if not re.match(r"^[a-zA-Z_]+/[a-zA-Z_]+$", value):
                raise ValueError("Invalid timezone format")
        return value


class UserContextFE(BaseModel):
    """A UserContext that uses serializable types."""

    timezone: str

    def to_user_context(self) -> UserContext:
        return UserContext(timezone=ZoneInfo(self.timezone))
