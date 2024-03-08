from pydantic.dataclasses import dataclass, Field

from .common import random_id


@dataclass
class Label:
    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None)
