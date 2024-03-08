# an abstract datastore class
# Classes inheriting from this class must implement its methods or there will be an immediate error
from abc import ABC, abstractmethod
from typing import Any

from now_and_here.models import Task, Project, Label


class DataStore(ABC):

    @abstractmethod
    def save_task(self, task: Task) -> int:
        pass

    @abstractmethod
    def get_task(self, id: int) -> Task:
        pass

    @abstractmethod
    def update_task(self, id: int, task: Task) -> None:
        pass

    @abstractmethod
    def save_project(self, project: Project) -> int:
        pass

    @abstractmethod
    def get_project(self, id: int) -> Project:
        pass

    @abstractmethod
    def update_project(self, id: int, project: Project) -> None:
        pass

    @abstractmethod
    def save_label(self, label: Label) -> int:
        pass

    @abstractmethod
    def get_label(self, id: int) -> Label:
        pass

    @abstractmethod
    def update_label(self, id: int, label: Label) -> None:
        pass