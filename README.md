# KAPS AI — Buy Now, Pay Later Marketplace Platform

[![CI](https://github.com/karan-patel11/credit-analyzer/actions/workflows/ci.yml/badge.svg)](https://github.com/karan-patel11/credit-analyzer/actions/workflows/ci.yml)

A production-grade BNPL (Buy Now, Pay Later) marketplace platform combining merchant discovery with real-time consumer credit decisioning. Consumers search merchants, see personalized pre-approval amounts, and get instant credit decisions with flexible payment plans. Merchants are evaluated for platform onboarding through an AI-powered financial review pipeline.

Built with Python, FastAPI, MySQL, Redis, React, Docker, and Kubernetes.

## Architecture

Consumer Flow:
  Search merchants → See pre-approvals → Check eligibility → Get payment plans

Merchant Flow:  
  Upload financials → Risk assessment → Onboarding decision → Join marketplace

```text
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   KAPS AI PLATFORM                                           │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                               │
│   ┌────────────────────────────── Frontend ───────────────────────────────┐                   │
│   │ React + Vite                                                          │                   │
│   │                                                                       │                   │
│   │  Merchant Search        Merchant Profile        Credit Memo Workspace │                   │
│   │  - ranked discovery     - aggregated stats      - application intake  │                   │
│   │  - autocomplete         - approval signals      - memo rendering      │                   │
│   │  - analytics snapshot   - risk tier summary     - underwriting flags  │                   │
│   └──────────────────────────────────┬─────────────────────────────────────┘                   │
│                                      │ HTTP / JSON                                             │
│                                      ▼                                                         │
│   ┌────────────────────────────── FastAPI API ─────────────────────────────┐                  │
│   │ /merchants/search      /merchants/autocomplete     /analytics/search   │                  │
│   │ /merchants/{id}        /merchants/industries       /health/*           │                  │
│   │ /analyze               /analyze/async              /status/{job_id}    │                  │
│   │ /webhook                                                              │                  │
│   └───────────────────────┬───────────────────┬────────────────────────────┘                  │
│                           │                   │                                               │
│                           ▼                   ▼                                               │
│   ┌─────────────────────────────┐   ┌─────────────────────────────┐                           │
│   │ Search Service              │   │ Credit Service              │                           │
│   │ - weighted relevance        │   │ Stage 1: bank parser        │                           │
│   │ - MySQL filters + ranking   │   │ Stage 2: risk scorer        │                           │
│   │ - Redis cache               │   │ Stage 3: memo generator     │                           │
│   │ - search log persistence    │   │ MySQL-backed job state      │                           │
│   └──────────────┬──────────────┘   └──────────────┬──────────────┘                           │
│                  │                                 │                                          │
│                  ▼                                 ▼                                          │
│        ┌────────────────────┐             ┌────────────────────┐                              │
│        │ MySQL 8.0          │             │ Redis 7            │                              │
│        │ - merchants        │             │ - search cache     │                              │
│        │ - loan_applications│             │ - autocomplete     │                              │
│        │ - search_logs      │             │ - rate limiting    │                              │
│        └────────────────────┘             │ - job status cache │                              │
│                                           └────────────────────┘                              │
│                                                                                               │
│   Kubernetes deploys the frontend, backend, MySQL, and Redis with probes, ingress, and HPA. │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend API | Python 3.11+, FastAPI, Pydantic v2 |
| Data | MySQL 8.0, SQLAlchemy, mysql-connector-python |
| Cache & Controls | Redis 7, result caching, rate limiting |
| Frontend | React, Vite |
| Testing | pytest, pytest-cov |
| Developer Tooling | Ruff, mypy |
| Infrastructure | Docker Compose, Kubernetes, GitHub Actions |

## Features

- Relevance-ranked merchant search with filtering, autocomplete, and pagination
- Personalized consumer credit pre-approval across all merchants
- Instant credit decisioning with payment plan generation (Pay in 4/6/12/24)
- AI-powered merchant onboarding review with financial risk assessment
- Real-time search analytics and platform health monitoring

## Search Relevance

KAPS AI ranks merchants with a weighted relevance formula that blends textual affinity with quality and popularity signals:

```python
relevance_score = (
    0.4 * name_similarity +
    0.3 * industry_match +
    0.2 * normalized_applications +
    0.1 * normalized_approval_rate
)
```

- `name_similarity` rewards exact matches over prefix matches over partial matches.
- `industry_match` lets industry intent surface even when the merchant name differs.
- `normalized_applications` captures merchant popularity.
- `normalized_approval_rate` nudges higher-quality merchants upward when textual relevance is tied.

## API

### Search Merchants

```bash
curl "http://localhost:8000/merchants/search?q=retail&industry=retail&sort_by=relevance&page=1&page_size=10"
```

### Merchant Profile

```bash
curl "http://localhost:8000/merchants/1"
```

### Autocomplete

```bash
curl "http://localhost:8000/merchants/autocomplete?q=gre"
```

### Industries

```bash
curl "http://localhost:8000/merchants/industries"
```

### Search Analytics

```bash
curl "http://localhost:8000/analytics/search"
```

### Consumer Credit Eligibility Check

```bash
curl -X POST "http://localhost:8000/credit/instant-check" \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_income": 5000,
    "monthly_debt": 800,
    "credit_tier": "good",
    "merchant_id": 1,
    "purchase_amount": 1500
  }'
```

### Batch Pre-approval for Search Results

```bash
curl -X POST "http://localhost:8000/credit/preapproval-batch" \
  -H "Content-Type: application/json" \
  -d '{
    "monthly_income": 5000,
    "credit_tier": "good",
    "merchant_ids": [1, 2, 3]
  }'
