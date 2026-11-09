"""Aggregates and record queries for `intl_sales` -- the global multi-country
transactions table that powers the International/Exports department. Kept
separate from aggregates.py/records.py (the India FMCG `sales` table) since
the two schemas don't overlap: this table has no city/store/channel/brand/
cost/stock columns, just country, category, payment method, age/generation,
price and quantity.
"""
import sqlite3


def r2(x: float) -> float:
    return round(x, 2) if x is not None else 0.0


SORT_COLUMNS = {
    "transactionId": "transaction_id",
    "date": "transaction_date",
    "country": "country",
    "category": "category",
    "paymentMethod": "payment_method",
    "generation": "generation",
    "age": "age",
    "unitPrice": "unit_price",
    "quantity": "quantity",
    "revenue": "revenue",
}

ROW_COLUMNS = """
    transaction_id AS transactionId, transaction_date AS date, country, category,
    payment_method AS paymentMethod, age, generation, unit_price AS unitPrice,
    quantity, revenue
"""


def build_where(filters: dict) -> tuple[str, list]:
    clauses = []
    params: list = []

    simple_map = {
        "country": "country",
        "category": "category",
        "paymentMethod": "payment_method",
        "generation": "generation",
    }
    for key, column in simple_map.items():
        value = filters.get(key)
        if value:
            clauses.append(f"{column} = ?")
            params.append(value)

    if filters.get("month"):
        clauses.append("substr(transaction_date, 1, 7) = ?")
        params.append(filters["month"])

    if filters.get("year"):
        clauses.append("substr(transaction_date, 1, 4) = ?")
        params.append(str(filters["year"]))

    if filters.get("quarter"):
        quarter = filters["quarter"]
        start_month = (quarter - 1) * 3 + 1
        end_month = start_month + 2
        clauses.append("CAST(substr(transaction_date, 6, 2) AS INTEGER) BETWEEN ? AND ?")
        params.append(start_month)
        params.append(end_month)

    if filters.get("search"):
        clauses.append("transaction_id LIKE ?")
        params.append(f"%{filters['search']}%")

    where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
    return where, params


def dim_breakdown(conn: sqlite3.Connection, column: str, key_name: str, where: str, params: list) -> list[dict]:
    rows = conn.execute(
        f"""
        SELECT {column} AS name, SUM(revenue) AS revenue, SUM(quantity) AS units, COUNT(*) AS orders
        FROM intl_sales
        {where}
        GROUP BY {column}
        ORDER BY revenue DESC
        """,
        params,
    ).fetchall()
    return [
        {
            key_name: row["name"],
            "revenue": r2(row["revenue"]),
            "units": row["units"],
            "orders": row["orders"],
        }
        for row in rows
    ]


def build_summary(conn: sqlite3.Connection, filters: dict | None = None) -> dict:
    where, params = build_where(filters or {})

    totals_row = conn.execute(
        f"SELECT SUM(revenue) AS revenue, SUM(quantity) AS units, COUNT(*) AS orders FROM intl_sales {where}",
        params,
    ).fetchone()

    orders = totals_row["orders"] or 0
    revenue = totals_row["revenue"] or 0
    units = totals_row["units"] or 0

    totals = {
        "revenue": r2(revenue),
        "units": units,
        "orders": orders,
        "avgOrderValue": r2(revenue / orders) if orders else 0.0,
    }

    by_country = dim_breakdown(conn, "country", "country", where, params)
    by_category = dim_breakdown(conn, "category", "category", where, params)
    by_payment_method = dim_breakdown(conn, "payment_method", "paymentMethod", where, params)
    by_generation = dim_breakdown(conn, "generation", "generation", where, params)

    monthly_rows = conn.execute(
        f"""
        SELECT substr(transaction_date, 1, 7) AS month, SUM(revenue) AS revenue,
               SUM(quantity) AS units, COUNT(*) AS orders
        FROM intl_sales {where}
        GROUP BY month ORDER BY month
        """,
        params,
    ).fetchall()
    monthly_trend = [
        {
            "month": row["month"],
            "revenue": r2(row["revenue"]),
            "units": row["units"],
            "orders": row["orders"],
            "avgOrderValue": r2(row["revenue"] / row["orders"]) if row["orders"] else 0.0,
        }
        for row in monthly_rows
    ]

    yearly_rows = conn.execute(
        f"""
        SELECT substr(transaction_date, 1, 4) AS year, SUM(revenue) AS revenue,
               SUM(quantity) AS units, COUNT(*) AS orders
        FROM intl_sales {where}
        GROUP BY year ORDER BY year
        """,
        params,
    ).fetchall()
    yearly_trend = [
        {
            "year": row["year"],
            "revenue": r2(row["revenue"]),
            "units": row["units"],
            "orders": row["orders"],
            "avgOrderValue": r2(row["revenue"] / row["orders"]) if row["orders"] else 0.0,
        }
        for row in yearly_rows
    ]

    meta = {
        "recordCount": orders,
        "columns": [
            "Transaction_ID", "Transaction_Date", "Country", "Product_Category",
            "Payment_Method", "Age", "Generation", "Unit_Price", "Quantity", "Revenue",
        ],
    }

    summary = {
        "meta": meta,
        "totals": totals,
        "byCountry": by_country,
        "byCategory": by_category,
        "byPaymentMethod": by_payment_method,
        "byGeneration": by_generation,
        "monthlyTrend": monthly_trend,
        "yearlyTrend": yearly_trend,
    }
    summary["insights"] = build_insights(summary)
    return summary


