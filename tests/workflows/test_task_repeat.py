import re

from now_and_here.datastore import DataStore

from .nhrunner import NHRunner

# TODO: incorporate freezegun


def test_task_repeat(temp_store: DataStore, nh: NHRunner):
    """Test that repeating tasks repeat correctly."""
    # Create a repeating task.
    args = ["task", "add", "-i"]
    input = (
        "\n".join(
            [
                "test_repeating_task",  # name
                "",  # description
                "1",  # priority
                "today 8pm",  # due date
                "every wednesday at 3:17",  # repeat (None)
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
    result = nh.invoke(["task", "get", id, "--field", "repeat"])
    assert result.exit_code == 0
    expected_output = "WeeklyInterval(weeks=1,weekdays={<Weekday.WEDNESDAY:2>},at=datetime.time(3,17))"
    output = result.stdout.replace(" ", "").replace("\n", "").replace("\t", "")
    assert expected_output == output
