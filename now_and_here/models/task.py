from __future__ import annotations
from typing import Iterable
from datetime import datetime

from pydantic.dataclasses import dataclass
from pydantic import Field, RootModel
from rich.text import Text
from rich.table import Table
from rich.console import Console, ConsoleOptions, RenderResult
from rich.rule import Rule
from rich.prompt import Prompt, IntPrompt
from rich.panel import Panel
from rich.layout import Layout
from rich.padding import Padding

from .common import ID_LENGTH, random_id, format_id, format_priority
from .label import Label
from .project import Project
from now_and_here.time import relative_time, parse_time, format_time
from now_and_here.models.repeat_interval import RepeatInterval


@dataclass
class Task:
    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)  # type: ignore [misc]
    description: str | None = Field(None)  # type: ignore [misc]
    done: bool = Field(False)  # type: ignore [misc]
    parent: Task | None = Field(None)  # type: ignore [misc]
    project: Project | None = Field(None)  # type: ignore [misc]
    labels: list[Label] = Field(default_factory=list)  # type: ignore [misc]
    priority: int = Field(default=0, ge=0, le=3)  # type: ignore [misc]
    due: datetime | None = Field(None)  # type: ignore [misc]
    repeat: RepeatInterval | None = Field(None)  # type: ignore [misc]

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
        name = Prompt.ask("Task name", console=console)
        task = Task(name=name)  # type: ignore [call-arg]
        task.description = Prompt.ask(
            "Description", console=console, default=None, show_default=True
        )
        priority = IntPrompt.ask(
            "Priority", choices=list("0123"), default=0, console=console
        )
        task.priority = priority
        due = Prompt.ask(
            "Due date \[blank for None]",
            console=console,
            default=None,
            show_default=True,
        )
        if due:
            task.due = parse_time(due, warn_on_past=True)
        return task

    def update_from_prompt(self, console: Console) -> None:
        """Update the Task in-place from user input."""
        valid_fields = ["name", "description", "priority", "due", "save", ""]
        while True:
            console.print(self)
            field_name = Prompt.ask(
                "Update which field? \[or 'save' to confirm changes]",
                console=console,
                choices=valid_fields,
            )
            match field_name:
                case "name":
                    self.name = Prompt.ask("New value for name", console=console)
                case "description":
                    self.description = Prompt.ask(
                        "New value for description",
                        console=console,
                        default=None,
                        show_default=True,
                    )
                case "priority":
                    self.priority = IntPrompt.ask(
                        "New value for priority",
                        choices=list("0123"),
                        default=0,
                        console=console,
                    )
                case "due":
                    due_str = Prompt.ask(
                        "New value for due \[blank for None]",
                        console=console,
                        default=None,
                        show_default=True,
                    )
                    if due_str:
                        self.due = parse_time(due_str, warn_on_past=True)
                    else:
                        self.due = None
                case "save" | "":
                    return
                case _:
                    raise ValueError(
                        f"Field name {field_name} must be one of {valid_fields}"
                    )
            console.print("\nUpdated task:")

    def _as_rich_table_row(self) -> tuple[str, Text, Text, str, Text]:
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

    def as_card(self) -> Panel:
        if self.due:
            due_layout = Layout(name="due")
            due_layout.split_column(
                Text(relative_time(self.due)),
                Text(format_time(self.due), style="dim italic"),
            )
        else:
            due_layout = Layout(Text("No due date", style="dim"), name="due")
        status = Panel(
            ":white_heavy_check_mark:" if self.done else "", width=6, height=3
        )
        if self.description:
            desc_layout = Layout(
                Padding(
                    Text(self.description, style="italic magenta", overflow="ellipsis"),
                    (0, 1),
                ),
                name="desc",
                minimum_size=5,
            )
        else:
            desc_layout = Layout(Text(" "), visible=True, name="desc")

        layout = Layout()
        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="body"),
        )
        layout["header"].split_row(
            Layout(status, name="status", size=7),
            Layout(
                Padding(Text(self.name, style="magenta"), (1, 0)),
                name="name",
                size=30,
            ),
        )
        priority_layout = Layout(name="priority")
        priority_text = format_priority(self.priority)
        priority_text.justify = "right"
        priority_layout.split_column(
            Layout(Text("Priority", justify="right")),
            Layout(priority_text),
        )
        priority_layout.size = 10

        layout["body"].split_column(desc_layout, Layout(name="footer", size=3))
        layout["body"]["footer"].split_row(due_layout, priority_layout)
        return Panel(layout, width=40, height=15, expand=False)

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
