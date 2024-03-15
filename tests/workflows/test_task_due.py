import re
from datetime import datetime

from tzlocal import get_localzone
from zoneinfo import ZoneInfo

from now_and_here.datastore import DataStore

from .nhrunner import NHRunner

# TODO: incorporate freezegun


def test_task_due(temp_store: DataStore, nh: NHRunner):
    """Test that task due dates are stored correctly."""
    # Create a repeating task.
    args = ["task", "add", "-i"]
    input = (
        "\n".join(
            [
                "test_repeating_task",  # name
                "",  # description
                "1",  # priority
                "today 8pm",  # due date
                "",  # repeat (None)
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

    # Make sure the task's due date was stored in UTC.
    task = temp_store.get_task(id)
    now = datetime.now().astimezone(get_localzone())
    today_8pm_local = now.replace(hour=20, minute=0, second=0, microsecond=0)
    today_8pm_in_utc = today_8pm_local.astimezone(ZoneInfo("UTC"))
    assert task.due == today_8pm_in_utc

    # But also make sure that it renders correctly when printed to the console.
    result = nh.invoke(["task", "get", id, "--field", "due"])
    assert result.exit_code == 0
    assert result.stdout.strip() == today_8pm_local.strftime("%Y-%m-%d %H:%M")
