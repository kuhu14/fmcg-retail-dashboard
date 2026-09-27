import os
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent.parent / "database" / "fmcg.db"

# Single shared connection: the API is read-only (SELECT-only), so there is
# no write-conflict risk, and reusing one connection is what makes the
# in-process caches below possible (a fresh sqlite3.connect() per request
# would never hit as the same cache key).
_conn = sqlite3.connect(DB_PATH, check_same_thread=False)
_conn.row_factory = sqlite3.Row


def get_db() -> sqlite3.Connection:
    return _conn


def db_version() -> float:
    """The database file's mtime, used as a cache key so cached responses
    auto-invalidate whenever `database/load-data.mjs` rewrites fmcg.db."""
    return os.path.getmtime(DB_PATH)
