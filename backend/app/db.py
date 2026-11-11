import os
import sqlite3
import threading
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent.parent / "database" / "fmcg.db"

# FastAPI runs sync route handlers in a thread pool, so concurrent requests
# genuinely execute in parallel threads. A single sqlite3.Connection shared
# across those threads isn't safe to query concurrently -- even with
# check_same_thread=False (which only disables Python's same-thread check,
# not SQLite's own internal statement state), two threads calling execute()
# on the same connection at once can interleave and hand back a row of all
# NULLs. One connection per thread, lazily created and cached on that
# thread's local storage, avoids the race while still reusing a connection
# across requests handled by the same pooled worker thread.
_local = threading.local()


def get_db() -> sqlite3.Connection:
    conn = getattr(_local, "conn", None)
    if conn is None:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        _local.conn = conn
    return conn


def db_version() -> float:
    """The database file's mtime, used as a cache key so cached responses
    auto-invalidate whenever `database/load-data.mjs` rewrites fmcg.db."""
    return os.path.getmtime(DB_PATH)
