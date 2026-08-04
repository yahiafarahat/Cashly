from collections import defaultdict
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app import models


def parse_transaction_date(value: str):
    try:
        return date.fromisoformat(str(value)[:10])
    except (TypeError, ValueError):
        return None


def shift_month(reference_date: date, offset: int):
    month_number = (
        reference_date.year * 12
        + reference_date.month
        - 1
        + offset
    )

    year, month_index = divmod(month_number, 12)

    return year, month_index + 1


def calculate_change(
    current_amount: float,
    previous_amount: float
):
    if previous_amount == 0:
        if current_amount > 0:
            return None

        return 0.0

    return round(
        (
            (current_amount - previous_amount)
            / previous_amount
        ) * 100,
        1
    )


def get_change_tone(change_percent):
    if change_percent is None:
        return "up"

    if change_percent > 1:
        return "up"

    if change_percent < -1:
        return "down"

    return "stable"


GRANULARITY_BUCKET_COUNTS = {
    "daily": 14,
    "weekly": 8,
    "monthly": 6
}


def build_period_buckets(today: date, granularity: str):
    bucket_count = GRANULARITY_BUCKET_COUNTS[granularity]
    buckets = []

    if granularity == "daily":
        for offset in range(bucket_count - 1, -1, -1):
            day = today - timedelta(days=offset)
            label = f"{day.strftime('%b')} {day.day}"
            buckets.append((day, day, label))

    elif granularity == "weekly":
        for offset in range(bucket_count - 1, -1, -1):
            end = today - timedelta(days=7 * offset)
            start = end - timedelta(days=6)
            label = f"{start.strftime('%b')} {start.day}"
            buckets.append((start, end, label))

    else:
        for offset in range(-(bucket_count - 1), 1):
            year, month = shift_month(today, offset)
            start = date(year, month, 1)

            if month == 12:
                end = date(year, 12, 31)
            else:
                end = date(year, month + 1, 1) - timedelta(days=1)

            label = start.strftime("%b")
            buckets.append((start, end, label))

    return buckets


def build_spending_by_period(
    valid_transactions,
    today: date,
    granularity: str
):
    buckets = build_period_buckets(today, granularity)
    running_total = 0.0
    spending_by_period = []

    for index, (start, end, label) in enumerate(buckets):
        amount = round(
            sum(
                float(transaction.price)
                for transaction, transaction_date in valid_transactions
                if start <= transaction_date <= end
            ),
            2
        )

        running_total += amount

        spending_by_period.append({
            "period": label,
            "amount": amount,
            "average": round(running_total / (index + 1), 2)
        })

    return spending_by_period


def build_category_frequency(
    valid_transactions,
    current_month_key
):
    category_counts = defaultdict(int)

    for transaction, transaction_date in valid_transactions:
        transaction_month_key = (
            transaction_date.year,
            transaction_date.month
        )

        if transaction_month_key == current_month_key:
            category = transaction.category.strip().title()
            category_counts[category] += 1

    total_count = sum(category_counts.values())
    category_frequency = []

    for category, count in category_counts.items():
        percent = (
            (count / total_count) * 100
            if total_count > 0 else 0
        )

        category_frequency.append({
            "name": category,
            "count": count,
            "percent": round(percent, 1)
        })

    category_frequency.sort(
        key=lambda category: category["count"],
        reverse=True
    )

    return category_frequency


