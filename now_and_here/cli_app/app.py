from pathlib import Path
import logging

import rich
import typer

from now_and_here.datastore import UnstructuredSQLiteStore


STOREFILE = ".now_and_here.store.sqlite"

app = typer.Typer(no_args_is_help=True)


@app.command()
def init():
    """Check if the store exists and create it if it doesn't."""
    store_path = Path(STOREFILE)
    if not UnstructuredSQLiteStore.exists(store_path):
        UnstructuredSQLiteStore.create_self(store_path)
        rich.print(f"Store created at {store_path}")
    else:
        rich.print(f"Store already exists at {store_path}")


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
        typer.Exit(1)
    package_logger = logging.getLogger("now_and_here")
    package_logger.setLevel(level)    