from datetime import datetime, timedelta
from typing import Any

import typer
from rich.prompt import IntPrompt, Prompt

from now_and_here import datastore
from now_and_here.console import console
from now_and_here.datastore.errors import RecordNotFoundError
from now_and_here.models.common import format_id
from now_and_here.models.repeat_interval import try_parse
from now_and_here.models.task import Task
from now_and_here.time import format_time, parse_time

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
    include_child_projects: bool = typer.Option(
        False, "--include-child-projects", help="Include tasks in child projects."
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
    """List all tasks."""
    if project_id is not None:
        project_id = project_id.replace("-", "")
    store = datastore.get_store()
    tasks = store.get_tasks(
        sort_by=sort,
        desc=desc,
        project_name=project_name,
        project_id=project_id,
        include_child_projects=include_child_projects,
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
    store = datastore.get_store()
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
        "Due date \\[blank for None]",
        console=console,
        default=None,
        show_default=True,
    )
    if due:
        task.due = parse_time(due, warn_on_past=True)
    repeat = Prompt.ask(
        "Repeat interval \\[blank for None]",
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
        default="N",
        show_default=True,
    )
    if in_project.lower().startswith("y"):
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
def get(id: str, fields: list[str] = typer.Option(None, "--field", "-f")):
    store = datastore.get_store()
    id = id.replace("-", "")
    task = store.get_task(id)
    if len(fields) == 0:
        console.print(task)
        return
    to_print: list[Any] = []
    valid_fields = ["name", "description", "priority", "project", "due", "repeat"]
    for field in fields:
        if field not in valid_fields:
            console.print(f"[red]Error:[/] Unknown field '{field}'")
            valid_fields_str = "'" + "', '".join(valid_fields) + "'"
            console.print(f"Must be one of {valid_fields_str}")
            raise typer.Exit(1)
        match field:
            case "name":
                to_print.append(task.name)
            case "description" | "desc":
                to_print.append(task.description)
            case "priority":
                to_print.append(task.priority)
            case "project":
                if task.project is None:
                    to_print.append(None)
                else:
                    to_print.append(format_id(task.project.id))
            case "due":
                if task.due is None:
                    to_print.append(None)
                else:
                    to_print.append(format_time(task.due))
            case "repeat":
                to_print.append(task.repeat)
    for line in to_print:
        if line is None:
            console.print()
        else:
            console.print(str(line))


@task_app.command()
def delete(ids: list[str]):
    """Delete one or more tasks."""
    store = datastore.get_store()
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
        store = datastore.get_store()
        try:
            task = store.get_task(id)
        except RecordNotFoundError:
            console.print(f"[red]Error:[/red] Task [cyan]{id}[/cyan] not found")
            raise typer.Exit(1)
    valid_fields = [
        "name",
        "description",
        "priority",
        "due",
        "save",
        "repeat",
        "project",
        "",
    ]
    while True:
        console.print(task)
        field_name = Prompt.ask(
            "Update which field? \\[or 'save' to confirm changes]",
            console=console,
            choices=valid_fields,
        )
        match field_name:
            case "name":
                task.name = Prompt.ask("New value for name", console=console)
            case "description":
                task.description = Prompt.ask(
                    "New value for description",
                    console=console,
                    default=None,
                    show_default=True,
                )
            case "priority":
                task.priority = IntPrompt.ask(
                    "New value for priority",
                    choices=list("0123"),
                    default=0,
                    console=console,
                )
            case "due":
                due_str = Prompt.ask(
                    "New value for due \\[blank for None]",
                    console=console,
                    default=None,
                    show_default=True,
                )
                if due_str:
                    task.due = parse_time(due_str, warn_on_past=True)
                else:
                    task.due = None
            case "repeat":
                repeat_str = Prompt.ask(
                    "New value for repeat \\[blank for None]",
                    console=console,
                    default=None,
                    show_default=True,
                )
                if repeat_str:
                    task.repeat = try_parse(repeat_str)
                    if task.repeat is None:
                        console.print(f"Could not parse repeat interval '{repeat_str}'")
                        typer.Exit(1)
                else:
                    task.repeat = None
            case "project":
                projects = {project.name: project for project in store.get_projects()}
                project_name = Prompt.ask(
                    "New value for project",
                    choices=list(projects.keys()),
                    console=console,
                )
                task.project = projects[project_name]
            case "save" | "":
                break
            case _:
                raise ValueError(
                    f"Field name {field_name} must be one of {valid_fields}"
                )
        console.print("\nUpdated task:")
    store.update_task(id, task)
    console.print(f"[green]Task [cyan]{id}[/cyan] updated![/green]")


@task_app.command()
def checkoff(ids: list[str]):
    """Mark a task as done or not done."""
    store = datastore.get_store()
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
    store = datastore.get_store()
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
    store = datastore.get_store()
    tasks = store.get_tasks(due_before=before, include_done=include_done)
    console.print(Task.as_rich_table(tasks))


@task_app.command()
def search(query: str):
    """Search for tasks by name or description."""
    store = datastore.get_store()
    tasks = store.search_tasks(query)
    console.print(Task.as_rich_table(tasks))


@task_app.command()
def regen_embeddings():
    """Regenerate the embeddings for all tasks."""
    store = datastore.get_store()
    store.regen_embeddings()
    console.print("[green]Embeddings regenerated![/green]")
