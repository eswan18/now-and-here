import logging
import sqlite3
from pathlib import Path

TABLES = ["tasks", "projects", "labels"]
logger = logging.getLogger(__name__)


def create_db(path: Path):
    with sqlite3.connect(path) as conn:
        for table in TABLES:
            query = (
                f"CREATE TABLE IF NOT EXISTS {table} ("
                "id VARCHAR(12) PRIMARY KEY,"
                "json TEXT NOT NULL"
                ")"
            )
            logger.debug(query)
            conn.execute(query)
            logger.info(f"Created table {table}")
        conn.commit()
