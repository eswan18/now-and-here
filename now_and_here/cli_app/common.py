from pathlib import Path

import typer

from now_and_here.datastore import UnstructuredSQLiteStore, DataStore
from now_and_here.console import console


STOREFILE = ".now_and_here.store.sqlite"


def get_store() -> DataStore:
    path = Path(STOREFILE)
    if not UnstructuredSQLiteStore.exists(path):
        typer.echo("No datastore found. Run 'nh init' to create one.")
        raise typer.Exit(1)
    return UnstructuredSQLiteStore(path, console)
