import rich
import logging
from pathlib import Path

import typer

from now_and_here.datastore import SQLiteStore


STOREFILE = ".now_and_here.store.sqlite"

app = typer.Typer(no_args_is_help=True)
logger = logging.getLogger(__name__)


@app.command()
def init():
    """Check if the store exists and create it if it doesn't."""
    store_path = Path(STOREFILE)
    if not SQLiteStore.exists(store_path):
        SQLiteStore.create_self(store_path)
        rich.print(f"Store created at {store_path}")
    else:
        rich.print(f"Store already exists at {store_path}")

@app.command()
def hello():
    print('hello')


@app.callback()
def main(verbosity: int = typer.Option(0, "--verbose", "-v", count=True)):
    """
    Manage users in the awesome CLI app.
    """
    package_logger = logging.getLogger("now_and_here")
    level = max(logging.ERROR - (verbosity * 10), 10)
    package_logger.setLevel(level)    

if __name__ == "__main__":
    app()