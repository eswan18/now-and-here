import random
import string
from pathlib import Path

import pytest
from typer.testing import CliRunner

from now_and_here.cli import app
from now_and_here.datastore import DataStore
from now_and_here.datastore.sqlite_store import UnstructuredSQLiteStore
from now_and_here.datastore.sqlite_store.create import create_db

from .nhrunner import NHRunner


@pytest.fixture(scope="function")
def temp_store(monkeypatch, tmp_path: Path) -> DataStore:
    rand_str = "".join(random.choices(string.ascii_lowercase, k=10))
    store_path = Path(tmp_path, f"store_{rand_str}.sqlite")
    create_db(store_path)
    store = UnstructuredSQLiteStore(store_path)

    def get_temp_store() -> DataStore:
        return store

    monkeypatch.setattr("now_and_here.datastore.get_store", get_temp_store)
    return store


@pytest.fixture(scope="session")
def nh() -> NHRunner:
    """An instance of the nh command that can be invoked."""
    runner = CliRunner()
    return NHRunner(runner, app)
