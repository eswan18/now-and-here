from __future__ import annotations

from typing import TYPE_CHECKING, Iterable, Self

from pydantic import AwareDatetime, BaseModel, Field, RootModel, field_serializer
from rich.console import Console, ConsoleOptions, RenderResult
from rich.layout import Layout
from rich.padding import Padding
from rich.panel import Panel
from rich.rule import Rule
from rich.table import Table
from rich.text import Text

if TYPE_CHECKING:
    from now_and_here.datastore import DataStore
from now_and_here.models.repeat_interval import RepeatIntervalType
from now_and_here.time import format_time, relative_time

from .common import ID_LENGTH, format_id, format_priority, random_id
from .label import Label
from .project import Project


class Task(BaseModel):
    id: str = Field(default_factory=random_id)
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = Field(None)
    done: bool = Field(False)
    parent: Task | None = Field(None)
    project: Project | None = Field(None)
    labels: list[Label] = Field(default_factory=list)
    priority: int = Field(default=0, ge=0, le=3)
    due: AwareDatetime | None = Field(None)
    repeat: RepeatIntervalType | None = Field(None)

    @classmethod
    def as_rich_table(cls, tasks: Iterable[Self]) -> Table:
        table = Table(title="Tasks", leading=1)
        table.add_column("ID", justify="left", style="cyan", width=ID_LENGTH + 1)
        table.add_column("Done", justify="center", width=4)
        table.add_column("Task", style="magenta", max_width=100)
        table.add_column("Priority", justify="right", width=8)
        table.add_column("Due", justify="right", max_width=24)
        table.add_column("Repeat", justify="right", max_width=30)
        table.add_column("Project", justify="right", max_width=30)
        for task in tasks:
            table.add_row(*task._as_rich_table_row())
        return table

    def _as_rich_table_row(self) -> tuple[str, str, Text, Text, Text, str, Text | None]:
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
        repeat = str(self.repeat) if self.repeat is not None else ""
        if self.project:
            project_text = (
                Text(self.project.name)
                + "\n"
                + Text(format_id(self.project.id), style="cyan italic")
            )
        else:
            project_text = Text("")
        return format_id(self.id), done, desc, priority, due, repeat, project_text

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
        if self.project:
            yield (
                Text(f"Project: {self.project.name} (")
                + Text(format_id(self.project.id), style="italic cyan")
                + Text(")")
            )
        else:
            yield Text("Project: ") + Text("None", style="dim")
        if self.due:
            yield Text(f"Due: {format_time(self.due)} ({relative_time(self.due)})")
        else:
            yield Text("Due: ") + Text("None", style="dim")
        if self.repeat:
            yield Text("Repeat: ") + Text(str(self.repeat))
        else:
            yield Text("Repeat: ") + Text("None", style="dim")

    def as_json(self) -> str:
        return RootModel[Task](self).model_dump_json()

    @classmethod
    def sortable_columns(cls) -> tuple[str, ...]:
        return ("due", "priority")

    @field_serializer("parent")
    def serialize_parent(self, value: Task | None) -> str | Task | None:
        # Save the parent just by its ID.
        return value.id if value is not None else None

    @field_serializer("project")
    def serialize_project(self, value: Project | None) -> str | Project | None:
        # Save the project just by its ID.
        return value.id if value is not None else None

    def clone(self) -> Self:
        """Make a copy of this task with a new ID."""
        return self.__class__(
            id=random_id(),
            name=self.name,
            description=self.description,
            done=self.done,
            parent=self.parent,
            project=self.project,
            labels=self.labels,
            priority=self.priority,
            due=self.due,
            repeat=self.repeat,
        )

    @property
    def relative_due_date(self) -> str | None:
        return relative_time(self.due) if self.due else None


class FETaskOut(Task):
    """A task that serializes appropriately for the front end."""

    @field_serializer("parent")
    def serialize_parent(self, value: Task | None) -> Task | None:
        # Send back the whole parent (unlike above, where we serialize just the ID)
        return value

    @field_serializer("project")
    def serialize_project(self, value: Project | None) -> Project | None:
        # Send back the whole project (unlike above, where we serialize just the ID)
        return value

    @classmethod
    def from_task(cls, task: Task) -> Self:
        return cls(
            id=task.id,
            name=task.name,
            description=task.description,
            done=task.done,
            parent=task.parent,
            project=task.project,
            labels=task.labels,
            priority=task.priority,
            due=task.due,
            repeat=task.repeat,
        )


class FENewTaskIn(Task):
    """A task received from the front end."""

    id: str | None = Field(None)  # type: ignore [assignment]
    parent_id: str | None = Field(None)
    project_id: str | None = Field(None)

    def to_task(self, store: DataStore) -> Task:
        project = self.project
        if project is None and self.project_id is not None:
            project = store.get_project(self.project_id)
        parent = self.parent
        if parent is None and self.parent_id is not None:
            parent = store.get_task(self.parent_id)
        return Task(
            id=self.id or random_id(),
            name=self.name,
            description=self.description,
            done=self.done,
            parent=parent,
            project=project,
            labels=self.labels,
            priority=self.priority,
            due=self.due,
            repeat=self.repeat,
        )
