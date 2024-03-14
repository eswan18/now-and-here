from __future__ import annotations
from typing import Literal
from pathlib import Path

from pydantic.dataclasses import dataclass

STORE_TYPE = Literal["unstructured_sqlite_store"]

DEFAULT_STORE_FILE_LOCATION = "~/.now_and_here/store.sqlite3"


@dataclass
class PartialAppConfig:
    store_type: STORE_TYPE | None = None
    store_file_path: Path | None = None

    def is_complete(self) -> bool:
        if self.store_type is None:
            return False
        if self.store_file_path is None:
            return False
        return True

    def merge(self, other: PartialAppConfig) -> PartialAppConfig:
        store_type = other.store_type or self.store_type
        store_file_path = other.store_file_path or self.store_file_path
        return PartialAppConfig(store_type=store_type, store_file_path=store_file_path)


@dataclass
class AppConfig:
    store_type: STORE_TYPE
    store_file_path: Path

    @classmethod
    def from_partial(cls, partial: PartialAppConfig) -> AppConfig:
        if partial.store_type is None:
            raise ValueError(
                "Cannot create AppConfig from partial config with no store_type"
            )
        if partial.store_file_path is None:
            raise ValueError(
                "Cannot create AppConfig from partial config with no store_file_path"
            )
        return cls(
            store_type=partial.store_type,
            store_file_path=partial.store_file_path,
        )
