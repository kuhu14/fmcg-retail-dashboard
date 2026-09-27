"""Builds the dashboard summary (KPIs, breakdowns, insights) straight from
SQL aggregate queries against the `sales` table. Mirrors the logic that used
to live in fmcg-dashboard/scripts/prepare-data.mjs, now computed on demand
from the live database instead of a build-time JSON snapshot.
"""
import sqlite3


def r2(x: float) -> float:
    return round(x, 2) if x is not None else 0.0


def fmt_in(n: int) -> str:
    """Indian digit grouping, e.g. 100000 -> '1,00,000' (matches the dataset's home locale)."""
    s = str(int(n))
    if len(s) <= 3:
        return s
    last3, rest = s[-3:], s[:-3]
    parts = []
    while len(rest) > 2:
        parts.insert(0, rest[-2:])
        rest = rest[:-2]
    if rest:
        parts.insert(0, rest)
    return ",".join(parts) + "," + last3


def dim_breakdown(conn: sqlite3.Connection, column: str, key_name: str) -> list[dict]:
    rows = conn.execute(
        f"""
        SELECT {column} AS name,
               SUM(revenue) AS revenue,
               SUM(cost) AS cost,
               SUM(margin) AS margin,
               SUM(units) AS units,
               COUNT(*) AS orders
        FROM sales
        GROUP BY {column}
        ORDER BY revenue DESC
        """
    ).fetchall()
    out = []
    for row in rows:
        margin_pct = r2((row["margin"] / row["revenue"]) * 100) if row["revenue"] else 0.0
        out.append(
            {
                key_name: row["name"],
                "revenue": r2(row["revenue"]),
                "cost": r2(row["cost"]),
                "margin": r2(row["margin"]),
                "marginPct": margin_pct,
                "units": row["units"],
                "orders": row["orders"],
            }
        )
    return out


