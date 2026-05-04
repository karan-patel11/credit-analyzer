from __future__ import annotations

import asyncio
import json
import logging
import statistics
import sys
import tempfile
import time
from collections import defaultdict
from pathlib import Path

import httpx
from fastapi.routing import APIRoute
from sqlalchemy import func, select

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import Settings
from backend.database import build_engine, build_session_factory, initialize_database
from backend.main import create_app
from backend.models.database_models import Merchant
from backend.seed_data import CITY_STATE_PAIRS, INDUSTRIES, generate_seed_merchants


class FakeRedis:
    """Simple Redis-like store used for benchmarks."""

    def __init__(self) -> None:
        self.store: dict[str, str] = {}
        self.expiry: dict[str, int] = {}
        self.counts: defaultdict[str, int] = defaultdict(int)

    def clear(self) -> None:
        self.store.clear()
        self.expiry.clear()

    def get(self, key: str) -> str | None:
        self.counts["get"] += 1
        return self.store.get(key)

    def setex(self, key: str, ttl: int, value: str) -> None:
        self.counts["setex"] += 1
        self.store[key] = value
        self.expiry[key] = ttl

    def incr(self, key: str) -> int:
        self.counts["incr"] += 1
        value = int(self.store.get(key, "0")) + 1
        self.store[key] = str(value)
        return value

    def expire(self, key: str, ttl: int) -> None:
        self.counts["expire"] += 1
        self.expiry[key] = ttl

    def ping(self) -> bool:
        return True

    def close(self) -> None:
        return None


def build_settings(database_path: Path) -> Settings:
    """Create the settings object used for benchmark runs."""

    return Settings.model_validate(
        {
            "APP_NAME": "KAPS AI Credit Intelligence API",
            "APP_DESCRIPTION": "KAPS AI benchmark configuration",
            "ENVIRONMENT": "benchmark",
            "API_VERSION": "1.0.0",
            "CORS_ORIGINS": ["http://testserver"],
            "DATABASE_URL": f"sqlite:///{database_path}",
            "REDIS_URL": "redis://benchmark",
            "AUTO_SEED_MERCHANTS": False,
            "SEED_MERCHANT_COUNT": 600,
            "WEBHOOK_SECRET": "kaps-benchmark-secret",
            "RATE_LIMIT_PER_MINUTE": 1000,
        },
    )


def percentile(values: list[float], fraction: float) -> float:
    """Return a percentile from a sorted list of values."""

    if not values:
        return 0.0

    index = min(len(values) - 1, int(len(values) * fraction))
    return values[index]


async def benchmark_search(client: httpx.AsyncClient, n: int = 100) -> dict[str, float]:
    """Benchmark the search endpoint across 100 queries."""

    queries = [
        "retail",
        "tech",
        "restaurant",
        "health",
        "construction",
        "New York",
        "Chicago",
        "Miami",
        "Seattle",
        "Austin",
    ]
    latencies: list[float] = []

    for index in range(n):
        query = queries[index % len(queries)]
        started_at = time.perf_counter()
        response = await client.get("/merchants/search", params={"q": query})
        response.raise_for_status()
        latencies.append((time.perf_counter() - started_at) * 1000)

    latencies.sort()
    return {
        "p50": percentile(latencies, 0.50),
        "p95": percentile(latencies, 0.95),
        "p99": percentile(latencies, 0.99),
    }


async def benchmark_autocomplete(client: httpx.AsyncClient, n: int = 100) -> dict[str, float]:
    """Benchmark the autocomplete endpoint across 100 requests."""

    queries = ["Ne", "Ch", "Mi", "Se", "Au", "Da", "Po", "Sa", "At", "Ho"]
    latencies: list[float] = []

    for index in range(n):
        query = queries[index % len(queries)]
        started_at = time.perf_counter()
        response = await client.get("/merchants/autocomplete", params={"q": query})
        response.raise_for_status()
        latencies.append((time.perf_counter() - started_at) * 1000)

    latencies.sort()
    return {
        "p50": percentile(latencies, 0.50),
        "p95": percentile(latencies, 0.95),
        "p99": percentile(latencies, 0.99),
    }


async def benchmark_cache_hit(client: httpx.AsyncClient) -> float:
    """Measure average latency for warmed search requests."""

    await client.get("/merchants/search", params={"q": "retail"})
    latencies: list[float] = []

    for _ in range(50):
        started_at = time.perf_counter()
        response = await client.get("/merchants/search", params={"q": "retail"})
        response.raise_for_status()
        latencies.append((time.perf_counter() - started_at) * 1000)

    return statistics.mean(latencies)


async def benchmark_cold_search(client: httpx.AsyncClient, redis_client: FakeRedis) -> float:
    """Measure average latency when the search cache is cold for each request."""

    latencies: list[float] = []

    for _ in range(50):
        redis_client.clear()
        started_at = time.perf_counter()
        response = await client.get("/merchants/search", params={"q": "retail"})
        response.raise_for_status()
        latencies.append((time.perf_counter() - started_at) * 1000)

    return statistics.mean(latencies)


def count_routes(app) -> int:
    """Count FastAPI API routes exposed by the application."""

    return sum(
        1
        for route in app.routes
        if isinstance(route, APIRoute) and not route.path.startswith(("/docs", "/openapi", "/redoc"))
    )


async def main() -> None:
    """Build a benchmark app, execute measurements, and print JSON metrics."""

    logging.getLogger("httpx").setLevel(logging.WARNING)

    with tempfile.TemporaryDirectory() as temporary_directory:
        database_path = Path(temporary_directory) / "kaps-benchmark.sqlite"
        settings = build_settings(database_path)
        engine = build_engine(settings.database_url)
        initialize_database(engine)
        session_factory = build_session_factory(engine)

        with session_factory() as session:
            session.add_all(generate_seed_merchants(settings.seed_merchant_count))
            session.commit()

        redis_client = FakeRedis()
        app = create_app(settings=settings, session_factory=session_factory, redis_client=redis_client)
        app.state.settings = settings
        app.state.session_factory = session_factory
        app.state.redis = redis_client
        app.state.started_at = time.perf_counter()

        with session_factory() as session:
            merchant_count = session.execute(select(func.count(Merchant.id))).scalar_one()
            industry_count = session.execute(select(func.count(func.distinct(Merchant.industry)))).scalar_one()
            city_count = session.execute(select(func.count(func.distinct(Merchant.city)))).scalar_one()

        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
            search_metrics = await benchmark_search(client)
            autocomplete_metrics = await benchmark_autocomplete(client)
            cache_hit_latency = await benchmark_cache_hit(client)
            cold_latency = await benchmark_cold_search(client, redis_client)

        engine.dispose()

        metrics = {
            "test_dataset": {
                "merchant_records_seeded": int(merchant_count),
                "industries_covered": int(industry_count),
                "cities_covered": int(city_count),
                "industry_source_count": len(INDUSTRIES),
                "city_source_count": len(CITY_STATE_PAIRS),
            },
            "api_routes": count_routes(app),
            "search_benchmark_ms": search_metrics,
            "autocomplete_benchmark_ms": autocomplete_metrics,
            "cache_hit_latency_ms": cache_hit_latency,
            "cold_search_latency_ms": cold_latency,
        }

        print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
