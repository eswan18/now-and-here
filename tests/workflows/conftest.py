import random
import string
from pathlib import Path

import pytest

from now_and_here.datastore import DataStore
from now_and_here.datastore.sqlite_store import UnstructuredSQLiteStore
from now_and_here.datastore.sqlite_store.create import create_db


@pytest.fixture(scope="function")
def temp_store(monkeypatch, tmp_path: Path):
    rand_str = "".join(random.choices(string.ascii_lowercase, k=10))
    store_path = Path(tmp_path, f"store_{rand_str}.sqlite")

    def get_temp_store() -> DataStore:
        create_db(store_path)
        return UnstructuredSQLiteStore(store_path)

    monkeypatch.setattr("now_and_here.datastore.get_store", get_temp_store)
