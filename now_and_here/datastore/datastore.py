from datetime import datetime
from typing import Protocol, runtime_checkable

from now_and_here.models import Task, Project, Label


@runtime_checkable
class DataStore(Protocol):
    def save_task(self, task: Task) -> str:
        pass

    def get_task(self, id: str) -> Task:
        pass

    def get_tasks(
        self,
        sort_by: str | None = "due",
        desc: bool = False,
        include_done: bool = False,
        due_before: datetime | None = None,
    ) -> list[Task]:
        pass

    def update_task(self, id: str, task: Task) -> None:
        pass

    def checkoff_task(self, id: str) -> None:
        pass

    def uncheckoff_task(self, id: str) -> None:
        pass

    def delete_task(self, id: str) -> bool:
        pass

    def save_project(self, project: Project) -> str:
        pass

    def get_project(self, id: str) -> Project:
        pass

    def update_project(self, id: str, project: Project) -> None:
        pass

    def save_label(self, label: Label) -> str:
        pass

    def get_label(self, id: str) -> Label:
        pass

    def update_label(self, id: str, label: Label) -> None:
        pass
