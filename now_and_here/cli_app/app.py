import logging
from pathlib import Path

import typer

from now_and_here.config import get_config
from now_and_here.console import console
from now_and_here.datastore import UnstructuredSQLiteStore

from .config import config_app
from .label import label_app
from .project import project_app
from .task import task_app

app = typer.Typer(
    help="Locally-hosted task management system.",
    no_args_is_help=True,
)
app.add_typer(task_app, name="task")
app.add_typer(project_app, name="project")
app.add_typer(label_app, name="label")
app.add_typer(config_app, name="config")
# Add "aliases" -- shorter versions of the command names.
app.add_typer(task_app, name="t")
app.add_typer(project_app, name="p")
app.add_typer(label_app, name="l")


@app.command()
def init():
    """Check if the store exists and create it if it doesn't."""
    config = get_config()
    store_path = Path(config.store_file_path)
    match config.store_type:
        case "unstructured_sqlite_store":
            if not UnstructuredSQLiteStore.exists(store_path):
                with console.status("Creating store..."):
                    UnstructuredSQLiteStore.create_self(store_path)
                console.print(
                    f"[green]Success![/] Store created at [magenta]{store_path}[/]"
                )
            else:
                console.print(
                    f"[yellow]No action taken[/]: Store already exists at [magenta]{store_path}[/]"
                )
        case _:
            raise ValueError(f"Unknown store type: {config.store_type}")


@app.callback()
def main(verbosity: int = typer.Option(0, "--verbose", "-v", count=True)):
    if verbosity == 0:
        level = logging.WARNING
    elif verbosity == 1:
        level = logging.INFO
    elif verbosity == 2:
        level = logging.DEBUG
    else:
        typer.echo("Max verbosity level is 2", err=True)
        raise typer.Exit(1)
    package_logger = logging.getLogger("now_and_here")
    package_logger.setLevel(level)
