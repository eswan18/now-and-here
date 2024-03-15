import re

from now_and_here.datastore import DataStore

from .nhrunner import NHRunner


def test_add_task(temp_store: DataStore, nh: NHRunner):
    # Add a task
    args = ["task", "add", "-i"]
    input = (
        "\n".join(
            [
                "test_task",  # name
                "test_description",  # description
                "0",  # priority
                "",  # due date (none)
                "",  # repeat (none)
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
    # Make there there is an ID in the output.
    match = re.search(r"ID:\s+(?P<id>[a-zA-Z0-9\-]+)", output)
    assert match is not None

    # Make sure the task was added.
    id = match.group("id").replace("-", "")
    task = temp_store.get_task(id)
    assert task.name == "test_task"

    # Fetch tasks by ID. There should be just one.
    result = nh.invoke(["task", "list", "--id-only"])
    assert result.exit_code == 0
    output = nh.remove_ansi_codes(result.stdout)
    ids = [id.replace("-", "") for id in output.strip().split("\n")]
    assert ids == [id]
