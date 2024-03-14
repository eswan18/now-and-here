from pathlib import Path

from .app_config import PartialAppConfig

DEFAULT_STORE_PATH = Path("~/.now-and-here/store.sqlite3").expanduser()

default_config = PartialAppConfig(
    store_type="unstructured_sqlite_store",
    store_file_path=DEFAULT_STORE_PATH,
)
