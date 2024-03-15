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

    # Clean up the output (remove color codes, etc)
    ansi_escape = re.compile(r"\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])")
    output = ansi_escape.sub("", result.stdout)
    # Make there there is an ID in the output.
    match = re.search(r"ID: (?P<id>[a-zA-Z0-9\-]+)", output)
    assert match is not None

    # Make sure the task was added.
    id = match.group("id").replace("-", "")
    task = temp_store.get_task(id)
    assert task.name == "test_task"
