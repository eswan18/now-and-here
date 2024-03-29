from pydantic.dataclasses import Field, dataclass

from .common import random_id


@dataclass
class Label:
    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)  # type: ignore [misc]
    description: str | None = Field(None)  # type: ignore [misc]
