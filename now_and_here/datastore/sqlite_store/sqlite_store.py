import sqlite3
from pathlib import Path

from now_and_here.datastore import datastore
from now_and_here.models import Task, Project, Label
from .create import create_db


class SQLiteStore(datastore.DataStore):
    
    def __init__(self, path: Path):
        self.conn = sqlite3.connect(path)
    
    @classmethod
    def exists(cls, path: Path) -> bool:
        return path.exists()
    
    @classmethod
    def create_self(cls, path: Path):
        create_db(path)

    def save_task(self, task: Task) -> int:
        pass

    def get_task(self, id: int) -> Task:
        pass

    def update_task(self, id: int, task: Task) -> None:
        pass

    def save_project(self, project: Project) -> int:
        pass

    def get_project(self, id: int) -> Project:
        pass

    def update_project(self, id: int, project: Project) -> None:
        pass

    def save_label(self, label: Label) -> int:
        pass

    def get_label(self, id: int) -> Label:
        pass

    def update_label(self, id: int, label: Label) -> None:
        pass