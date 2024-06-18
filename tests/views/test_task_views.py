from datetime import datetime

from freezegun import freeze_time
from zoneinfo import ZoneInfo

from now_and_here.datastore import DataStore
from now_and_here.models import Task, UserContext
from now_and_here.views.task_views import task_views

utc = ZoneInfo("UTC")
today = task_views["today"]


@freeze_time("2024-01-01T12:00:00", tz_offset=0)
def test_today_simple(temp_store: DataStore):
    # Insert some tasks.
    due_at_midnight = Task(
        name="a",
        due=datetime(2024, 1, 1, 0, 0, 0, tzinfo=utc),
    )
    due_at_noon = Task(
        name="b",
        due=datetime(2024, 1, 1, 12, 0, 0, tzinfo=utc),
    )
    due_before_next_midnight = Task(
        name="c",
        due=datetime(2024, 1, 1, 23, 59, 59, tzinfo=utc),
    )
    for task in [due_at_midnight, due_at_noon, due_before_next_midnight]:
        temp_store.save_task(task)
    # All tasks should be returned if we're in UTC
    tasks = today.build(temp_store, UserContext(timezone=utc))
    assert len(tasks) == 3

    # If we move west (backward) to Chicago:
    # - the user's current time is 6:00 Chicago
    # - the end of the day is 23:59 Chicago, which is 05:59 UTC the next day.
    # - All 3 tasks should still be returned.
    tasks = today.build(temp_store, UserContext(timezone=ZoneInfo("America/Chicago")))
    assert len(tasks) == 3

    # But if we move east (foward) slightly to Germany:
    # - the user's current time is 13:00 Berlin
    # - the end of the day is 23:59 Berlin, which is 22:59 UTC.
    # - Only the first two tasks should be returned (the last one is due at 23:59 UTC).
    tasks = today.build(temp_store, UserContext(timezone=ZoneInfo("Europe/Berlin")))
    assert len(tasks) == 2
