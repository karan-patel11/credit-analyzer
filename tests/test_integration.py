from __future__ import annotations

import asyncio

import httpx
import pytest
from sqlalchemy import select

from backend.models.database_models import SearchLog


def test_health_endpoint_reports_service_metadata(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["service"] == "kaps-credit-analyzer"


def test_readiness_endpoint_checks_database_and_redis(client):
    response = client.get("/health/ready")

    assert response.status_code == 200
    assert response.json()["status"] == "ready"


def test_merchant_profile_returns_aggregated_application_stats(client):
    search_response = client.get("/merchants/search", params={"q": "Atlas"})
    merchant_id = search_response.json()["results"][0]["id"]

    profile_response = client.get(f"/merchants/{merchant_id}")
    payload = profile_response.json()

    assert profile_response.status_code == 200
    assert payload["application_stats"]["lifetime_total_applications"] >= 1


def test_search_analytics_reflect_logged_searches(client):
    client.get("/merchants/search", params={"q": "atlas"})
    client.get("/merchants/search", params={"q": "north"})

    analytics = client.get("/analytics/search")
    payload = analytics.json()

    assert analytics.status_code == 200
    assert payload["total_searches"] >= 2
    assert payload["top_queries"]


@pytest.mark.asyncio
async def test_concurrent_search_requests(client, db_session):
    transport = httpx.ASGITransport(app=client.app)

    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as async_client:
        responses = await asyncio.gather(
            async_client.get("/merchants/search", params={"q": "atlas"}),
            async_client.get("/merchants/search", params={"q": "north"}),
            async_client.get("/merchants/search", params={"q": "retail"}),
        )

    assert all(response.status_code == 200 for response in responses)
    search_logs = db_session.execute(select(SearchLog)).scalars().all()
    assert len(search_logs) >= 3
