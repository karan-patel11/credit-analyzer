from __future__ import annotations

from sqlalchemy import select

from backend.models.database_models import SearchLog


def test_search_orders_exact_before_partial_and_industry_match(client):
    response = client.get("/merchants/search", params={"q": "atlas"})
    payload = response.json()

    assert response.status_code == 200
    names = [item["name"] for item in payload["results"][:3]]
    assert names[:3] == ["Atlas", "Atlas Coffee", "Harbor Trade"]


def test_search_filters_by_industry(client):
    response = client.get("/merchants/search", params={"industry": "Logistics"})

    assert response.status_code == 200
    assert response.json()["results"]
    assert all(item["industry"] == "Logistics" for item in response.json()["results"])


def test_search_filters_by_city(client):
    response = client.get("/merchants/search", params={"city": "Austin"})

    assert response.status_code == 200
    assert response.json()["results"]
    assert all(item["city"] == "Austin" for item in response.json()["results"])


def test_search_filters_by_state(client):
    response = client.get("/merchants/search", params={"state": "TX"})

    assert response.status_code == 200
    assert response.json()["results"]
    assert all(item["state"] == "TX" for item in response.json()["results"])


def test_search_filters_by_risk_tier(client):
    response = client.get("/merchants/search", params={"risk_tier": "HIGH"})

    assert response.status_code == 200
    assert response.json()["results"]
    assert all(item["risk_tier"] == "HIGH" for item in response.json()["results"])


def test_search_filters_by_min_score(client):
    response = client.get("/merchants/search", params={"min_score": 80})

    assert response.status_code == 200
    assert response.json()["results"]
    assert all(item["avg_risk_score"] >= 80 for item in response.json()["results"])


def test_search_filters_by_max_score(client):
    response = client.get("/merchants/search", params={"max_score": 35})

    assert response.status_code == 200
    assert response.json()["results"]
    assert all(item["avg_risk_score"] <= 35 for item in response.json()["results"])


def test_search_sorts_by_approval_rate_desc(client):
    response = client.get(
        "/merchants/search",
        params={"sort_by": "approval_rate", "order": "desc"},
    )

    scores = [item["approval_rate"] for item in response.json()["results"][:5]]
    assert scores == sorted(scores, reverse=True)


def test_search_sorts_by_risk_score_asc(client):
    response = client.get(
        "/merchants/search",
        params={"sort_by": "risk_score", "order": "asc"},
    )

    scores = [item["avg_risk_score"] for item in response.json()["results"][:5]]
    assert scores == sorted(scores)


def test_search_sorts_by_revenue_desc(client):
    response = client.get(
        "/merchants/search",
        params={"sort_by": "revenue", "order": "desc"},
    )

    revenues = [item["revenue_range"] for item in response.json()["results"][:3]]
    assert revenues[0] == "$5M-$10M"


def test_search_page_zero_clamps_to_one(client):
    response = client.get("/merchants/search", params={"page": 0})

    assert response.status_code == 200
    assert response.json()["page"] == 1


def test_search_page_size_above_max_is_clamped(client):
    response = client.get("/merchants/search", params={"page_size": 999})

    assert response.status_code == 200
    assert response.json()["page_size"] == 100


def test_search_page_beyond_results_returns_empty_page(client):
    response = client.get("/merchants/search", params={"q": "atlas", "page": 10, "page_size": 5})

    assert response.status_code == 200
    assert response.json()["results"] == []


def test_search_cache_miss_then_hit_uses_redis(client, fake_redis):
    params = {"q": "atlas", "page": 1, "page_size": 20}

    first = client.get("/merchants/search", params=params)
    second = client.get("/merchants/search", params=params)

    assert first.status_code == 200
    assert second.status_code == 200
    assert fake_redis.operation_counts["setex"] >= 1
    assert fake_redis.operation_counts["get"] >= 2


def test_search_logs_every_request(client, db_session):
    client.get("/merchants/search", params={"q": "atlas"})
    client.get("/merchants/search", params={"q": "atlas"})

    logs = db_session.execute(select(SearchLog)).scalars().all()
    assert len(logs) == 2


def test_search_without_query_returns_seeded_directory(client):
    response = client.get("/merchants/search")

    assert response.status_code == 200
    assert response.json()["total_count"] >= 600
