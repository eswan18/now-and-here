from datetime import datetime
from typing import Callable

from pydantic import BaseModel, PrivateAttr
from zoneinfo import ZoneInfo

from now_and_here.datastore.datastore import DataStore
from now_and_here.models import Task, UserContext


class TaskView(BaseModel):
    """A container for a function that takes in a datastore and returns a list of tasks."""

    name: str
    description: str
    _builder: Callable[[DataStore, UserContext], list[Task]] = PrivateAttr()

    def build(self, store: DataStore, context: UserContext) -> list[Task]:
        return self._builder(store, context)


task_views: dict[str, TaskView] = {}


def register_task_view(
    name: str, description: str
) -> Callable[[Callable[[DataStore, UserContext], list[Task]]], TaskView]:
    """A decorator to register a task view."""

    def register(callable: Callable[[DataStore, UserContext], list[Task]]) -> TaskView:
        view = TaskView(name=name, description=description)
        view._builder = callable
        task_views[view.name.lower().replace(" ", "-")] = view
        return view

    return register


@register_task_view(name="Today", description="Tasks due before the end of the day")
def build_today_task_view(store: DataStore, context: UserContext) -> list[Task]:
    """Return tasks due before the end of the user's current day."""
    user_now = datetime.now(context.timezone)
    end_of_user_day = datetime(
        user_now.year, user_now.month, user_now.day, 23, 59, 59, tzinfo=context.timezone
    )
    end_of_day_in_utc = end_of_user_day.astimezone(ZoneInfo("UTC"))
    tasks = store.get_tasks(due_before=end_of_day_in_utc)
    return tasks


@register_task_view(name="No project", description="Tasks without a project")
def build_no_project_task_view(store: DataStore, _context: UserContext) -> list[Task]:
    """Return tasks without a project."""
    tasks = store.get_tasks()
    tasks = [t for t in tasks if t.project is None]
    return tasks
