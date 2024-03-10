import sqlite3
import json
from pathlib import Path
from datetime import datetime

from now_and_here.models import Task, Project, Label
from .create import create_db


class UnstructuredSQLiteStore:
    def __init__(self, path: Path):
        self.conn = sqlite3.connect(path)

    @classmethod
    def exists(cls, path: Path) -> bool:
        return path.exists()

    @classmethod
    def create_self(cls, path: Path):
        create_db(path)

    def save_task(self, task: Task) -> str:
        data = task.as_json()
        with self.conn as conn:
            conn.execute("INSERT INTO tasks (id, json) VALUES (?, ?)", (task.id, data))
        return task.id

    def get_task(self, id: str) -> Task:
        with self.conn as conn:
            cursor = conn.execute("SELECT json FROM tasks WHERE id = (?)", (id,))
            row = cursor.fetchone()
        if not row:
            raise ValueError(f"No task with id {id}")
        data = json.loads(row[0])
        task = Task(**data)
        return task

    def get_tasks(
        self,
        sort_by: str | None = None,
        desc: bool = False,
        include_done: bool = False,
        due_before: datetime | None = None,
    ) -> list[Task]:
        """Pull items from the tasks table."""
        # Some very limited validation to avoid extremely easy sql injection.

        query = "SELECT json FROM tasks WHERE 1=1"
        params = []
        if not include_done:
            query += " AND json ->> 'done' = FALSE"
        if due_before:
            query += f" AND datetime(json ->> 'due') <= datetime(?)"
            params.append(due_before.isoformat())
        if sort_by:
            if sort_by not in Task.sortable_columns():
                raise ValueError(f"Cannot sort on column {sort_by}")
            asc = "DESC" if desc else "ASC"
            query += f" ORDER BY json ->> '{sort_by}' {asc} NULLS LAST"
        with self.conn as conn:
            if params:
                cursor = conn.execute(query, params)
            else:
                cursor = conn.execute(query)
            tasks = [Task.from_json(data) for (data,) in cursor.fetchall()]
        return tasks

    def update_task(self, id: str, task: Task) -> None:
        data = task.as_json()
        with self.conn as conn:
            conn.execute("UPDATE tasks SET json = (?) WHERE id = (?)", (data, id))

    def checkoff_task(self, id: str) -> None:
        task = self.get_task(id)
        task.done = True
        self.update_task(id, task)

    def uncheckoff_task(self, id: str) -> None:
        task = self.get_task(id)
        task.done = False
        self.update_task(id, task)

    def delete_task(self, id: str) -> bool:
        with self.conn as conn:
            result = conn.execute("DELETE FROM tasks WHERE id = ?", (id,))
        return result.rowcount > 0

    def save_project(self, project: Project) -> str:
        raise NotImplementedError

    def get_project(self, id: str) -> Project:
        raise NotImplementedError

    def update_project(self, id: str, project: Project) -> None:
        raise NotImplementedError

    def save_label(self, label: Label) -> str:
        raise NotImplementedError

    def get_label(self, id: str) -> Label:
        raise NotImplementedError

    def update_label(self, id: str, label: Label) -> None:
        raise NotImplementedError
