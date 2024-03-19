import re
from dataclasses import dataclass
from datetime import datetime

import pytest
from freezegun import freeze_time
from zoneinfo import ZoneInfo

from now_and_here.datastore import DataStore

from .nhrunner import NHRunner


@dataclass
class Param:
    due: str
    repeat: str
    next_occur: datetime


@pytest.mark.parametrize(
    "param",
    [
        Param(
            "today 8pm",
            "every wednesday at 3:17pm",
            datetime(2024, 3, 20, 15, 17, tzinfo=ZoneInfo("America/Chicago")),
        ),
        Param(
            "today 13:00",
            "every Sunday at 13:00",
            datetime(2024, 3, 24, 13, 0, tzinfo=ZoneInfo("America/Chicago")),
        ),
        Param(
            "today 13:00",
            "every 3 weeks on Sunday at 13:00",
            datetime(2024, 4, 7, 13, 0, tzinfo=ZoneInfo("America/Chicago")),
        ),
    ],
)
@freeze_time(datetime(2024, 3, 17, 13, 0, tzinfo=ZoneInfo("America/Chicago")))
def test_task_repeat(temp_store: DataStore, nh: NHRunner, param: Param):
    """Test that repeating tasks repeat correctly."""
    # Create a repeating task.
    args = ["task", "add", "-i"]
    input = (
        "\n".join(
            [
                "test_repeating_task",  # name
                "",  # description
                "1",  # priority
                param.due,  # due date
                param.repeat,  # repeat
                "no",  # is this task part of a project?
            ]
        )
        + "\n"
    )
    result = nh.invoke(
        args=args,
        input=input,
    )
    assert result.exit_code == 0

    output = nh.remove_ansi_codes(result.stdout)
    # Get the ID from the output.
    match = re.search(r"ID:\s+(?P<id>[a-zA-Z0-9\-]+)", output)
    assert match is not None
    id = match.group("id").replace("-", "")

    # But also make sure that it renders correctly when printed to the console.
    task = temp_store.get_task(id)
    result = nh.invoke(["task", "get", id, "--field", "repeat"])
    assert result.exit_code == 0
    assert result.output.strip() == str(task.repeat)

    # Mark the task as done.
    result = nh.invoke(args=["task", "checkoff", id])
    assert result.exit_code == 0

    # The current task should have been cloned, so the existing one will be marked as
    # done.
    task = temp_store.get_task(id)
    assert task.done

    # There should only be one task that *isn't* done, the clone task.
    result = nh.invoke(["task", "list", "--id-only"])
    assert result.exit_code == 0
    new_id = result.stdout.strip().replace("-", "")

    # Make sure that the new task is due on the day we expect.
    new_task = temp_store.get_task(new_id)
    # Convert the new task's due date from UTC into the local timezone.
    assert new_task.due.tzname() == "UTC"
    next_occur = new_task.due.astimezone(ZoneInfo("America/Chicago"))
    assert next_occur == param.next_occur