def build_insights(summary: dict) -> list[dict]:
    if summary["totals"]["orders"] == 0:
        return []

    insights = []

    by_country = summary["byCountry"]
    if len(by_country) >= 2:
        top_country, bottom_country = by_country[0], by_country[-1]
        share = r2((top_country["revenue"] / summary["totals"]["revenue"]) * 100) if summary["totals"]["revenue"] else 0.0
        insights.append(
            {
                "id": "country-concentration",
                "severity": "info",
                "title": f"{top_country['country']} leads at {share}% of revenue",
                "description": (
                    f"{top_country['country']} generates ${top_country['revenue']:,.0f} across "
                    f"{top_country['orders']} orders, while {bottom_country['country']} trails at "
                    f"${bottom_country['revenue']:,.0f}."
                ),
                "actionLabel": f"View {top_country['country']} orders",
                "filter": {"country": top_country["country"]},
            }
        )

    by_category = summary["byCategory"]
    if by_category:
        top_cat = by_category[0]
        cat_share = r2((top_cat["revenue"] / summary["totals"]["revenue"]) * 100) if summary["totals"]["revenue"] else 0.0
        insights.append(
            {
                "id": "category-leader",
                "severity": "info",
                "title": f"{top_cat['category']} is the top category at {cat_share}% of revenue",
                "description": f"${top_cat['revenue']:,.0f} across {top_cat['orders']} orders.",
                "actionLabel": f"View {top_cat['category']} orders",
                "filter": {"category": top_cat["category"]},
            }
        )

    by_generation = summary["byGeneration"]
    if by_generation:
        top_gen = by_generation[0]
        gen_share = r2((top_gen["revenue"] / summary["totals"]["revenue"]) * 100) if summary["totals"]["revenue"] else 0.0
        insights.append(
            {
                "id": "generation-leader",
                "severity": "opportunity",
                "title": f"{top_gen['generation']} is the core customer base ({gen_share}% of revenue)",
                "description": f"${top_gen['revenue']:,.0f} across {top_gen['orders']} orders.",
                "actionLabel": f"View {top_gen['generation']} orders",
                "filter": {"generation": top_gen["generation"]},
            }
        )

    by_payment = summary["byPaymentMethod"]
    if by_payment:
        top_pay = by_payment[0]
        pay_share = r2((top_pay["revenue"] / summary["totals"]["revenue"]) * 100) if summary["totals"]["revenue"] else 0.0
        insights.append(
            {
                "id": "payment-preference",
                "severity": "info",
                "title": f"{top_pay['paymentMethod']} is the preferred payment method ({pay_share}% of revenue)",
                "description": f"{top_pay['orders']} of {summary['totals']['orders']} orders paid by {top_pay['paymentMethod']}.",
                "actionLabel": f"View {top_pay['paymentMethod']} orders",
                "filter": {"paymentMethod": top_pay["paymentMethod"]},
            }
        )

    yearly = summary["yearlyTrend"]
    full_years = [y for y in yearly if y["year"] != "2026"]  # 2026 is partial (Jan-Feb only), not comparable
    if len(full_years) >= 2:
        first, last = full_years[0], full_years[-1]
        change = r2(((last["revenue"] - first["revenue"]) / first["revenue"]) * 100) if first["revenue"] else 0.0
        direction = "increased" if change >= 0 else "decreased"
        insights.append(
            {
                "id": "yearly-trend",
                "severity": "info",
                "title": f"Revenue {direction} {abs(change)}% from {first['year']} to {last['year']}",
                "description": (
                    f"${first['revenue']:,.0f} in {first['year']} vs ${last['revenue']:,.0f} in {last['year']}. "
                    "2026 is excluded here since it's only two months in so far."
                ),
                "actionLabel": f"View {last['year']} orders",
                "filter": {"year": int(last["year"])},
            }
        )

    return insights


def query_records(conn: sqlite3.Connection, filters: dict, sort_by: str, sort_dir: str, page: int, page_size: int):
    where, params = build_where(filters)
    total = conn.execute(f"SELECT COUNT(*) AS c FROM intl_sales {where}", params).fetchone()["c"]

    sort_col = SORT_COLUMNS.get(sort_by, "transaction_date")
    direction = "ASC" if sort_dir == "asc" else "DESC"
    offset = page * page_size

    rows = conn.execute(
        f"""
        SELECT {ROW_COLUMNS} FROM intl_sales
        {where}
        ORDER BY {sort_col} {direction}
        LIMIT ? OFFSET ?
        """,
        [*params, page_size, offset],
    ).fetchall()

    return [dict(row) for row in rows], total


def query_all_matching(conn: sqlite3.Connection, filters: dict) -> list[dict]:
    where, params = build_where(filters)
    rows = conn.execute(f"SELECT {ROW_COLUMNS} FROM intl_sales {where}", params).fetchall()
    return [dict(row) for row in rows]