```

### Merchant Onboarding (Credit Analysis)

```bash
curl -X POST "http://localhost:8000/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "North Harbor Goods",
    "industry": "Retail",
    "annual_revenue": 1200000,
    "loan_amount": 240000,
    "loan_purpose": "Inventory"
  }'
```

### Async Credit Analysis

```bash
curl -X POST "http://localhost:8000/analyze/async" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "North Harbor Goods",
    "industry": "Retail",
    "annual_revenue": 1200000,
    "loan_amount": 240000,
    "loan_purpose": "Inventory"
  }'
```

### Job Status

```bash
curl "http://localhost:8000/status/<job_id>"
```

### Webhook

```bash
curl -X POST "http://localhost:8000/webhook" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: <sha256-signature>" \
  -d '{
    "event": "credit.memo.ready",
    "job_id": "abc123",
    "data": {
      "source": "partner-system"
    }
  }'
```

### Health

```bash
curl "http://localhost:8000/health"
curl "http://localhost:8000/health/ready"
curl "http://localhost:8000/health/live"
```

## Performance Metrics

- Search P95 latency: `3.847083993605338 ms`
- Autocomplete P95 latency: `0.9898749995045364 ms`
- Search with Redis cache hit: `1.4567049982724711 ms`
- Search without cache (cold): `4.02734999981476 ms`
- Merchant records seeded: `600`
- Test coverage: `90%`
- Tests passing: `53/53`

## Screenshots

### Merchant Search & Discovery

![Merchant Search](docs/screenshots/merchant-search.png)

### Credit Analysis Pipeline

![Credit Analysis](docs/screenshots/credit-analysis.png)

### Platform Health Dashboard

![Platform Stats](docs/screenshots/platform-stats.png)

## Quick Start

### Docker Compose

1. Copy `.env.example` to `.env`.
2. Start the full stack:

```bash
docker compose up --build
```

3. Open the frontend at `http://localhost:5173`.
4. Open the backend docs at `http://localhost:8000/docs`.

### Local Backend

```bash
python -m pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
```

## Kubernetes

Apply the manifests in order:

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mysql-service.yaml
kubectl apply -f k8s/mysql-statefulset.yaml
kubectl apply -f k8s/redis-service.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
```

## Test Layout

```text
tests/
├── conftest.py
├── test_search.py
├── test_autocomplete.py
├── test_credit_pipeline.py
├── test_risk_scoring.py
├── test_webhooks.py
└── test_integration.py
```

Built by [Karan Patel](https://karan-patel11.github.io/PortfolioWebsite)
