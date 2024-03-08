from abc import ABC, abstractmethod
from typing import Any

from now_and_here.models import Task, Project, Label


class DataStore(ABC):

    @abstractmethod
    def save_task(self, task: Task) -> str:
        pass

    @abstractmethod
    def get_task(self, id: str) -> Task:
        pass

    @abstractmethod
    def get_all_tasks(self) -> list[Task]:
        pass

    @abstractmethod
    def update_task(self, id: str, task: Task) -> None:
        pass

    @abstractmethod
    def delete_task(self, id: str) -> bool:
        pass

    @abstractmethod
    def save_project(self, project: Project) -> str:
        pass

    @abstractmethod
    def get_project(self, id: str) -> Project:
        pass

    @abstractmethod
    def update_project(self, id: str, project: Project) -> None:
        pass

    @abstractmethod
    def save_label(self, label: Label) -> str:
        pass

    @abstractmethod
    def get_label(self, id: str) -> Label:
        pass

    @abstractmethod
    def update_label(self, id: str, label: Label) -> None:
        pass