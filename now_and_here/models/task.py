from __future__ import annotations
from typing import Iterable
from datetime import datetime

from pydantic.dataclasses import dataclass
from pydantic import Field
from rich.text import Text
from rich.table import Table
from rich.console import Console
from rich.padding import Padding

from .common import ID_LENGTH, random_id
from .label import Label
from .project import Project


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
        table.add_column("Done", justify="right", width=6)
        table.add_column("Priority", justify="right", width=8)
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
        due = console.input("Due date [YYYY-MM-DD]: ")
        if due:
            task.due = datetime.fromisoformat(due)
        return task

    def _as_rich_table_row(self) -> tuple[str, str, str, str, str]:
        desc = Text(self.name)
        if self.description:
            desc += Text(f"\n{self.description}", style="italic dim")
        # Split task IDs with a dash for readability.
        first_half_len = len(self.id) // 2
        t_id = f"{self.id[:first_half_len]}-{self.id[first_half_len:]}"
        done = "✓" if self.done else ""
        priority = str(self.priority)
        match priority:
            case "0":
                priority = Padding("0", (0, 1), style="blue")
            case "1":
                priority = Padding("1", (0, 1), style="yellow")
            case "2":
                priority = Padding("2", (0, 1), style="red")
            case "3":
                priority = Padding("3", (0, 1), style="bold red")

        # Convert to yyyy-mm-dd hh:mm format or None
        due = self.due.strftime("%Y-%m-%d %H:%M") if self.due else None
        return t_id, desc, done, priority, due
