import random
import string
from pathlib import Path

import pytest

from now_and_here.datastore import DataStore
from now_and_here.datastore.sqlite_store import UnstructuredSQLiteStore
from now_and_here.datastore.sqlite_store.create import create_db


@pytest.fixture(scope="function")
def temp_unstructured_sqlite_store(
    monkeypatch, tmp_path: Path
) -> UnstructuredSQLiteStore:
    rand_str = "".join(random.choices(string.ascii_lowercase, k=10))
    store_path = Path(tmp_path, f"store_{rand_str}.sqlite")
    create_db(store_path)
    store = UnstructuredSQLiteStore(store_path)

    def get_temp_store() -> UnstructuredSQLiteStore:
        return store

    monkeypatch.setattr("now_and_here.datastore.get_store", get_temp_store)
    return store


@pytest.fixture(scope="function")
def temp_store(temp_unstructured_sqlite_store: UnstructuredSQLiteStore) -> DataStore:
    return temp_unstructured_sqlite_store
