import sqlite3
from datetime import datetime
from pathlib import Path

import numpy as np
import sqlite_vss
from fastembed import TextEmbedding
from tzlocal import get_localzone
from zoneinfo import ZoneInfo

from now_and_here.datastore.errors import InvalidSortError, RecordNotFoundError
from now_and_here.models import Label, Project, Task
from now_and_here.models.common import decode_id_from_int, id_as_int

from .create import create_db, create_vector_store
from .queries import PROJECTS_QUERY, TASKS_QUERY


class UnstructuredSQLiteStore:
    def __init__(self, path: Path):
        self.conn = sqlite3.connect(path)
        self.conn.enable_load_extension(True)
        sqlite_vss.load(self.conn)
        self.conn.enable_load_extension(False)

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
        self._update_embeddings([task])
        return task.id

    def _update_embeddings(self, tasks: list[Task]) -> None:
        embedding_model = TextEmbedding()
        records = []

        def doc_from_task(task: Task) -> str:
            doc = task.name
            if task.description:
                doc += f": {task.description}"
            return doc

        documents = [doc_from_task(task) for task in tasks]
        # Our primary key in the vss_tasks table is an int, so we need to convert the
        # task ID from a string.
        row_ids = [id_as_int(task.id) for task in tasks]
        embeddings = embedding_model.embed(documents)
        records = list(
            zip(
                row_ids,
                (emb.astype(np.float32).tobytes() for emb in embeddings),
            )
        )

        with self.conn as conn:
            # Update and upsert operations don't seem to be supported in vss0, so we
            # delete existing rows ourselves as part of the current transaction.
            bind_vars = ",".join("?" for _ in records)
            conn.execute(
                f"DELETE FROM vss_tasks WHERE rowid IN ({bind_vars})", (row_ids)
            )
            # Then insert the new embeddings.
            conn.executemany("INSERT INTO vss_tasks (rowid, a) VALUES (?, ?)", records)
            conn.commit()

    def regen_embeddings(self) -> None:
        self.conn.enable_load_extension(True)
        sqlite_vss.load(self.conn)
        self.conn.enable_load_extension(False)
        with self.conn as conn:
            # Check if the table vss_tasks exists and create it if not.
            cursor = conn.execute(
                "SELECT name FROM sqlite_master WHERE name='vss_tasks'"
            )
            row = cursor.fetchone()
            table_exists = row is not None
            if not table_exists:
                create_vector_store(conn)
        tasks = self.get_tasks()
        self._update_embeddings(tasks)

    def search_tasks(self, query: str, limit: int = 5) -> list[Task]:
        embedding_model = TextEmbedding()
        embedding, *_ = embedding_model.embed([query])
        with self.conn as conn:
            cursor = conn.execute(
                "SELECT rowid, a FROM vss_tasks WHERE vss_search(a, ?) limit ?",
                (embedding.astype(np.float32).tobytes(), limit),
            )
            rows = cursor.fetchall()
        task_ids = [decode_id_from_int(row[0]) for row in rows]
        tasks = [self.get_task(id) for id in task_ids]
        return tasks

    def get_task(self, id: str) -> Task:
        query = TASKS_QUERY
        query += "\n AND t.id = (?) LIMIT 1"
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
        include_child_projects: bool = False,
        sort_by: str | None = None,
        desc: bool = False,
        include_done: bool = False,
        due_before: datetime | None = None,
    ) -> list[Task]:
        """Pull items from the tasks table."""
        # Sanity validations:
        if project_name and project_id:
            raise ValueError("Cannot filter by both project name and project ID")
        if not project_id and include_child_projects:
            raise ValueError(
                "Cannot include child projects without a project ID filter"
            )
        query = TASKS_QUERY
        params = []
        if not include_done:
            query += " AND t.json ->> 'done' = FALSE"
        if due_before:
            query += " AND datetime(t.json ->> 'due') <= datetime(?)"
            params.append(due_before.isoformat())
        if project_name:
            # Case-insensitive search
            project_name = project_name.lower()
            query += " AND lower(ph.json ->> 'name') = (?)"
            params.append(project_name)
        if project_id:
            if not include_child_projects:
                query += " AND ph.id = (?)"
                params.append(project_id)
            else:
                query += """ AND (
                    ph.id = (?)
                    OR EXISTS (
                        SELECT 1 FROM json_each(ph.parent_ids)
                        WHERE value = (?)
                    )
                )"""
                params.extend([project_id, project_id])

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
            cursor = conn.cursor()
            cursor.execute("UPDATE tasks SET json = (?) WHERE id = (?)", (data, id))
            if cursor.rowcount == 0:
                raise RecordNotFoundError(f"No task with id {id}")
        self._update_embeddings([task])

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
            current_occurrence = current_occurrence.astimezone(get_localzone())
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
        query = PROJECTS_QUERY
        query += "AND ph.id = (?)"
        with self.conn as conn:
            cursor = conn.execute(query, (id,))
            row = cursor.fetchone()
        if not row:
            raise RecordNotFoundError(f"No project with id {id}")
        return Project.from_json(row[0])

    def get_project_by_name(self, name: str) -> Project:
        query = PROJECTS_QUERY
        query += "AND ph.json ->> 'name' = (?)"
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
        query = PROJECTS_QUERY
        if sort_by:
            # Some very limited validation to avoid extremely easy sql injection.
            if sort_by not in Project.sortable_columns():
                raise InvalidSortError(f"Cannot sort on column {sort_by}")
            asc = "DESC" if desc else "ASC"
            query += f" ORDER BY ph.json ->> '{sort_by}' {asc} NULLS LAST"
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
