import sqlite3

SORT_COLUMNS = {
    "invoiceId": "invoice_id",
    "date": "invoice_date",
    "units": "units",
    "revenue": "revenue",
    "margin": "margin",
    "marginPct": "margin_pct",
    "stockOnHand": "stock_on_hand",
    "reorderLevel": "reorder_level",
    "leadTimeDays": "lead_time_days",
    "age": "customer_age",
}

ROW_COLUMNS = """
    invoice_id AS invoiceId, invoice_date AS date, city, store_format AS storeFormat,
    category, brand, channel, payment_mode AS paymentMode, units, cost_price AS costPrice,
    selling_price AS sellingPrice, revenue, cost, margin, margin_pct AS marginPct,
    stock_on_hand AS stockOnHand, reorder_level AS reorderLevel, lead_time_days AS leadTimeDays,
    customer_age AS age, COALESCE(customer_gender, 'N/A') AS gender, loyalty_flag AS loyalty
"""


def build_where(filters: dict) -> tuple[str, list]:
    clauses = []
    params: list = []

    simple_map = {
        "city": "city",
        "category": "category",
        "storeFormat": "store_format",
        "channel": "channel",
        "paymentMode": "payment_mode",
        "brand": "brand",
    }
    for key, column in simple_map.items():
        value = filters.get(key)
        if value:
            clauses.append(f"{column} = ?")
            params.append(value)

    if filters.get("gender"):
        clauses.append("COALESCE(customer_gender, 'N/A') = ?")
        params.append(filters["gender"])

    if filters.get("loyalty") is not None:
        clauses.append("loyalty_flag = ?")
        params.append(filters["loyalty"])

    if filters.get("month"):
        clauses.append("substr(invoice_date, 1, 7) = ?")
        params.append(filters["month"])

    if filters.get("stockRisk"):
        clauses.append("stock_on_hand <= reorder_level")

    if filters.get("overstock"):
        clauses.append("stock_on_hand > 3 * reorder_level")

    if filters.get("ageMissing"):
        clauses.append("customer_age IS NULL")

    if filters.get("search"):
        clauses.append("CAST(invoice_id AS TEXT) LIKE ?")
        params.append(f"%{filters['search']}%")

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    return where, params


def query_records(
    conn: sqlite3.Connection,
    filters: dict,
    sort_by: str,
    sort_dir: str,
    page: int,
    page_size: int,
) -> tuple[list[dict], int]:
    where, params = build_where(filters)

    total = conn.execute(f"SELECT COUNT(*) AS c FROM sales {where}", params).fetchone()["c"]

    sort_col = SORT_COLUMNS.get(sort_by, "invoice_date")
    direction = "ASC" if sort_dir == "asc" else "DESC"

    offset = page * page_size
    rows = conn.execute(
        f"""
        SELECT {ROW_COLUMNS} FROM sales
        {where}
        ORDER BY {sort_col} {direction}
        LIMIT ? OFFSET ?
        """,
        [*params, page_size, offset],
    ).fetchall()

    return [dict(row) for row in rows], total


def query_all_matching(conn: sqlite3.Connection, filters: dict) -> list[dict]:
    where, params = build_where(filters)
    rows = conn.execute(f"SELECT {ROW_COLUMNS} FROM sales {where}", params).fetchall()
    return [dict(row) for row in rows]
