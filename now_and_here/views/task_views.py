from datetime import datetime
from typing import Callable, Protocol

from zoneinfo import ZoneInfo

from now_and_here.datastore.datastore import DataStore
from now_and_here.models import Task, UserContext


class TaskView(Protocol):
    """A protocol for a function that takes in a datastore and returns a list of tasks."""

    def __call__(self, store: DataStore, context: UserContext) -> list[Task]: ...


task_views: dict[str, TaskView] = {}


def register_task_view(name: str) -> Callable[[TaskView], TaskView]:
    """A decorator to register a task view."""

    def register(view: TaskView) -> TaskView:
        task_views[name] = view
        return view

    return register


@register_task_view("today")
def today(store: DataStore, context: UserContext) -> list[Task]:
    """Return all tasks due before the end of the user's current day."""
    user_now = datetime.now(context.timezone)
    end_of_user_day = datetime(
        user_now.year, user_now.month, user_now.day, 23, 59, 59, tzinfo=context.timezone
    )
    end_of_day_in_utc = end_of_user_day.astimezone(ZoneInfo("UTC"))
    tasks = store.get_tasks(due_before=end_of_day_in_utc)
    return tasks
