from __future__ import annotations

import json
from typing import Iterable, Self

from pydantic import RootModel, field_serializer
from pydantic.dataclasses import Field, dataclass
from rich.console import Console, ConsoleOptions, RenderResult
from rich.rule import Rule
from rich.table import Table
from rich.text import Text

from .common import ID_LENGTH, format_id, random_id


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
        table.add_column("Parent", justify="right", max_width=100)
        for project in projects:
            table.add_row(*project._as_rich_table_row())
        return table

    def _as_rich_table_row(self) -> tuple[str, str, str, Text]:
        if self.parent:
            parent_text = (
                Text(self.parent.name)
                + "\n"
                + Text(format_id(self.parent.id), style="cyan italic")
            )
        else:
            parent_text = Text("")
        return (
            format_id(self.id),
            self.name,
            self.description or "",
            parent_text,
        )

    def as_json(self) -> str:
        return RootModel[Project](self).model_dump_json()

    @classmethod
    def from_json(cls, data: str) -> Self:
        values = json.loads(data)
        return cls(**values)

    def __rich_console__(
        self, console: Console, options: ConsoleOptions
    ) -> RenderResult:
        task_id = Text(format_id(self.id), style="cyan")
        task_title = Text("Task ") + task_id
        yield Rule(task_title)
        yield Text("Name: ") + Text(self.name, style="magenta")
        if self.description:
            yield Text("Description: ") + Text(self.description, style="dim magenta")
        else:
            yield Text("Description: ") + Text("None", style="dim")
        if self.parent:
            yield (
                Text("Parent: ")
                + Text(self.parent.name)
                + Text(" (")
                + Text(format_id(self.parent.id), style="cyan")
                + Text(")")
            )
        else:
            yield Text("Parent: ")

    @field_serializer("parent")
    def serialize_parent(self, value: Project | None) -> str | None:
        # Save the parent project just by its ID.
        return value.id if value is not None else None

    def clone(self) -> Self:
        """Make a copy of this project with a new ID."""
        # Writing to/from json is kinda janky, but we know it works robustly since
        # that's how all projects are stored on disk.
        as_json = self.as_json()
        new_project = self.__class__.from_json(as_json)
        new_project.id = random_id()
        return new_project
