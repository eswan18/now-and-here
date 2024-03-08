import sqlite3
import json
from pathlib import Path

from pydantic import RootModel

from now_and_here.datastore import datastore
from now_and_here.models import Task, Project, Label
from .create import create_db


class UnstructuredSQLiteStore(datastore.DataStore):
    
    def __init__(self, path: Path):
        self.conn = sqlite3.connect(path)
    
    @classmethod
    def exists(cls, path: Path) -> bool:
        return path.exists()
    
    @classmethod
    def create_self(cls, path: Path):
        create_db(path)

    def save_task(self, task: Task) -> str:
        data = RootModel[Task](task).model_dump_json()
        with self.conn as conn:
            conn.execute("INSERT INTO tasks (id, json) VALUES (?, ?)", (task.id, data))
        return task.id

    def get_task(self, id: str) -> Task:
        pass

    def get_all_tasks(self) -> list[Task]:
        # Pull all items from the tasks table.
        with self.conn as conn:
            cursor = conn.execute("SELECT json FROM tasks")
            tasks = [Task(**json.loads(data)) for (data,) in cursor.fetchall()]
        return tasks

    def update_task(self, id: str, task: Task) -> None:
        pass

    def delete_task(self, id: str) -> bool:
        with self.conn as conn:
            result = conn.execute("DELETE FROM tasks WHERE id = ?", (id,))
        return result.rowcount > 0

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