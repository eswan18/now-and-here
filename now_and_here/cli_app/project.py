import typer

from now_and_here.console import console
from .common import get_store
from now_and_here.models.common import format_id
from now_and_here.models.project import Project


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
    project = Project.from_prompt(console)
    with console.status("Saving..."):
        store = get_store()
        store.save_project(project)
    console.print("[green]Project saved![/green]")
    console.print(f"ID: [cyan]{format_id(project.id)}[/cyan]")
