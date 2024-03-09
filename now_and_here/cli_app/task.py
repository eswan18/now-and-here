from datetime import datetime

import typer

from now_and_here.models.task import Task
from .common import get_store
from now_and_here.models.common import format_id
from now_and_here.time import parse_time
from .console import console


task_app = typer.Typer(
    help="Manage tasks.",
    no_args_is_help=True,
)


@task_app.command()
def list(
    sort: str = typer.Option("due", "--sort", help="Sort by a column."),
    desc: bool = typer.Option(False, "--desc", help="Sort in descending order."),
    include_done: bool = typer.Option(
        False, "--show-done", help="Include tasks marked as done."
    ),
):
    """List all tasks."""
    store = get_store()
    tasks = store.get_tasks(sort_by=sort, desc=desc, include_done=include_done)
    console.print(Task.as_rich_table(tasks))


@task_app.command()
def add(interactive: bool = typer.Option(False, "--interactive", "-i")):
    """Add a task."""
    if not interactive:
        raise typer.BadParameter(
            "Only interactive mode is supported for task creation."
        )
    task = Task.from_prompt(console)
    with console.status("Saving..."):
        store = get_store()
        store.save_task(task)
    console.print("Task saved!")
    console.print(f"ID [cyan]{format_id(task.id)}[/cyan]")


@task_app.command()
def delete(id: str):
    """Delete a task."""
    # Since we display IDs with dashes in them but don't actually store dashes, strip
    # them from input.
    id = id.replace("-", "")
    store = get_store()
    if store.delete_task(id):
        console.print("Task deleted")
    else:
        console.print("Task not found")


@task_app.command()
def update(id: str, interactive: bool = typer.Option(False, "--interactive", "-i")):
    """Update a task."""
    # Since we display IDs with dashes in them but don't actually store dashes, strip
    # them from input.
    id = id.replace("-", "")
    if not interactive:
        raise typer.BadParameter(
            "Only interactive mode is supported for task updating."
        )
    with console.status("Fetching task..."):
        store = get_store()
        task = store.get_task(id)
    console.print(task)
    console.print()
    field_name = console.input("Update which field? ")
    field_name = field_name.lower()
    valid_fields = ("name", "description", "priority", "done", "due")
    match field_name:
        case "name":
            name = console.input("New value for name: ")
            task.name = name
        case "description":
            description = console.input("New value for description: ")
            task.description = description
        case "priority":
            priority = console.input("New value for priority: ")
            task.priority = int(priority)
        case "done":
            done = console.input("New value for done: ")
            match done.lower():
                case "yes" | "y" | "true" | "t":
                    task.done = True
                case "no" | "n" | "false" | "f":
                    task.done = False
                case _:
                    raise ValueError(f"Invalid value for done: '{done}'")
        case "due":
            due_str = console.input(
                "New value for due [blank for None]: ", markup=False
            )
            if due_str:
                due = parse_time(due_str)
            else:
                due = None
            task.due = due
        case "exit" | "quit" | "":
            return
        case _:
            raise ValueError(f"Field name {field_name} must be one of {valid_fields}")
    store.update_task(id, task)


@task_app.command()
def done(id: str):
    """Mark a task as done."""
    # Since we display IDs with dashes in them but don't actually store dashes, strip
    # them from input.
    id = id.replace("-", "")
    store = get_store()
    task = store.get_task(id)
    task.done = True
    store.update_task(id, task)
    console.print("Task marked as done")


@task_app.command()
def due(
    include_done: bool = typer.Option(
        False, "--show-done", help="Include tasks marked as done."
    ),
):
    """List tasks that are currently due."""
    store = get_store()
    tasks = store.get_tasks(due_before=datetime.utcnow(), include_done=include_done)
    console.print(Task.as_rich_table(tasks))
