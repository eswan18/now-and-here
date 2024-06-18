from __future__ import annotations

import json
from typing import Iterable, Self

from pydantic import BaseModel, Field, field_serializer
from rich.console import Console, ConsoleOptions, RenderResult
from rich.rule import Rule
from rich.table import Table
from rich.text import Text

from .common import ID_LENGTH, format_id, random_id


class Project(BaseModel):
    """
    A project is a collection of tasks.
    """

    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None)
    parent: Project | None = Field(None)

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
    def serialize_parent(self, value: Project | None) -> str | Project | None:
        # Save the parent project just by its ID.
        return value.id if value is not None else None

    def clone(self) -> Self:
        """Make a copy of this project with a new ID."""
        # Writing to/from json is kinda janky, but we know it works robustly since
        # that's how all projects are stored on disk.
        as_json = self.model_dump_json()
        new_project = self.__class__.from_json(as_json)
        new_project.id = random_id()
        return new_project


class FEProject(Project):
    """
    A Project that serializes its parent project in its entirety.

    Regular projects serialize their parent project as just the parent's ID.
    """

    @field_serializer("parent")
    def serialize_parent(self, value: Project | None) -> Project | None:
        # Serialize the parent in its entirety.
        if value is None:
            return None
        # Converting to an FEProject ensures that parent projects also have their
        # respective parents serialized correctly.
        as_fe_project = FEProject.from_project(value)
        return as_fe_project

    @classmethod
    def from_project(cls, project: Project) -> Self:
        return cls(
            id=project.id,
            name=project.name,
            description=project.description,
            parent=project.parent,
        )
