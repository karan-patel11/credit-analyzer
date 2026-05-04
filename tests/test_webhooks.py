from __future__ import annotations

import hashlib
import hmac
import json


def sign(payload: bytes, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()


def test_webhook_accepts_valid_signature(client):
    payload = json.dumps({"event": "document.uploaded", "job_id": "123", "data": {}}).encode("utf-8")
    response = client.post(
        "/webhook",
        content=payload,
        headers={"x-webhook-signature": sign(payload, "kaps-test-secret")},
    )

    assert response.status_code == 200
    assert response.json()["event"] == "document.uploaded"


def test_webhook_rejects_invalid_signature(client):
    payload = json.dumps({"event": "document.uploaded", "job_id": "123", "data": {}}).encode("utf-8")
    response = client.post(
        "/webhook",
        content=payload,
        headers={"x-webhook-signature": "invalid"},
    )

    assert response.status_code == 401


def test_webhook_allows_unsigned_payload(client):
    payload = {"event": "decision.override", "job_id": "xyz", "data": {}}
    response = client.post("/webhook", json=payload)

    assert response.status_code == 200
    assert response.json()["job_id"] == "xyz"


def test_webhook_rejects_invalid_json(client):
    response = client.post("/webhook", content=b"{bad json")

    assert response.status_code == 400


def test_webhook_echoes_event_and_job_id(client):
    payload = {"event": "credit.memo.ready", "job_id": "memo-1", "data": {"source": "unit-test"}}
    response = client.post("/webhook", json=payload)

    assert response.status_code == 200
    assert response.json() == {
        "status": "received",
        "event": "credit.memo.ready",
        "job_id": "memo-1",
    }
