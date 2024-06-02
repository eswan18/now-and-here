import logging
import sqlite3
from pathlib import Path

import sqlite_vss

TABLES = ["tasks", "projects", "labels"]
logger = logging.getLogger(__name__)


def create_db(path: Path):
    with sqlite3.connect(path) as conn:
        # Create the core tables.
        for table in TABLES:
            stmt = (
                f"CREATE TABLE IF NOT EXISTS {table} ("
                "id VARCHAR(12) PRIMARY KEY,"
                "json TEXT NOT NULL"
                ")"
            )
            logger.debug(stmt)
            conn.execute(stmt)
            logger.info(f"Created table {table}")

        # Load the sqlite_vss extension.
        conn.enable_load_extension(True)
        sqlite_vss.load(conn)
        conn.enable_load_extension(False)

        # Create the embeddings table.
        stmt = "CREATE VIRTUAL TABLE IF NOT EXISTS vss_tasks USING vss0(a(2));"
        logger.debug(stmt)
        conn.execute(stmt)
        logger.info("Created virtual table vss_tasks")

        conn.commit()
