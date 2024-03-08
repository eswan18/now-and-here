import logging
from pathlib import Path
import sqlite3

TABLES = ['tasks', 'projects', 'labels']
logger = logging.getLogger(__name__)

def create_db(path: Path):
    with sqlite3.connect(path) as conn:
        for table in TABLES:
            query = (
                f"CREATE TABLE IF NOT EXISTS {table} ("
                "id INTEGER PRIMARY KEY AUTOINCREMENT, "
                "json TEXT NOT NULL"
                ")"
            )
            logger.debug(query)
            conn.execute(query)
            logger.info(f"Created table {table}")
        conn.commit()