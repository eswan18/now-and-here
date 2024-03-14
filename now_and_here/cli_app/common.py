from pathlib import Path

import typer

from now_and_here.datastore import UnstructuredSQLiteStore, DataStore
from now_and_here.console import console
from now_and_here.config import get_config


def get_store() -> DataStore:
    config = get_config()
    path = Path(config.store_file_path).expanduser()
    if not UnstructuredSQLiteStore.exists(config.store_file_path):
        typer.echo("No datastore found. Run 'nh init' to create one.")
        raise typer.Exit(1)
    return UnstructuredSQLiteStore(path, console)
