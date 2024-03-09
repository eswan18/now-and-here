from __future__ import annotations
from typing import Iterable
from datetime import datetime

from pydantic.dataclasses import dataclass
from pydantic import Field, RootModel
from rich.text import Text
from rich.table import Table
from rich.console import Console, ConsoleOptions, RenderResult
from rich.rule import Rule

from .common import ID_LENGTH, random_id, format_id, format_priority
from .label import Label
from .project import Project
from now_and_here.time import relative_time, parse_time, format_time


@dataclass
class Task:
    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None)
    done: bool = Field(False)
    parent: Task | None = Field(None)
    project: Project | None = Field(None)
    labels: list[Label] = Field(default_factory=list)
    priority: int = Field(default=0, ge=0, le=3)
    due: datetime | None = Field(None)

    @classmethod
    def as_rich_table(cls, tasks: Iterable[Task]) -> Table:
        table = Table(title="Tasks", leading=1)
        table.add_column("ID", justify="left", style="cyan", width=ID_LENGTH + 1)
        table.add_column("Task", style="magenta", max_width=100)
        table.add_column("Priority", justify="right", width=8)
        table.add_column("Done", justify="center", width=4)
        table.add_column("Due", justify="right", max_width=24)
        for task in tasks:
            table.add_row(*task._as_rich_table_row())
        return table

    @classmethod
    def from_prompt(cls, console: Console) -> Task:
        name = console.input("Task name: ")
        task = Task(name=name)
        task.description = console.input("Description [blank for None]: ", markup=False)
        if task.description == "":
            task.description = None
        priority = console.input("Priority [0-3]: ")
        task.priority = int(priority)
        due = console.input("Due date [blank for None]: ", markup=False)
        if due:
            task.due = parse_time(due)
        return task

    def _as_rich_table_row(self) -> tuple[str, Text, str, Text, Text]:
        desc = Text(self.name)
        if self.description:
            desc += Text(f"\n{self.description}", style="italic dim")
        priority = format_priority(self.priority)
        done = ":white_heavy_check_mark:" if self.done else ""
        if self.due is not None:
            # Display dates as "in 3 days" or "in 17 hours", with the precise time
            # listed below in italic.
            due = Text(f"{relative_time(self.due)}") + Text(
                "\n" + format_time(self.due), style="italic dim"
            )
        else:
            due = Text("None", style="dim")
        return format_id(self.id), desc, priority, done, due

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
        yield Text("Priority: ") + format_priority(self.priority)
        yield Text(f"Done: {self.done}")
        if self.due:
            yield Text(f"Due: {format_time(self.due)} ({relative_time(self.due)})")
        else:
            yield Text("Due: ") + Text("None", style="dim")

    def as_json(self) -> str:
        return RootModel[Task](self).model_dump_json()

    @classmethod
    def sortable_columns(cls) -> tuple[str, ...]:
        return ("due", "priority")