def build_summary(conn: sqlite3.Connection) -> dict:
    totals_row = conn.execute(
        """
        SELECT SUM(revenue) AS revenue, SUM(cost) AS cost, SUM(margin) AS margin,
               SUM(units) AS units, COUNT(*) AS orders,
               SUM(CASE WHEN loyalty_flag = 1 THEN 1 ELSE 0 END) AS loyalty_count,
               SUM(CASE WHEN customer_age IS NULL THEN 1 ELSE 0 END) AS age_missing
        FROM sales
        """
    ).fetchone()

    orders = totals_row["orders"]
    revenue = totals_row["revenue"]
    margin = totals_row["margin"]

    totals = {
        "revenue": r2(revenue),
        "cost": r2(totals_row["cost"]),
        "margin": r2(margin),
        "marginPct": r2((margin / revenue) * 100),
        "units": totals_row["units"],
        "orders": orders,
        "avgOrderValue": r2(revenue / orders),
        "loyaltyCount": totals_row["loyalty_count"],
        "loyaltyPct": r2((totals_row["loyalty_count"] / orders) * 100),
        "ageMissing": totals_row["age_missing"],
        "ageMissingPct": r2((totals_row["age_missing"] / orders) * 100),
    }

    by_city = dim_breakdown(conn, "city", "city")
    by_category = dim_breakdown(conn, "category", "category")
    by_channel = dim_breakdown(conn, "channel", "channel")
    by_payment_mode = dim_breakdown(conn, "payment_mode", "paymentMode")
    by_store_format = dim_breakdown(conn, "store_format", "storeFormat")
    by_brand = dim_breakdown(conn, "brand", "brand")
    by_gender = dim_breakdown(conn, "COALESCE(customer_gender, 'N/A')", "gender")

    monthly_rows = conn.execute(
        """
        SELECT substr(invoice_date, 1, 7) AS month,
               SUM(revenue) AS revenue, SUM(margin) AS margin,
               SUM(units) AS units, COUNT(*) AS orders
        FROM sales
        GROUP BY month
        ORDER BY month
        """
    ).fetchall()
    monthly_trend = [
        {
            "month": row["month"],
            "revenue": r2(row["revenue"]),
            "margin": r2(row["margin"]),
            "marginPct": r2((row["margin"] / row["revenue"]) * 100) if row["revenue"] else 0.0,
            "units": row["units"],
            "orders": row["orders"],
        }
        for row in monthly_rows
    ]

    age_bucket_defs = [("18-25", 18, 25), ("26-35", 26, 35), ("36-45", 36, 45), ("46-55", 46, 55), ("56-65", 56, 65)]
    age_buckets = {}
    for label, lo, hi in age_bucket_defs:
        c = conn.execute(
            "SELECT COUNT(*) AS c FROM sales WHERE customer_age BETWEEN ? AND ?", (lo, hi)
        ).fetchone()["c"]
        age_buckets[label] = c

    loyalty_rows = conn.execute(
        """
        SELECT loyalty_flag AS loyalty, SUM(revenue) AS revenue, SUM(margin) AS margin,
               SUM(units) AS units, COUNT(*) AS orders
        FROM sales GROUP BY loyalty_flag
        """
    ).fetchall()
    by_loyalty = [
        {
            "loyalty": row["loyalty"],
            "revenue": r2(row["revenue"]),
            "orders": row["orders"],
            "units": row["units"],
            "avgOrderValue": r2(row["revenue"] / row["orders"]),
            "marginPct": r2((row["margin"] / row["revenue"]) * 100) if row["revenue"] else 0.0,
        }
        for row in loyalty_rows
    ]

    inv_row = conn.execute(
        """
        SELECT
          SUM(CASE WHEN stock_on_hand <= reorder_level THEN 1 ELSE 0 END) AS stockout_risk,
          SUM(CASE WHEN stock_on_hand < 0.5 * reorder_level THEN 1 ELSE 0 END) AS critical_stock,
          SUM(CASE WHEN stock_on_hand > 3 * reorder_level THEN 1 ELSE 0 END) AS overstock,
          AVG(lead_time_days) AS avg_lead_time,
          AVG(stock_on_hand) AS avg_soh,
          AVG(reorder_level) AS avg_rop
        FROM sales
        """
    ).fetchone()

    lead_time_by_category = [
        {"category": row["category"], "avgLeadTimeDays": r2(row["avg_lt"])}
        for row in conn.execute(
            "SELECT category, AVG(lead_time_days) AS avg_lt FROM sales GROUP BY category ORDER BY avg_lt DESC"
        ).fetchall()
    ]

    risk_by_category = [
        {"category": row["category"], "atRiskOrders": row["c"]}
        for row in conn.execute(
            """
            SELECT category, COUNT(*) AS c FROM sales
            WHERE stock_on_hand <= reorder_level
            GROUP BY category ORDER BY c DESC
            """
        ).fetchall()
    ]
    risk_by_city = [
        {"city": row["city"], "atRiskOrders": row["c"]}
        for row in conn.execute(
            """
            SELECT city, COUNT(*) AS c FROM sales
            WHERE stock_on_hand <= reorder_level
            GROUP BY city ORDER BY c DESC
            """
        ).fetchall()
    ]

    inventory = {
        "stockoutRisk": inv_row["stockout_risk"],
        "stockoutRiskPct": r2((inv_row["stockout_risk"] / orders) * 100),
        "criticalStock": inv_row["critical_stock"],
        "overstock": inv_row["overstock"],
        "overstockPct": r2((inv_row["overstock"] / orders) * 100),
        "avgLeadTimeDays": r2(inv_row["avg_lead_time"]),
        "avgStockOnHand": r2(inv_row["avg_soh"]),
        "avgReorderLevel": r2(inv_row["avg_rop"]),
        "leadTimeByCategory": lead_time_by_category,
        "byCategory": risk_by_category,
        "byCity": risk_by_city,
    }

    record_count = orders
    meta = {
        "recordCount": record_count,
        "generatedAt": None,
        "columns": [
            "Invoice_ID", "Invoice_Date", "City", "Store_Format", "Category", "Brand",
            "Channel", "Payment_Mode", "Units", "Cost_Price", "Selling_Price", "Revenue",
            "Cost", "Margin", "Margin_Pct", "Stock_On_Hand", "Reorder_Level",
            "Lead_Time_Days", "Customer_Age", "Customer_Gender", "Loyalty_Flag",
        ],
    }

    summary = {
        "meta": meta,
        "totals": totals,
        "byCity": by_city,
        "byCategory": by_category,
        "byChannel": by_channel,
        "byPaymentMode": by_payment_mode,
        "byStoreFormat": by_store_format,
        "byBrand": by_brand,
        "byGender": by_gender,
        "monthlyTrend": monthly_trend,
        "ageBuckets": age_buckets,
        "byLoyalty": by_loyalty,
        "inventory": inventory,
    }
    summary["insights"] = build_insights(summary)
    return summary


