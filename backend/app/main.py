import csv
import io
import os
from functools import lru_cache

from fastapi import Depends, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from app.aggregates import build_summary
from app.db import db_version, get_db
from app.records import query_all_matching, query_records

app = FastAPI(title="FMCG Retail API")

# Comma-separated extra origins (e.g. the Amplify domain) via env var, on
# top of localhost:3000 for local dev -- avoids a code change + redeploy
# every time the frontend's domain changes (e.g. a future custom domain).
_extra_origins = [o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", *_extra_origins],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    """Lets the browser itself skip a round-trip for a repeated identical GET
    (e.g. toggling back to a filter you already viewed), on top of the
    in-process caching below."""
    response = await call_next(request)
    if request.method == "GET" and request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "public, max-age=30"
    return response


@lru_cache(maxsize=4)
def _latest_month(version: float) -> str:
    row = get_db().execute("SELECT MAX(substr(invoice_date, 1, 7)) AS m FROM sales").fetchone()
    return row["m"]


def _resolve_since_month(months_back: int | None) -> str | None:
    """Turns 'last N months' into a concrete 'YYYY-MM' cutoff, anchored to the
    dataset's own latest month rather than today's date (this is historical
    data, not a live feed) -- so it stays correct regardless of which other
    filters are also active."""
    if months_back is None:
        return None
    year, month = (int(x) for x in _latest_month(db_version()).split("-"))
    total = year * 12 + (month - 1) - (months_back - 1)
    cutoff_year, cutoff_month = divmod(total, 12)
    return f"{cutoff_year:04d}-{cutoff_month + 1:02d}"


def record_filters(
    city: str | None = None,
    category: str | None = None,
    storeFormat: str | None = None,
    channel: str | None = None,
    paymentMode: str | None = None,
    brand: str | None = None,
    gender: str | None = None,
    loyalty: int | None = Query(default=None, ge=0, le=1),
    month: str | None = None,
    monthsBack: int | None = Query(default=None, ge=1, le=12),
    year: int | None = Query(default=None, ge=2000, le=2100),
    stockRisk: bool | None = None,
    overstock: bool | None = None,
    ageMissing: bool | None = None,
    search: str | None = None,
) -> dict:
    return {
        "city": city,
        "category": category,
        "storeFormat": storeFormat,
        "channel": channel,
        "paymentMode": paymentMode,
        "brand": brand,
        "gender": gender,
        "loyalty": loyalty,
        "month": month,
        "sinceMonth": _resolve_since_month(monthsBack),
        "year": year,
        "stockRisk": stockRisk,
        "overstock": overstock,
        "ageMissing": ageMissing,
        "search": search,
    }


def filters_cache_key(filters: dict) -> tuple:
    return tuple(sorted((k, v) for k, v in filters.items() if v is not None))


# In-process caches, keyed on db_version() so a re-run of
# database/load-data.mjs (which rewrites fmcg.db) invalidates them
# automatically instead of serving stale data forever.


@lru_cache(maxsize=256)
def _cached_summary(version: float, filters_key: tuple) -> dict:
    return build_summary(get_db(), dict(filters_key))


@lru_cache(maxsize=1024)
def _cached_records(
    version: float, filters_key: tuple, sort_by: str, sort_dir: str, page: int, page_size: int
) -> tuple[list[dict], int]:
    filters = dict(filters_key)
    return query_records(get_db(), filters, sort_by, sort_dir, page, page_size)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/summary")
def get_summary(filters: dict = Depends(record_filters)):
    # `search` only makes sense against individual invoice rows, not
    # aggregates, so it's dropped before it can affect the summary.
    summary_filters = {k: v for k, v in filters.items() if k != "search"}
    return _cached_summary(db_version(), filters_cache_key(summary_filters))


@app.get("/api/records")
def get_records(
    filters: dict = Depends(record_filters),
    sortBy: str = "date",
    sortDir: str = "desc",
    page: int = Query(default=0, ge=0),
    pageSize: int = Query(default=20, ge=1, le=500),
):
    rows, total = _cached_records(
        db_version(), filters_cache_key(filters), sortBy, sortDir, page, pageSize
    )
    return {"rows": rows, "total": total, "page": page, "pageSize": pageSize}


@app.get("/api/records/export")
def export_records(filters: dict = Depends(record_filters)):
    rows = query_all_matching(get_db(), filters)

    buffer = io.StringIO()
    if rows:
        writer = csv.DictWriter(buffer, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f'attachment; filename="fmcg-export-{len(rows)}-rows.csv"'
        },
    )
