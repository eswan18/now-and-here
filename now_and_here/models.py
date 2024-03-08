from __future__ import annotations
import random
from string import ascii_lowercase, digits

from pydantic.dataclasses import dataclass
from pydantic import Field

ID_LENGTH = 5


def random_id():
    return "".join(random.choices(ascii_lowercase + digits, k=ID_LENGTH))


@dataclass
class Task:
    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None)
    done: bool = Field(False)
    parent: Task | None = Field(None)
    project: Project | None = Field(None)
    labels: list[Label] = Field(default_factory=list)
    priority: int = Field(default=0, ge=0, le=5)


@dataclass
class Project:
    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None)
    parent: Project | None = Field(None)


@dataclass
class Label:
    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None)
