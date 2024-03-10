from __future__ import annotations
from pydantic.dataclasses import dataclass, Field

from .common import random_id


@dataclass
class Project:
    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)  # type: ignore [misc]
    description: str | None = Field(None)  # type: ignore [misc]
    parent: Project | None = Field(None)  # type: ignore [misc]
