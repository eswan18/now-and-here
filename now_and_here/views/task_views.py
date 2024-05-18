from datetime import datetime
from typing import Callable

from pydantic import Field
from pydantic.dataclasses import dataclass
from zoneinfo import ZoneInfo

from now_and_here.datastore.datastore import DataStore
from now_and_here.models import Task, UserContext


@dataclass
class TaskView:
    """A protocol for a function that takes in a datastore and returns a list of tasks."""

    name: str
    description: str
    _builder: Callable[[DataStore, UserContext], list[Task]] = Field(exclude=True)

    def build(self, store: DataStore, context: UserContext) -> list[Task]:
        return self._builder(store, context)


task_views: dict[str, TaskView] = {}


def register_task_view(name: str, description: str) -> Callable[[TaskView], TaskView]:
    """A decorator to register a task view."""

    def register(callable: Callable[[DataStore, UserContext], list[Task]]) -> TaskView:
        view = TaskView(name=name, description=description, _builder=callable)
        task_views[view.name] = view
        return view

    return register


@register_task_view(
    name="Today", description="All tasks due before the end of the day."
)
def build_today_task_view(store: DataStore, context: UserContext) -> list[Task]:
    """Return all tasks due before the end of the user's current day."""
    user_now = datetime.now(context.timezone)
    end_of_user_day = datetime(
        user_now.year, user_now.month, user_now.day, 23, 59, 59, tzinfo=context.timezone
    )
    end_of_day_in_utc = end_of_user_day.astimezone(ZoneInfo("UTC"))
    tasks = store.get_tasks(due_before=end_of_day_in_utc)
    return tasks
