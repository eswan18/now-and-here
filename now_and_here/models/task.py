from __future__ import annotations
from typing import Iterable
from datetime import datetime

from pydantic.dataclasses import dataclass
from pydantic import Field
from rich.table import Table

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
        table = Table(title="Tasks")
        table.add_column("ID", justify="left", style="cyan", width=ID_LENGTH)
        table.add_column("Task", style="magenta", max_width=50)
        table.add_column("Done", justify="right", width=6)
        table.add_column("Priority", justify="right", width=8)
        table.add_column("Due", justify="right", width=10)
        for task in tasks:
            priority = str(task.priority)
            match priority:
                case "0":
                    priority = f"[blue]0[/blue]"
                case "1":
                    priority = f"[yellow]1[/yellow]"
                case "2":
                    priority = f"[orange]2[/orange]"
                case "3":
                    priority = f"[bold red]3[/bold red]"
            done = "✓" if task.done else ""
            description = task.name
            if task.description:
                description += f"\n[green]{task.description}[/green]"
            table.add_row(task.id, task.name, done, priority, task.due)
        return table
