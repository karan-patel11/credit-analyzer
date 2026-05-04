from __future__ import annotations

from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


class Industry(str, Enum):
    """Supported industries for credit analysis and merchant discovery."""

    RETAIL = "Retail"
    RESTAURANT = "Restaurant"
    CONSTRUCTION = "Construction"
    HEALTHCARE = "Healthcare"
    TECH = "Tech"
    MANUFACTURING = "Manufacturing"
    LOGISTICS = "Logistics"
    REAL_ESTATE = "Real Estate"
    EDUCATION = "Education"
    AGRICULTURE = "Agriculture"
    HOSPITALITY = "Hospitality"
    PROFESSIONAL_SERVICES = "Professional Services"


class RiskTier(str, Enum):
    """Risk tiers used across search and credit analysis."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class SortOrder(str, Enum):
    """Sort order for merchant search results."""

    ASC = "asc"
    DESC = "desc"


class SearchSortField(str, Enum):
    """Supported sort fields for merchant search."""

    RELEVANCE = "relevance"
    RISK_SCORE = "risk_score"
    APPROVAL_RATE = "approval_rate"
    REVENUE = "revenue"


class LoanApplicationRequest(BaseModel):
    """Inbound credit analysis request."""

    business_name: str = Field(..., min_length=1, max_length=255)
    industry: str = Field(..., min_length=1, max_length=128)
    annual_revenue: float = Field(..., gt=0)
    loan_amount: float = Field(..., gt=0)
    loan_purpose: str = Field(default="Working Capital", min_length=1, max_length=128)
    bank_statement: str | None = None

    @field_validator("loan_amount")
    @classmethod
    def validate_loan_amount(cls, value: float, info: Any) -> float:
        """Reject loan requests that materially exceed annual revenue."""

        annual_revenue = info.data.get("annual_revenue")
        if annual_revenue and value > annual_revenue * 5:
            raise ValueError("Loan amount exceeds 5x annual revenue.")
        return value


class BankStatementAnalysis(BaseModel):
    """Structured metrics extracted from a bank statement."""

    total_deposits: float
    total_withdrawals: float
    avg_monthly_balance: float
    min_balance: float
    max_balance: float
    transaction_count: int
    net_cash_flow: float
    overdraft_count: int
    cash_flow_trend: str


class RiskAssessment(BaseModel):
    """Deterministic risk scoring output."""

    overall_risk: str
    risk_score: int
    loan_to_revenue: str
    cash_flow_coverage: str


class Recommendation(BaseModel):
    """Decision output for the credit memo."""

    decision: str
    conditions: list[str]
    max_recommended_amount: float


class CreditMemo(BaseModel):
    """Final credit memo returned by the pipeline."""

    job_id: str
    application_summary: dict[str, Any]
    bank_statement_analysis: BankStatementAnalysis
    risk_assessment: RiskAssessment
    recommendation: Recommendation
    llm_narrative: str | None = None
    flags: list[str]
    generated_at: str


class JobAcceptedResponse(BaseModel):
    """Asynchronous job acknowledgement payload."""

    job_id: str
    status: str
    poll_url: str


class JobStatusResponse(BaseModel):
    """Job status payload used by the polling endpoint."""

    job_id: str
    status: str
    stage: int
    result: CreditMemo | None = None
    error: str | None = None


class WebhookPayload(BaseModel):
    """Validated webhook payload."""

    event: str
    job_id: str | None = None
    data: dict[str, Any] = Field(default_factory=dict)


class MerchantSearchQuery(BaseModel):
    """Normalized search query parameters."""

    q: str | None = None
    industry: str | None = None
    city: str | None = None
    state: str | None = None
    risk_tier: RiskTier | None = None
    min_score: int | None = None
    max_score: int | None = None
    sort_by: SearchSortField = SearchSortField.RELEVANCE
    order: SortOrder = SortOrder.DESC
    page: int = 1
    page_size: int = 20


class MerchantResult(BaseModel):
    """A single merchant search result."""

    id: int
    name: str
    industry: str
    city: str
    state: str
    zip_code: str
    revenue_range: str
    risk_tier: str
    avg_risk_score: float
    total_applications: int
    approval_rate: float
    relevance_score: float


class MerchantSearchResponse(BaseModel):
    """Paginated merchant search response."""

    results: list[MerchantResult]
    total_count: int
    page: int
    page_size: int
    total_pages: int


class MerchantApplicationStats(BaseModel):
    """Aggregated credit application metrics for a merchant profile."""

    lifetime_total_applications: int
    estimated_approved_applications: int
    estimated_declined_or_reviewed: int
    live_pipeline_applications: int
    live_average_risk_score: float | None = None


class MerchantProfileResponse(BaseModel):
    """Detailed merchant profile response."""

    id: int
    name: str
    industry: str
    city: str
    state: str
    zip_code: str
    revenue_range: str
    risk_tier: str
    avg_risk_score: float
    total_applications: int
    approval_rate: float
    application_stats: MerchantApplicationStats


class AutocompleteResponse(BaseModel):
    """Autocomplete suggestions response."""

    query: str
    suggestions: list[str]


class IndustrySummary(BaseModel):
    """Industry count summary."""

    industry: str
    merchant_count: int


class IndustriesResponse(BaseModel):
    """Industry listing response."""

    industries: list[IndustrySummary]


class QueryAnalyticsItem(BaseModel):
    """Top query analytics record."""

    query_text: str
    search_count: int
    avg_latency_ms: float


class SearchResultsDistribution(BaseModel):
    """Search result distribution buckets."""

    zero_results: int
    one_to_five: int
    six_to_twenty: int
    twenty_one_plus: int


class SearchAnalyticsResponse(BaseModel):
    """Search analytics payload."""

    total_searches: int
    avg_latency_ms: float
    top_queries: list[QueryAnalyticsItem]
    results_distribution: SearchResultsDistribution


class HealthResponse(BaseModel):
    """Basic service health payload."""

    status: str
    service: str
    version: str
    environment: str


class ReadyResponse(BaseModel):
    """Readiness payload including dependency state."""

    status: str
    database: str
    redis: str


class LiveResponse(BaseModel):
    """Liveness payload."""

    status: str


class InstantCreditCheckRequest(BaseModel):
    """Consumer credit check for a specific merchant purchase."""

    monthly_income: float = Field(..., gt=0, le=1000000, description="Gross monthly income in USD")
    monthly_debt: float = Field(..., ge=0, description="Total monthly debt payments in USD")
    credit_tier: Literal["excellent", "good", "fair", "poor"]
    merchant_id: int = Field(..., gt=0)
    purchase_amount: float = Field(..., gt=0, le=100000)


class PaymentPlan(BaseModel):
    """Single installment plan option."""

    label: str
    months: int
    monthly_payment: float
    apr: float
    total_cost: float


class InstantCreditCheckResponse(BaseModel):
    """Full credit decision with payment options."""

    decision: Literal["APPROVED", "REVIEW", "DECLINED"]
    risk_score: int
    max_approved_amount: float
    requested_amount: float
    debt_to_income_ratio: float
    merchant_name: str
    merchant_industry: str
    merchant_risk_tier: str
    payment_plans: list[PaymentPlan]
    decision_factors: list[str]


class BatchPreapprovalRequest(BaseModel):
    """Batch request for pre-approval."""

    monthly_income: float = Field(..., gt=0)
    credit_tier: Literal["excellent", "good", "fair", "poor"]
    merchant_ids: list[int] = Field(..., max_length=100)


class PreapprovalResult(BaseModel):
    """Single pre-approval result."""

    merchant_id: int
    merchant_name: str
    risk_tier: str
    max_approved: float


class BatchPreapprovalResponse(BaseModel):
    """Batch pre-approval response."""

    results: list[PreapprovalResult]
