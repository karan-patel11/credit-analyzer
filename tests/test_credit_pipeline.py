from __future__ import annotations

import pytest

from backend.models.schemas import LoanApplicationRequest
from backend.services.credit_service import parse_bank_statement, score_risk


VALID_STATEMENT = """Date,Description,Amount,Balance
2025-01-01,Deposit,1000,2000
2025-01-02,Expense,-200,1800
2025-01-03,Deposit,1200,3000
2025-01-04,Expense,-100,2900
"""


def test_parse_bank_statement_extracts_metrics():
    analysis = parse_bank_statement(VALID_STATEMENT)

    assert analysis.total_deposits == 2200
    assert analysis.total_withdrawals == 300
    assert analysis.transaction_count == 4


def test_parse_bank_statement_skips_malformed_rows():
    analysis = parse_bank_statement(
        """Date,Description,Amount,Balance
2025-01-01,Deposit,1000,2000
2025-01-02,Bad Row,not-a-number,1800
2025-01-03,Deposit,1200,3200
""",
    )

    assert analysis.total_deposits == 2200
    assert analysis.transaction_count == 2


def test_parse_bank_statement_raises_when_no_valid_rows():
    with pytest.raises(ValueError):
        parse_bank_statement("Date,Description,Amount,Balance\n2025-01-01,Bad,NaN,bad")


def test_sync_credit_analysis_returns_memo(client):
    response = client.post(
        "/analyze",
        json={
            "business_name": "Harbor Goods",
            "industry": "Retail",
            "annual_revenue": 1200000,
            "loan_amount": 220000,
            "loan_purpose": "Inventory",
            "bank_statement": VALID_STATEMENT,
        },
    )

    payload = response.json()
    assert response.status_code == 200
    assert payload["recommendation"]["decision"] in {"APPROVE", "REVIEW", "DECLINE"}
    assert payload["job_id"]


def test_async_credit_analysis_returns_job_and_status(client):
    response = client.post(
        "/analyze/async",
        json={
            "business_name": "Harbor Goods",
            "industry": "Retail",
            "annual_revenue": 1200000,
            "loan_amount": 220000,
            "loan_purpose": "Inventory",
            "bank_statement": VALID_STATEMENT,
        },
    )

    assert response.status_code == 200
    job_id = response.json()["job_id"]

    latest_status = None
    for _ in range(5):
        status_response = client.get(f"/status/{job_id}")
        assert status_response.status_code == 200
        latest_status = status_response.json()["status"]
        if latest_status == "complete":
            break

    assert latest_status in {"parsing", "analyzing", "scoring", "generating", "complete"}


def test_credit_analysis_uses_default_bank_analysis_when_statement_absent(client):
    response = client.post(
        "/analyze",
        json={
            "business_name": "Northwind Labs",
            "industry": "Tech",
            "annual_revenue": 900000,
            "loan_amount": 120000,
            "loan_purpose": "Working Capital"
        },
    )

    assert response.status_code == 200
    assert response.json()["bank_statement_analysis"]["transaction_count"] == 0


def test_credit_analysis_generates_declining_flags(client):
    statement = """Date,Description,Amount,Balance
2025-01-01,Deposit,4000,9000
2025-01-02,Expense,-3500,2000
2025-01-03,Expense,-5000,-3000
2025-01-04,Expense,-1200,-4200
"""
    response = client.post(
        "/analyze",
        json={
            "business_name": "Riverline Supply",
            "industry": "Manufacturing",
            "annual_revenue": 400000,
            "loan_amount": 300000,
            "loan_purpose": "Expansion",
            "bank_statement": statement,
        },
    )

    assert response.status_code == 200
    flags = " ".join(response.json()["flags"]).lower()
    assert "overdraft" in flags
    assert "declining" in flags


def test_credit_analysis_rejects_unreasonable_loan_amount(client):
    response = client.post(
        "/analyze",
        json={
            "business_name": "Riverline Supply",
            "industry": "Manufacturing",
            "annual_revenue": 400000,
            "loan_amount": 3000000,
            "loan_purpose": "Expansion",
        },
    )

    assert response.status_code == 422


def test_status_returns_404_for_unknown_job(client):
    response = client.get("/status/not-a-real-id")

    assert response.status_code == 404


def test_score_risk_produces_expected_recommendation_band():
    application = LoanApplicationRequest(
        business_name="Northwind",
        industry="Retail",
        annual_revenue=1000000,
        loan_amount=200000,
        loan_purpose="Inventory",
        bank_statement=VALID_STATEMENT,
    )
    risk = score_risk(application, parse_bank_statement(VALID_STATEMENT))

    assert risk.risk_score >= 55
    assert risk.overall_risk == "Low"
