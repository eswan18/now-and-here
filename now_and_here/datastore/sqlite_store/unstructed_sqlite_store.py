import sqlite3
from datetime import datetime
from pathlib import Path

from rich.console import Console
from zoneinfo import ZoneInfo

from now_and_here.datastore.errors import InvalidSortError, RecordNotFoundError
from now_and_here.models import Label, Project, Task

from .create import create_db


class UnstructuredSQLiteStore:
    def __init__(self, path: Path, console: Console):
        self.conn = sqlite3.connect(path)
        self.console = console

    @classmethod
    def exists(cls, path: Path) -> bool:
        return path.exists()

    @classmethod
    def create_self(cls, path: Path):
        if not path.parent.exists():
            path.parent.mkdir(parents=True)
        create_db(path)

    def save_task(self, task: Task) -> str:
        data = task.as_json()
        with self.conn as conn:
            conn.execute("INSERT INTO tasks (id, json) VALUES (?, ?)", (task.id, data))
        return task.id

    def get_task(self, id: str) -> Task:
        query = """
            SELECT json_set(
                json_set(t.json, '$.project', json(p.json)),
                '$.label',
                json(l.json)
            )
            FROM tasks t
            LEFT JOIN projects p
                ON t.json ->> 'project' = p.id
            LEFT JOIN labels l
                ON t.json ->> 'label' = l.id 
            WHERE t.id = (?)
            LIMIT 1
        """
        with self.conn as conn:
            cursor = conn.execute(query, (id,))
            row = cursor.fetchone()
        if not row:
            raise RecordNotFoundError(f"No task with id {id}")
        task = Task.from_json(row[0])
        return task

    def get_tasks(
        self,
        project_name: str | None = None,
        project_id: str | None = None,
        sort_by: str | None = None,
        desc: bool = False,
        include_done: bool = False,
        due_before: datetime | None = None,
    ) -> list[Task]:
        """Pull items from the tasks table."""
        query = """
            SELECT json_set(
                json_set(t.json, '$.project', json(p.json)),
                '$.label',
                json(l.json)
            )
            FROM tasks t
            LEFT JOIN projects p
                ON t.json ->> 'project' = p.id
            LEFT JOIN labels l
                ON t.json ->> 'label' = l.id
            WHERE 1=1
        """
        params = []
        if not include_done:
            query += " AND t.json ->> 'done' = FALSE"
        if due_before:
            query += " AND datetime(t.json ->> 'due') <= datetime(?)"
            params.append(due_before.isoformat())
        if project_name:
            # Case-insensitive search
            project_name = project_name.lower()
            query += " AND lower(p.json ->> 'name') = (?)"
            params.append(project_name)
        if project_id:
            query += " AND p.id = (?)"
            params.append(project_id)
        if sort_by:
            # Some very limited validation to avoid extremely easy sql injection.
            if sort_by not in Task.sortable_columns():
                raise InvalidSortError(f"Cannot sort on column {sort_by}")
            asc = "DESC" if desc else "ASC"
            query += f" ORDER BY t.json ->> '{sort_by}' {asc} NULLS LAST"
        with self.conn as conn:
            if params:
                cursor = conn.execute(query, params)
            else:
                cursor = conn.execute(query)
            tasks = [Task.from_json(task) for (task,) in cursor.fetchall()]
        return tasks

    def update_task(self, id: str, task: Task) -> None:
        data = task.as_json()
        with self.conn as conn:
            conn.execute("UPDATE tasks SET json = (?) WHERE id = (?)", (data, id))

    def checkoff_task(self, id: str) -> tuple[bool, datetime | None]:
        """
        Mark a task as done.

        Returns True if the task was previously not done (False if not) along with the
        next occurrence if this is a repeating task.
        """
        task = self.get_task(id)
        if task.done:
            return False, None
        if not task.repeat:
            # If the task doesn't repeat, just mark it as done and return.
            task.done = True
            self.update_task(id, task)
            return True, None
        else:
            # If the task repeats, we need to do a few things:
            #    1. Mark the current task as done.
            #    2. Create an identical task, due on the next occurrence.
            #    3. Remove the repeat from the now-done task (the repeat lives on in the
            #       new task.)
            current_occurrence = task.due
            if current_occurrence is None:
                raise ValueError("Repeating task has no current due date")
            # We need to convert to local time before calculating the next occurrence
            # since things like "every Tuesday" won't make sense if the current date is
            # actually a Monday due to timezone offsets.
            current_occurrence = current_occurrence.astimezone(ZoneInfo("local"))
            next_occurrence = task.repeat.next(current_occurrence).astimezone(
                ZoneInfo("UTC")
            )
            new_task = task.clone()
            new_task.due = next_occurrence

            # Update current task
            task.repeat = None
            task.done = True
            self.update_task(id, task)
            # Save new task
            self.save_task(new_task)
            return True, new_task.due

    def uncheckoff_task(self, id: str) -> bool:
        """Mark a task as not done. Returns True if the task was previously done."""
        task = self.get_task(id)
        if not task.done:
            return False
        task.done = False
        self.update_task(id, task)
        return True

    def delete_task(self, id: str) -> bool:
        with self.conn as conn:
            result = conn.execute("DELETE FROM tasks WHERE id = ?", (id,))
        return result.rowcount > 0

    def save_project(self, project: Project) -> str:
        data = project.as_json()
        with self.conn as conn:
            conn.execute(
                "INSERT INTO projects (id, json) VALUES (?, ?)", (project.id, data)
            )
        return project.id

    def get_project(self, id: str) -> Project:
        query = "SELECT json FROM projects WHERE id = ?"
        with self.conn as conn:
            cursor = conn.execute(query, (id,))
            row = cursor.fetchone()
        if not row:
            raise RecordNotFoundError(f"No project with id {id}")
        return Project.from_json(row[0])

    def get_project_by_name(self, name: str) -> Project:
        query = "SELECT json FROM projects WHERE json ->> 'name' = ?"
        with self.conn as conn:
            cursor = conn.execute(query, (name,))
            row = cursor.fetchone()
        if not row:
            raise RecordNotFoundError(f"No project with name {name}")
        return Project.from_json(row[0])

    def get_projects(
        self,
        sort_by: str | None = "name",
        desc: bool = False,
    ) -> list[Project]:
        query = """
            SELECT json_set(p.json, '$.parent', json(p2.json))
            FROM projects p
                LEFT JOIN projects p2
                ON p.json ->> 'parent' = p2.id
            WHERE 1=1
        """
        if sort_by:
            # Some very limited validation to avoid extremely easy sql injection.
            if sort_by not in Project.sortable_columns():
                raise InvalidSortError(f"Cannot sort on column {sort_by}")
            asc = "DESC" if desc else "ASC"
            query += f" ORDER BY p.json ->> '{sort_by}' {asc} NULLS LAST"
        with self.conn as conn:
            cursor = conn.execute(query)
            projects = [Project.from_json(data) for (data,) in cursor.fetchall()]
        return projects

    def update_project(self, id: str, project: Project) -> None:
        data = project.as_json()
        with self.conn as conn:
            conn.execute("UPDATE projects SET json = (?) WHERE id = (?)", (data, id))

    def save_label(self, label: Label) -> str:
        raise NotImplementedError

    def get_label(self, id: str) -> Label:
        raise NotImplementedError

    def update_label(self, id: str, label: Label) -> None:
        raise NotImplementedError
