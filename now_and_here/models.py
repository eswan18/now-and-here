from __future__ import annotations
from pydantic.dataclasses import dataclass
from pydantic import Field


@dataclass
class Task:
    id: int
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None)
    done: bool = Field(False)
    parent: Task | None = Field(None)
    project: Project | None = Field(None)
    labels: list[Label] = Field(default_factory=list)
    priority: int = Field(default=0, ge=0, le=5)


@dataclass
class Project:
    id: int
    name: str
    description: str
    parent: Project | None


@dataclass
class Label:
    id: int
    name: str
    description: str
