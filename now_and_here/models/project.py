from __future__ import annotations
import json
from typing import Iterable, Self

from pydantic import RootModel
from pydantic.dataclasses import dataclass, Field
from rich.console import Console
from rich.prompt import Prompt
from rich.table import Table

from .common import random_id, ID_LENGTH, format_id


@dataclass
class Project:
    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)  # type: ignore [misc]
    description: str | None = Field(None)  # type: ignore [misc]
    parent: Project | None = Field(None)  # type: ignore [misc]

    @classmethod
    def sortable_columns(cls) -> list[str]:
        return ["name"]

    @classmethod
    def as_rich_table(cls, projects: Iterable[Self]) -> Table:
        table = Table(title="Projects", leading=1)
        table.add_column("ID", justify="left", style="cyan", width=ID_LENGTH + 1)
        table.add_column("Name", style="magenta", max_width=100)
        table.add_column("Description", style="italic", max_width=100)
        table.add_column("Parent", max_width=100)
        for project in projects:
            table.add_row(*project._as_rich_table_row())
        return table

    def _as_rich_table_row(self) -> tuple[str, str, str, str]:
        return (
            format_id(self.id),
            self.name,
            self.description or "",
            str(self.parent) if self.parent else "",
        )

    @classmethod
    def from_prompt(cls, console: Console) -> Self:
        name = Prompt.ask("Project name", console=console)
        project = cls(name=name)  # type: ignore [call-arg]
        project.description = Prompt.ask(
            "Description", console=console, default=None, show_default=True
        )
        # TODO: prompt for parent project
        return project

    def as_json(self) -> str:
        return RootModel[Project](self).model_dump_json()

    @classmethod
    def from_json(cls, data: str) -> Self:
        values = json.loads(data)
        return cls(**values)
