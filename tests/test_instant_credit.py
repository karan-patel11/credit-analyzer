import pytest
from fastapi.testclient import TestClient

def test_approved_good_credit_low_risk(client: TestClient):
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 500, # DTI: 500/5000 = 10%
        "credit_tier": "good", # 2.0x
        "merchant_id": 1, # Atlas, LOW risk -> 1.0x. Max: 5000 * 2.0 * 1.0 = 10000
        "purchase_amount": 1000
    })
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "APPROVED"
    assert data["max_approved_amount"] == 10000.0
    assert len(data["payment_plans"]) >= 3
    assert data["payment_plans"][0]["label"] == "Pay in 4"

def test_approved_excellent_credit_high_dti(client: TestClient):
    # DTI > 43% -> normally declined, but excellent credit -> REVIEW
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 2200, # 2200 / 5000 = 44% base DTI
        "credit_tier": "excellent",
        "merchant_id": 1,
        "purchase_amount": 500 # Add ~40/mo. DTI = 2241 / 5000 = 44.8%
    })
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "REVIEW"

def test_review_moderate_dti(client: TestClient):
    # DTI > 36% -> REVIEW
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 1800, # 1800/5000 = 36%
        "credit_tier": "good",
        "merchant_id": 1,
        "purchase_amount": 1000 # 1000/12 = 83.33 -> 1883/5000 = ~37% DTI
    })
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "REVIEW"

def test_declined_high_dti(client: TestClient):
    # DTI > 43% (and not excellent credit) -> DECLINE
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 2200,
        "credit_tier": "good",
        "merchant_id": 1,
        "purchase_amount": 1000 # DTI > 44%
    })
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "DECLINED"
    assert len(data["payment_plans"]) == 0

def test_declined_poor_credit_moderate_dti(client: TestClient):
    # Poor credit + DTI > 30% -> DECLINE
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 1500, # 30% base
        "credit_tier": "poor",
        "merchant_id": 1,
        "purchase_amount": 500 # > 30% total DTI
    })
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "DECLINED"

def test_declined_over_max_approved(client: TestClient):
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 500,
        "credit_tier": "fair", # 1.0x
        "merchant_id": 2, # MEDIUM risk -> 0.8x. Max: 5000 * 1.0 * 0.8 = 4000
        "purchase_amount": 4500 # Exceeds 4000
    })
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "DECLINED"

def test_payment_plans_pay_in_4_zero_apr(client: TestClient):
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 500,
        "credit_tier": "good",
        "merchant_id": 1,
        "purchase_amount": 1200
    })
    data = response.json()
    p4 = next(p for p in data["payment_plans"] if p["label"] == "Pay in 4")
    assert p4["apr"] == 0.0
    assert p4["monthly_payment"] == 300.0
    assert p4["total_cost"] == 1200.0

def test_payment_plans_6_months_10_apr(client: TestClient):
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 500,
        "credit_tier": "good",
        "merchant_id": 1,
        "purchase_amount": 1200
    })
    data = response.json()
    p6 = next(p for p in data["payment_plans"] if p["label"] == "Pay in 6")
    assert p6["apr"] == 10.0
    assert p6["months"] == 6

def test_payment_plans_12_months_15_apr(client: TestClient):
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 500,
        "credit_tier": "good",
        "merchant_id": 1,
        "purchase_amount": 1200
    })
    data = response.json()
    p12 = next(p for p in data["payment_plans"] if p["label"] == "Pay in 12")
    assert p12["apr"] == 15.0
    assert p12["months"] == 12

def test_payment_plan_24_months_only_large(client: TestClient):
    # Purchase < 1000 -> no 24 month plan
    res1 = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 500,
        "credit_tier": "good",
        "merchant_id": 1,
        "purchase_amount": 900
    })
    data1 = res1.json()
    labels1 = [p["label"] for p in data1["payment_plans"]]
    assert "Pay in 24" not in labels1

    # Purchase > 1000 -> has 24 month plan
    res2 = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 500,
        "credit_tier": "good",
        "merchant_id": 1,
        "purchase_amount": 1100
    })
    data2 = res2.json()
    labels2 = [p["label"] for p in data2["payment_plans"]]
    assert "Pay in 24" in labels2

def test_no_payment_plans_when_declined(client: TestClient):
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 4000, # Instant decline
        "credit_tier": "poor",
        "merchant_id": 1,
        "purchase_amount": 1000
    })
    data = response.json()
    assert data["decision"] == "DECLINED"
    assert len(data["payment_plans"]) == 0

def test_zero_debt(client: TestClient):
    response = client.post("/credit/instant-check", json={
        "monthly_income": 8000,
        "monthly_debt": 0,
        "credit_tier": "excellent",
        "merchant_id": 1,
        "purchase_amount": 2000
    })
    assert response.status_code == 200
    data = response.json()
    assert data["decision"] == "APPROVED"
    assert data["debt_to_income_ratio"] > 0 # only from the new purchase

def test_merchant_not_found_404(client: TestClient):
    response = client.post("/credit/instant-check", json={
        "monthly_income": 5000,
        "monthly_debt": 500,
        "credit_tier": "good",
        "merchant_id": 99999,
        "purchase_amount": 1000
    })
    assert response.status_code == 404

def test_max_approval_cap_25000(client: TestClient):
    response = client.post("/credit/instant-check", json={
        "monthly_income": 50000, # very high
        "monthly_debt": 0,
        "credit_tier": "excellent", # 3.0x -> 150000
        "merchant_id": 1, # 1.0x
        "purchase_amount": 10000
    })
    data = response.json()
    assert data["max_approved_amount"] == 25000.0

def test_batch_preapproval_multiple_merchants(client: TestClient):
    response = client.post("/credit/preapproval-batch", json={
        "monthly_income": 5000,
        "credit_tier": "good", # 2.0x -> 10000 base
        "merchant_ids": [1, 2, 3] # Atlas (LOW -> 1.0x = 10000), Atlas Coffee (MEDIUM -> 0.8x = 8000), Harbor Trade (HIGH -> 0.6x = 6000)
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 3
    
    # Using the fake IDs created in conftest.py _insert_special_merchants
    # 1: Atlas (LOW)
    # 2: Atlas Coffee (MEDIUM) 
    # 3: Harbor Trade (HIGH)
    amounts = {r["merchant_id"]: r["max_approved"] for r in data["results"]}
    assert amounts.get(1) == 10000.0
    assert amounts.get(2) == 8000.0
    assert amounts.get(3) == 6000.0

def test_batch_preapproval_empty_list(client: TestClient):
    response = client.post("/credit/preapproval-batch", json={
        "monthly_income": 5000,
        "credit_tier": "good",
        "merchant_ids": []
    })
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 0