def build_insights(summary: dict) -> list[dict]:
    insights = []

    cat_margins = [c["marginPct"] for c in summary["byCategory"]]
    cat_spread = r2(max(cat_margins) - min(cat_margins))
    top_cat = max(summary["byCategory"], key=lambda c: c["marginPct"])
    bottom_cat = min(summary["byCategory"], key=lambda c: c["marginPct"])
    insights.append(
        {
            "id": "margin-consistency",
            "severity": "info",
            "title": f"Margins are consistent across categories (±{cat_spread}pp)",
            "description": (
                f"{bottom_cat['category']} ({bottom_cat['marginPct']}%) and {top_cat['category']} "
                f"({top_cat['marginPct']}%) bound the range — no category is a structural margin "
                "drag. Monitor cost inputs to keep it that way rather than repricing individual categories."
            ),
            "actionLabel": "Compare category margins",
            "filter": {"category": bottom_cat["category"]},
        }
    )

    inv = summary["inventory"]
    worst_stock_cat = inv["byCategory"][0]
    insights.append(
        {
            "id": "stockout-risk",
            "severity": "critical",
            "title": f"{fmt_in(inv['stockoutRisk'])} orders ({inv['stockoutRiskPct']}%) sit at or below reorder level",
            "description": (
                f"{worst_stock_cat['category']} is the most exposed category with "
                f"{worst_stock_cat['atRiskOrders']} at-risk line items. Average lead time is "
                f"{inv['avgLeadTimeDays']} days, so delayed reorders risk stockouts."
            ),
            "actionLabel": "View at-risk inventory",
            "filter": {"stockRisk": True},
        }
    )

    insights.append(
        {
            "id": "overstock",
            "severity": "info",
            "title": f"{inv['overstockPct']}% of line items are overstocked (>3x reorder level)",
            "description": (
                f"{fmt_in(inv['overstock'])} orders show stock on hand more than triple the reorder level, "
                "tying up working capital in slow-moving inventory."
            ),
            "actionLabel": "View overstocked items",
            "filter": {"overstock": True},
        }
    )

    loyal = next((l for l in summary["byLoyalty"] if l["loyalty"] == 1), None)
    non_loyal = next((l for l in summary["byLoyalty"] if l["loyalty"] == 0), None)
    if loyal and non_loyal:
        insights.append(
            {
                "id": "loyalty-penetration",
                "severity": "opportunity",
                "title": f"{r2(100 - summary['totals']['loyaltyPct'])}% of orders come from non-loyalty customers",
                "description": (
                    f"Only {summary['totals']['loyaltyPct']}% of orders ({fmt_in(loyal['orders'])}) are tagged "
                    f"loyalty, spending about the same per order (₹{loyal['avgOrderValue']} vs "
                    f"₹{non_loyal['avgOrderValue']}) as non-members. Enrolling regular non-loyalty "
                    "shoppers is a low-risk revenue lever."
                ),
                "actionLabel": "View non-loyalty orders",
                "filter": {"loyalty": 0},
            }
        )

    best_month = max(summary["monthlyTrend"], key=lambda m: m["revenue"])
    worst_month = min(summary["monthlyTrend"], key=lambda m: m["revenue"])
    swing = r2(((best_month["revenue"] - worst_month["revenue"]) / worst_month["revenue"]) * 100)
    insights.append(
        {
            "id": "seasonality",
            "severity": "info",
            "title": f"{worst_month['month']} was the weakest month, {best_month['month']} the strongest",
            "description": (
                f"Revenue ranged from ₹{worst_month['revenue'] / 1e6:.2f}M ({worst_month['month']}) to "
                f"₹{best_month['revenue'] / 1e6:.2f}M ({best_month['month']}), a swing of {swing}%."
            ),
            "actionLabel": "View monthly trend",
            "filter": {"month": worst_month["month"]},
        }
    )

    top_city = max(summary["byCity"], key=lambda c: c["revenue"])
    bottom_city = min(summary["byCity"], key=lambda c: c["revenue"])
    city_spread = r2(((top_city["revenue"] - bottom_city["revenue"]) / bottom_city["revenue"]) * 100)
    insights.append(
        {
            "id": "city-balance",
            "severity": "info",
            "title": f"Revenue is well balanced across cities (±{city_spread}%)",
            "description": (
                f"{top_city['city']} leads at ₹{top_city['revenue'] / 1e6:.2f}M and {bottom_city['city']} "
                f"trails at ₹{bottom_city['revenue'] / 1e6:.2f}M — no single market carries the "
                "business, and none is critically underperforming."
            ),
            "actionLabel": f"View {bottom_city['city']} orders",
            "filter": {"city": bottom_city["city"]},
        }
    )

    insights.append(
        {
            "id": "data-quality-age",
            "severity": "info",
            "title": f"Customer age is missing for {summary['totals']['ageMissingPct']}% of orders",
            "description": (
                f"{fmt_in(summary['totals']['ageMissing'])} of {fmt_in(summary['totals']['orders'])} orders have no "
                "captured age, limiting demographic segmentation accuracy."
            ),
            "actionLabel": "View records missing age",
            "filter": {"ageMissing": True},
        }
    )

    return insights
