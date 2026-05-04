from __future__ import annotations


def test_autocomplete_requires_two_characters(client):
    response = client.get("/merchants/autocomplete", params={"q": "a"})

    assert response.status_code == 400


def test_autocomplete_returns_prefix_matches(client):
    response = client.get("/merchants/autocomplete", params={"q": "At"})

    assert response.status_code == 200
    suggestions = response.json()["suggestions"]
    assert suggestions
    assert all(item.lower().startswith("at") for item in suggestions)


def test_autocomplete_is_limited_to_ten_results(client):
    response = client.get("/merchants/autocomplete", params={"q": "N"})

    assert response.status_code == 400

    response = client.get("/merchants/autocomplete", params={"q": "No"})
    assert response.status_code == 200
    assert len(response.json()["suggestions"]) <= 10


def test_autocomplete_prefers_high_application_merchants(client):
    response = client.get("/merchants/autocomplete", params={"q": "North"})

    assert response.status_code == 200
    suggestions = response.json()["suggestions"]
    assert suggestions[0] == "Northwind Logistics"


def test_autocomplete_uses_cache(client, fake_redis):
    client.get("/merchants/autocomplete", params={"q": "At"})
    client.get("/merchants/autocomplete", params={"q": "At"})

    assert fake_redis.operation_counts["setex"] >= 1
    assert fake_redis.operation_counts["get"] >= 2