def build_analytics_summary(
    db: Session,
    user_id: int,
    granularity: str = "monthly"
):
    if granularity not in GRANULARITY_BUCKET_COUNTS:
        raise ValueError(f"Unsupported granularity: {granularity}")

    today = date.today()

    transactions = (
        db.query(models.Transaction)
        .filter(
            models.Transaction.user_id == user_id
        )
        .all()
    )

    valid_transactions = []

    for transaction in transactions:
        transaction_date = parse_transaction_date(
            transaction.date
        )

        if transaction_date is not None:
            valid_transactions.append(
                (transaction, transaction_date)
            )

    current_month_key = (
        today.year,
        today.month
    )

    previous_year, previous_month = shift_month(
        today,
        -1
    )

    previous_month_key = (
        previous_year,
        previous_month
    )

    current_category_totals = defaultdict(float)
    previous_category_totals = defaultdict(float)

    for transaction, transaction_date in valid_transactions:
        transaction_month_key = (
            transaction_date.year,
            transaction_date.month
        )

        category = transaction.category.strip().title()
        amount = float(transaction.price)

        if transaction_month_key == current_month_key:
            current_category_totals[category] += amount

        if transaction_month_key == previous_month_key:
            previous_category_totals[category] += amount

    total_spent = round(
        sum(current_category_totals.values()),
        2
    )

    category_breakdown = []

    for category, amount in current_category_totals.items():
        previous_amount = previous_category_totals.get(
            category,
            0
        )

        change_percent = calculate_change(
            amount,
            previous_amount
        )

        if total_spent > 0:
            percent = (amount / total_spent) * 100
        else:
            percent = 0

        category_breakdown.append({
            "name": category,
            "amount": round(amount, 2),
            "percent": round(percent, 1),
            "change_percent": change_percent,
            "tone": get_change_tone(change_percent)
        })

    category_breakdown.sort(
        key=lambda category: category["amount"],
        reverse=True
    )

    monthly_totals = defaultdict(float)

    for transaction, transaction_date in valid_transactions:
        key = (
            transaction_date.year,
            transaction_date.month
        )

        monthly_totals[key] += float(
            transaction.price
        )

    monthly_trend = []

    for offset in range(-11, 1):
        year, month = shift_month(
            today,
            offset
        )

        month_label = datetime(
            year,
            month,
            1
        ).strftime("%b")

        monthly_trend.append({
            "month": month_label,
            "amount": round(
                monthly_totals.get(
                    (year, month),
                    0
                ),
                2
            )
        })

    months_with_spending = [
        month
        for month in monthly_trend
        if month["amount"] > 0
    ]

    if len(months_with_spending) >= 2:
        first_month_amount = (
            months_with_spending[0]["amount"]
        )

        latest_month_amount = (
            months_with_spending[-1]["amount"]
        )

        trend_change_percent = round(
            (
                (
                    latest_month_amount
                    - first_month_amount
                )
                / first_month_amount
            ) * 100,
            1
        )

        amount_difference = round(
            first_month_amount
            - latest_month_amount,
            2
        )
    else:
        trend_change_percent = 0.0
        amount_difference = 0.0

    biggest_opportunity = None

    if category_breakdown:
        biggest_category = category_breakdown[0]

        biggest_opportunity = {
            "category": biggest_category["name"],
            "share_percent": biggest_category["percent"],
            "potential_savings": round(
                biggest_category["amount"] * 0.10,
                2
            )
        }

    insights = build_spending_insights(
        valid_transactions,
        today,
        category_breakdown
    )

    category_frequency = build_category_frequency(
        valid_transactions,
        current_month_key
    )

    spending_by_period = build_spending_by_period(
        valid_transactions,
        today,
        granularity
    )

    return {
        "current_month": today.strftime(
            "%B %Y"
        ),
        "total_spent": total_spent,
        "category_breakdown": category_breakdown,
        "category_frequency": category_frequency,
        "monthly_trend": monthly_trend,
        "granularity": granularity,
        "spending_by_period": spending_by_period,
        "trend_change_percent": trend_change_percent,
        "amount_difference": amount_difference,
        "biggest_opportunity": biggest_opportunity,
        "insights": insights
    }


def build_spending_insights(
    valid_transactions,
    today: date,
    category_breakdown
):
    insights = []

    ninety_days_ago = today - timedelta(
        days=89
    )

    recent_transactions = [
        (transaction, transaction_date)
        for transaction, transaction_date
        in valid_transactions
        if (
            ninety_days_ago
            <= transaction_date
            <= today
        )
    ]

    weekday_totals = defaultdict(float)

    for transaction, transaction_date in recent_transactions:
        weekday = transaction_date.strftime(
            "%A"
        )

        weekday_totals[weekday] += float(
            transaction.price
        )

    if weekday_totals:
        highest_day = max(
            weekday_totals,
            key=weekday_totals.get
        )

        insights.append({
            "tag": "Weekly pattern",
            "title": (
                f"{highest_day}s cost you the most"
            ),
            "text": (
                f"You spent EGP "
                f"{weekday_totals[highest_day]:,.0f} "
                f"on {highest_day}s during the "
                f"last 90 days."
            ),
            "positive": False
        })

    decreasing_categories = [
        category
        for category in category_breakdown
        if (
            category["change_percent"] is not None
            and category["change_percent"] < 0
        )
    ]

    if decreasing_categories:
        best_progress = min(
            decreasing_categories,
            key=lambda category: (
                category["change_percent"]
            )
        )

        insights.append({
            "tag": "Good progress",
            "title": (
                f"{best_progress['name']} is moving "
                f"in the right direction"
            ),
            "text": (
                f"You spent "
                f"{abs(best_progress['change_percent']):.0f}% "
                f"less than last month."
            ),
            "positive": True
        })

    if category_breakdown:
        highest_category = category_breakdown[0]

        insights.append({
            "tag": "Worth watching",
            "title": (
                f"{highest_category['name']} is your "
                f"largest expense"
            ),
            "text": (
                f"It represents "
                f"{highest_category['percent']:.0f}% "
                f"of this month’s spending."
            ),
            "positive": False
        })

    return insights[:4]