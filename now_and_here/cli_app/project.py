import typer
from rich.prompt import Prompt

from now_and_here.console import console
from now_and_here.datastore.errors import RecordNotFoundError
from now_and_here.models.common import format_id
from now_and_here.models.project import Project

from .common import get_store

project_app = typer.Typer(
    help="Manage projects.",
    no_args_is_help=True,
)


# We have to name this "list_" to avoid clobbering Python's built-in list function.
@project_app.command(name="list")
def list_(
    sort: str = typer.Option("name", "--sort", help="Sort by a column."),
    desc: bool = typer.Option(False, "--desc", help="Sort in descending order."),
    id_only: bool = typer.Option(
        False, "--id-only", help="Only show project IDs, not full details."
    ),
):
    """List all projects."""
    store = get_store()
    projects = store.get_projects(sort_by=sort, desc=desc)
    if id_only:
        console.print("\n".join(format_id(project.id) for project in projects))
    else:
        console.print(Project.as_rich_table(projects))


@project_app.command()
def add(interactive: bool = typer.Option(False, "--interactive", "-i")):
    """Add a project."""
    if not interactive:
        raise typer.BadParameter(
            "Only interactive mode is supported for project creation."
        )
    store = get_store()
    name = Prompt.ask("Project name", console=console)
    project = Project(name=name)  # type: ignore [call-arg]
    project.description = Prompt.ask(
        "Description", console=console, default=None, show_default=True
    )
    has_parent = Prompt.ask(
        "Does this project have a parent? \\[y/N]",
        console=console,
        default="N",
        show_default=True,
    )
    if has_parent.lower().startswith("y"):
        projects = {project.name: project for project in store.get_projects()}
        project_name = Prompt.ask(
            "Project:",
            choices=list(projects.keys()),
            console=console,
        )
        project.parent = projects[project_name]
    with console.status("Saving..."):
        store.save_project(project)
    console.print("[green]Project saved![/green]")
    console.print(f"ID: [cyan]{format_id(project.id)}[/cyan]")


@project_app.command()
def update(id: str, interactive: bool = typer.Option(False, "--interactive", "-i")):
    """Update a project."""
    # Since we display IDs with dashes in them but don't actually store dashes, strip
    # them from input.
    id = id.replace("-", "")
    if not interactive:
        raise typer.BadParameter(
            "Only interactive mode is supported for project updating."
        )
    with console.status("Fetching project..."):
        store = get_store()
        try:
            project = store.get_project(id)
        except RecordNotFoundError:
            console.print(f"[red]Error:[/red] Project [cyan]{id}[/cyan] not found")
            raise typer.Exit(1)
    valid_fields = ["name", "description", "parent", "save", ""]
    while True:
        console.print(project)
        field_name = Prompt.ask(
            "Update which field? \[or 'save' to confirm changes]",
            console=console,
            choices=valid_fields,
        )
        match field_name:
            case "name":
                project.name = Prompt.ask("New value for name", console=console)
            case "description":
                project.description = Prompt.ask(
                    "New value for description",
                    console=console,
                    default=None,
                    show_default=True,
                )
            case "parent":
                projects = {project.name: project for project in store.get_projects()}
                project_name = Prompt.ask(
                    "New value for parent",
                    choices=list(projects.keys()),
                    console=console,
                )
                project.parent = projects[project_name]
            case "save" | "":
                break
            case _:
                raise ValueError(
                    f"Field name {field_name} must be one of {valid_fields}"
                )
        console.print("\nUpdated task:")
    store.update_project(id, project)
    console.print(f"[green]Project [cyan]{id}[/cyan] updated![/green]")
