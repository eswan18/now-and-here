from datetime import datetime, timedelta

import typer
from rich.prompt import Prompt, IntPrompt

from .common import get_store
from now_and_here.datastore.errors import RecordNotFoundError
from now_and_here.models.task import Task
from now_and_here.models.common import format_id
from now_and_here.models.repeat_interval import try_parse
from now_and_here.time import parse_time, format_time
from now_and_here.console import console


task_app = typer.Typer(
    help="Manage tasks.",
    no_args_is_help=True,
)


# We have to name this "list_" to avoid clobbering Python's built-in list function.
@task_app.command(name="list")
def list_(
    project_name: str = typer.Option(
        None,
        "--project-name",
        "-p",
        help="Only show tasks in a specific project, by name.",
    ),
    project_id: str = typer.Option(
        None,
        "--project-id",
        help="Only show tasks in a specific project, by id.",
    ),
    sort: str = typer.Option("due", "--sort", help="Sort by a column."),
    desc: bool = typer.Option(False, "--desc", help="Sort in descending order."),
    include_done: bool = typer.Option(
        False, "--show-done", help="Include tasks marked as done."
    ),
    id_only: bool = typer.Option(
        False, "--id-only", help="Only show task IDs, not full details."
    ),
):
    if project_id is not None:
        project_id = project_id.replace("-", "")
    """List all tasks."""
    store = get_store()
    tasks = store.get_tasks(
        sort_by=sort,
        desc=desc,
        project_name=project_name,
        project_id=project_id,
        include_done=include_done,
    )
    if id_only:
        console.print("\n".join(format_id(task.id) for task in tasks))
    else:
        console.print(Task.as_rich_table(tasks))


@task_app.command()
def add(interactive: bool = typer.Option(False, "--interactive", "-i")):
    """Add a task."""
    if not interactive:
        raise typer.BadParameter(
            "Only interactive mode is supported for task creation."
        )
    store = get_store()
    name = Prompt.ask("Task name", console=console)
    task = Task(name=name)  # type: ignore [call-arg]
    task.description = Prompt.ask(
        "Description", console=console, default=None, show_default=True
    )
    priority = IntPrompt.ask(
        "Priority", choices=list("0123"), default=0, console=console
    )
    task.priority = priority
    due = Prompt.ask(
        "Due date \[blank for None]",
        console=console,
        default=None,
        show_default=True,
    )
    if due:
        task.due = parse_time(due, warn_on_past=True)
    repeat = Prompt.ask(
        "Repeat interval \[blank for None]",
        console=console,
        default=None,
        show_default=True,
    )
    if repeat:
        task.repeat = try_parse(repeat)
        if task.repeat is None:
            console.print(f"Could not parse repeat interval '{repeat}'")
            raise typer.Exit(1)
    in_project = Prompt.ask(
        "Is this task part of a project? \\[y/N]",
        console=console,
        default=False,
        show_default=True,
    )
    if in_project:
        projects = {project.name: project for project in store.get_projects()}
        project_name = Prompt.ask(
            "Project:",
            choices=list(projects.keys()),
            console=console,
        )
        task.project = projects[project_name]
    with console.status("Saving..."):
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
        try:
            task = store.get_task(id)
        except RecordNotFoundError:
            console.print(f"[red]Error:[/red] Task [cyan]{id}[/cyan] not found")
            raise typer.Exit(1)
    task.update_from_prompt(console)
    store.update_task(id, task)
    console.print(f"[green]Task [cyan]{id}[/cyan] updated![/green]")


@task_app.command()
def checkoff(ids: list[str]):
    """Mark a task as done or not done."""
    store = get_store()
    for raw_id in ids:
        # Since we display IDs with dashes in them but don't actually store dashes, strip
        # them from input.
        id = raw_id.replace("-", "")
        was_updated, next_occurrence = store.checkoff_task(id)
        if was_updated:
            console.print(f"[green]Task [cyan]{raw_id}[/cyan] marked as done![/green]")
            if next_occurrence:
                nice_time = format_time(next_occurrence)
                console.print(f"Next occurrence: [blue]{nice_time}[/blue]")
        else:
            console.print(
                f"[red]Warning[/red]: Task [cyan]{raw_id}[/cyan] is already marked as done and was not updated"
            )


@task_app.command()
def uncheckoff(
    ids: list[str],
):
    """Mark a task as not done."""
    store = get_store()
    for raw_id in ids:
        # Since we display IDs with dashes in them but don't actually store dashes, strip
        # them from input.
        id = raw_id.replace("-", "")
        was_updated = store.uncheckoff_task(id)
        if was_updated:
            console.print(f"[green]Task [cyan]{raw_id}[/cyan] unmarked as done[/green]")
        else:
            console.print(
                f"[red]Warning[/red]: Task [cyan]{raw_id}[/cyan] is not marked as done and was not updated"
            )


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
