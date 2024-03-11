from datetime import datetime
from typing import Protocol, runtime_checkable

from now_and_here.models import Task, Project, Label


@runtime_checkable
class DataStore(Protocol):
    def save_task(self, task: Task) -> str: ...

    def get_task(self, id: str) -> Task: ...

    def get_tasks(
        self,
        sort_by: str | None = "due",
        desc: bool = False,
        include_done: bool = False,
        due_before: datetime | None = None,
    ) -> list[Task]: ...

    def update_task(self, id: str, task: Task) -> None: ...

    def checkoff_task(self, id: str) -> tuple[bool, datetime | None]:
        """
        Mark a task as done.

        Returns True if the task was previously not done (False if not) along with the
        next occurrence if this is a repeating task.
        """
        ...

    def uncheckoff_task(self, id: str) -> bool:
        """Mark a task as not done. Returns True if the task was previously done."""
        ...

    def delete_task(self, id: str) -> bool: ...

    def save_project(self, project: Project) -> str: ...

    def get_project(self, id: str) -> Project: ...

    def update_project(self, id: str, project: Project) -> None: ...

    def save_label(self, label: Label) -> str: ...

    def get_label(self, id: str) -> Label: ...

    def update_label(self, id: str, label: Label) -> None: ...
