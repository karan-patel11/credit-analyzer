from __future__ import annotations

from collections import defaultdict
from pathlib import Path
import sys

import pytest
from fastapi.testclient import TestClient

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import Settings
from backend.database import build_engine, build_session_factory, initialize_database
from backend.main import create_app
from backend.models.database_models import LoanApplicationRecord, Merchant
from backend.seed_data import generate_seed_merchants


class FakeRedis:
    """Simple in-memory Redis replacement used in tests."""

    def __init__(self) -> None:
        self.store: dict[str, str] = {}
        self.expiry: dict[str, int] = {}
        self.operation_counts: defaultdict[str, int] = defaultdict(int)

    def get(self, key: str) -> str | None:
        self.operation_counts["get"] += 1
        return self.store.get(key)

    def setex(self, key: str, ttl: int, value: str) -> None:
        self.operation_counts["setex"] += 1
        self.store[key] = value
        self.expiry[key] = ttl

    def incr(self, key: str) -> int:
        self.operation_counts["incr"] += 1
        current_value = int(self.store.get(key, "0")) + 1
        self.store[key] = str(current_value)
        return current_value

    def expire(self, key: str, ttl: int) -> None:
        self.operation_counts["expire"] += 1
        self.expiry[key] = ttl

    def ping(self) -> bool:
        self.operation_counts["ping"] += 1
        return True

    def close(self) -> None:
        self.operation_counts["close"] += 1


def _insert_special_merchants(session) -> None:
    session.add_all(
        [
            Merchant(
                name="Atlas",
                industry="Retail",
                city="Austin",
                state="TX",
                zip_code="73301",
                revenue_range="$3M-$5M",
                revenue_sort_value=3000000,
                risk_tier="LOW",
                avg_risk_score=32.0,
                total_applications=160,
                approval_rate=88.0,
            ),
            Merchant(
                name="Atlas Coffee",
                industry="Restaurant",
                city="Austin",
                state="TX",
                zip_code="73344",
                revenue_range="$1M-$3M",
                revenue_sort_value=1000000,
                risk_tier="MEDIUM",
                avg_risk_score=55.0,
                total_applications=120,
                approval_rate=76.0,
            ),
            Merchant(
                name="Harbor Trade",
                industry="Atlas Services",
                city="Seattle",
                state="WA",
                zip_code="98101",
                revenue_range="$500K-$1M",
                revenue_sort_value=500000,
                risk_tier="HIGH",
                avg_risk_score=78.0,
                total_applications=75,
                approval_rate=61.0,
            ),
            Merchant(
                name="Northwind Logistics",
                industry="Logistics",
                city="Dallas",
                state="TX",
                zip_code="75201",
                revenue_range="$5M-$10M",
                revenue_sort_value=5000000,
                risk_tier="LOW",
                avg_risk_score=28.0,
                total_applications=210,
                approval_rate=92.0,
            ),
            Merchant(
                name="Northwind Labs",
                industry="Tech",
                city="Boston",
                state="MA",
                zip_code="02108",
                revenue_range="$250K-$500K",
                revenue_sort_value=250000,
                risk_tier="HIGH",
                avg_risk_score=82.0,
                total_applications=44,
                approval_rate=48.0,
            ),
        ],
    )
    session.add(
        LoanApplicationRecord(
            id="app-atlas-1",
            business_name="Atlas",
            industry="Retail",
            revenue=1200000,
            loan_amount=240000,
            loan_purpose="Inventory",
            status="complete",
            stage=4,
            risk_score=62,
            decision="APPROVE",
            result_payload=None,
        ),
    )
    session.commit()


@pytest.fixture()
def settings(tmp_path: Path) -> Settings:
    database_path = tmp_path / "kaps-test.sqlite"
    return Settings.model_validate(
        {
            "APP_NAME": "KAPS AI Credit Intelligence API",
            "APP_DESCRIPTION": "KAPS AI test configuration",
            "ENVIRONMENT": "test",
            "API_VERSION": "1.0.0",
            "CORS_ORIGINS": ["http://testserver"],
            "DATABASE_URL": f"sqlite:///{database_path}",
            "REDIS_URL": "redis://test",
            "AUTO_SEED_MERCHANTS": False,
            "SEED_MERCHANT_COUNT": 600,
            "WEBHOOK_SECRET": "kaps-test-secret",
            "RATE_LIMIT_PER_MINUTE": 100,
        },
    )


@pytest.fixture()
def fake_redis() -> FakeRedis:
    return FakeRedis()


@pytest.fixture()
def session_factory(settings: Settings):
    engine = build_engine(settings.database_url)
    initialize_database(engine)
    session_local = build_session_factory(engine)
    try:
        with session_local() as session:
            _insert_special_merchants(session)
            session.add_all(generate_seed_merchants(600))
            session.commit()
        yield session_local
    finally:
        engine.dispose()


@pytest.fixture()
def client(settings: Settings, session_factory, fake_redis: FakeRedis):
    app = create_app(settings=settings, session_factory=session_factory, redis_client=fake_redis)
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture()
def db_session(session_factory):
    with session_factory() as session:
        yield session
