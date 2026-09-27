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


@lru_cache(maxsize=4)
def _cached_summary(version: float) -> dict:
    return build_summary(get_db())


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
def get_summary():
    return _cached_summary(db_version())


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
