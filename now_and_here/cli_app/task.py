from datetime import datetime, timedelta

import typer

from now_and_here.models.task import Task
from .common import get_store
from now_and_here.models.common import format_id
from now_and_here.time import parse_time
from now_and_here.console import console


task_app = typer.Typer(
    help="Manage tasks.",
    no_args_is_help=True,
)


# We have to name this "list_" to avoid clobbering Python's built-in list function.
@task_app.command(name="list")
def list_(
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
    console.print("[green]Task saved![/green]")
    console.print(f"ID: [cyan]{format_id(task.id)}[/cyan]")


@task_app.command()
def delete(ids: list[str]):
    """Delete one or more tasks."""
    store = get_store()
    for raw_id in ids:
        # Since we display IDs with dashes in them but don't actually store dashes,
        # strip them from input.
        id = raw_id.replace("-", "")
        if store.delete_task(id):
            console.print(f"Task [cyan]{raw_id}[/cyan] deleted")
        else:
            console.print(f"[red]Error:[/red] Task [cyan]{raw_id}[/cyan] not found")


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
                due = parse_time(due_str, warn_on_past=True)
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
    due_before: str = typer.Option(
        "now",
        "--by",
        help="Show tasks due at or before this time.",
    ),
):
    match due_before:
        case "now":
            before = datetime.utcnow()
        case "today":
            before = datetime.utcnow().replace(hour=23, minute=59, second=59)
        case "tomorrow":
            before = datetime.utcnow().replace(
                hour=23, minute=59, second=59
            ) + timedelta(days=1)
        case _:
            before = parse_time(due_before)
    """List tasks that are currently due."""
    store = get_store()
    tasks = store.get_tasks(due_before=before, include_done=include_done)
    console.print(Task.as_rich_table(tasks))
