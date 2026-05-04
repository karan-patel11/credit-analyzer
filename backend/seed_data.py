from __future__ import annotations

import random
from itertools import product

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.config import get_settings
from backend.database import build_engine, build_session_factory, initialize_database
from backend.models.database_models import Merchant

INDUSTRIES = [
    "Retail",
    "Restaurant",
    "Construction",
    "Healthcare",
    "Tech",
    "Manufacturing",
    "Logistics",
    "Real Estate",
    "Education",
    "Agriculture",
    "Hospitality",
    "Professional Services",
]

CITY_STATE_PAIRS = [
    ("New York", "NY"), ("Los Angeles", "CA"), ("Chicago", "IL"), ("Houston", "TX"),
    ("Phoenix", "AZ"), ("Philadelphia", "PA"), ("San Antonio", "TX"), ("San Diego", "CA"),
    ("Dallas", "TX"), ("San Jose", "CA"), ("Austin", "TX"), ("Jacksonville", "FL"),
    ("Fort Worth", "TX"), ("Columbus", "OH"), ("Charlotte", "NC"), ("San Francisco", "CA"),
    ("Indianapolis", "IN"), ("Seattle", "WA"), ("Denver", "CO"), ("Washington", "DC"),
    ("Boston", "MA"), ("El Paso", "TX"), ("Nashville", "TN"), ("Detroit", "MI"),
    ("Oklahoma City", "OK"), ("Portland", "OR"), ("Las Vegas", "NV"), ("Memphis", "TN"),
    ("Louisville", "KY"), ("Baltimore", "MD"), ("Milwaukee", "WI"), ("Albuquerque", "NM"),
    ("Tucson", "AZ"), ("Fresno", "CA"), ("Sacramento", "CA"), ("Kansas City", "MO"),
    ("Mesa", "AZ"), ("Atlanta", "GA"), ("Omaha", "NE"), ("Colorado Springs", "CO"),
    ("Raleigh", "NC"), ("Miami", "FL"), ("Long Beach", "CA"), ("Virginia Beach", "VA"),
    ("Oakland", "CA"), ("Minneapolis", "MN"), ("Tulsa", "OK"), ("Arlington", "TX"),
    ("Tampa", "FL"), ("New Orleans", "LA"),
]

INDUSTRY_LABELS = {
    "Retail": "Market",
    "Restaurant": "Kitchen",
    "Construction": "Builders",
    "Healthcare": "Clinic",
    "Tech": "Systems",
    "Manufacturing": "Works",
    "Logistics": "Transit",
    "Real Estate": "Property Group",
    "Education": "Learning Hub",
    "Agriculture": "Growers",
    "Hospitality": "Suites",
    "Professional Services": "Advisors",
}

REVENUE_BUCKETS: list[tuple[str, int]] = [
    ("$250K-$500K", 250000),
    ("$500K-$1M", 500000),
    ("$1M-$3M", 1000000),
    ("$3M-$5M", 3000000),
    ("$5M-$10M", 5000000),
]


def generate_seed_merchants(count: int = 600) -> list[Merchant]:
    """Generate deterministic synthetic merchant records for search and discovery."""

    rng = random.Random(42)
    records: list[Merchant] = []

    for index, (industry, (city, state)) in enumerate(product(INDUSTRIES, CITY_STATE_PAIRS), start=1):
        if index > count:
            break

        revenue_range, revenue_sort_value = REVENUE_BUCKETS[(index - 1) % len(REVENUE_BUCKETS)]
        applications = 35 + (index % 180)
        approval_rate = round(52 + (index % 36) + rng.uniform(-3.5, 3.5), 2)
        avg_risk_score = round(35 + (index % 48) + rng.uniform(-4.0, 4.0), 2)

        if avg_risk_score <= 45:
            risk_tier = "LOW"
        elif avg_risk_score <= 70:
            risk_tier = "MEDIUM"
        else:
            risk_tier = "HIGH"

        merchant_name = f"{city} {INDUSTRY_LABELS[industry]}"
        zip_code = f"{10000 + index:05d}"
        records.append(
            Merchant(
                name=merchant_name,
                industry=industry,
                city=city,
                state=state,
                zip_code=zip_code,
                revenue_range=revenue_range,
                revenue_sort_value=revenue_sort_value,
                risk_tier=risk_tier,
                avg_risk_score=max(min(avg_risk_score, 98.0), 15.0),
                total_applications=applications,
                approval_rate=max(min(approval_rate, 97.0), 25.0),
            ),
        )

    return records


def seed_merchants_if_empty(db: Session, count: int) -> int:
    """Seed merchants when the directory table is currently empty."""

    existing_count = db.execute(select(Merchant.id).limit(1)).first()
    if existing_count is not None:
        return 0

    merchants = generate_seed_merchants(count)
    db.add_all(merchants)
    db.commit()
    return len(merchants)


def main() -> None:
    """Initialize the schema and seed the merchant directory."""

    settings = get_settings()
    engine = build_engine(settings.database_url)
    initialize_database(engine)
    session_factory = build_session_factory(engine)
    with session_factory() as db:
        seed_merchants_if_empty(db, settings.seed_merchant_count)


if __name__ == "__main__":
    main()
