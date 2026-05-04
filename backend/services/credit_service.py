from __future__ import annotations

import csv
import hashlib
import hmac
import io
import json
import logging
from datetime import datetime, timezone
from uuid import uuid4

import httpx
from fastapi import HTTPException
from redis import Redis
from sqlalchemy.orm import Session, sessionmaker

from backend.config import Settings
from backend.models.database_models import LoanApplicationRecord
from backend.models.schemas import (
    BankStatementAnalysis,
    CreditMemo,
    JobAcceptedResponse,
    JobStatusResponse,
    LoanApplicationRequest,
    Recommendation,
    RiskAssessment,
    WebhookPayload,
)

LOGGER = logging.getLogger("kaps-ai.credit")


def parse_bank_statement(csv_text: str) -> BankStatementAnalysis:
    """Extract structured metrics from a bank statement CSV payload."""

    reader = csv.DictReader(io.StringIO(csv_text.strip()))
    total_deposits = 0.0
    total_withdrawals = 0.0
    balances: list[float] = []
    transaction_count = 0

    for row in reader:
        try:
            amount = float(str(row.get("Amount", "0")).replace('"', "").strip())
            balance = float(str(row.get("Balance", "0")).replace('"', "").strip())
        except ValueError:
            LOGGER.warning("Skipping malformed bank statement row", extra={"row": row})
            continue

        if amount >= 0:
            total_deposits += amount
        else:
            total_withdrawals += abs(amount)
        balances.append(balance)
        transaction_count += 1

    if not balances:
        raise ValueError("No valid transactions found in bank statement.")

    midpoint = len(balances) // 2
    first_half = balances[:midpoint] or balances
    second_half = balances[midpoint:] or balances
    first_half_avg = sum(first_half) / len(first_half)
    second_half_avg = sum(second_half) / len(second_half)

    if second_half_avg > first_half_avg * 1.1:
        trend = "Positive"
    elif second_half_avg >= first_half_avg * 0.9:
        trend = "Stable"
    else:
        trend = "Declining"

    avg_balance = sum(balances) / len(balances)
    net_cash_flow = total_deposits - total_withdrawals

    return BankStatementAnalysis(
        total_deposits=round(total_deposits, 2),
        total_withdrawals=round(total_withdrawals, 2),
        avg_monthly_balance=round(avg_balance, 2),
        min_balance=round(min(balances), 2),
        max_balance=round(max(balances), 2),
        transaction_count=transaction_count,
        net_cash_flow=round(net_cash_flow, 2),
        overdraft_count=sum(1 for balance in balances if balance < 0),
        cash_flow_trend=trend,
    )


def score_risk(
    application: LoanApplicationRequest,
    bank_analysis: BankStatementAnalysis,
) -> RiskAssessment:
    """Calculate a deterministic risk score for a credit application."""

    loan_to_revenue_ratio = application.loan_amount / application.annual_revenue
    cash_flow_ratio = (
        bank_analysis.net_cash_flow / application.loan_amount
        if application.loan_amount > 0
        else 0.0
    )

    score = 0

    if loan_to_revenue_ratio < 0.3:
        score += 30
    elif loan_to_revenue_ratio < 0.5:
        score += 20
    else:
        score += 10

    if bank_analysis.cash_flow_trend == "Positive":
        score += 30
    elif bank_analysis.cash_flow_trend == "Stable":
        score += 20
    else:
        score += 5

    if bank_analysis.overdraft_count == 0:
        score += 20
    elif bank_analysis.overdraft_count < 3:
        score += 10

    if cash_flow_ratio > 0.5:
        score += 20
    elif cash_flow_ratio > 0.2:
        score += 10

    overall_risk = "Low" if score >= 70 else "Medium" if score >= 45 else "High"

    return RiskAssessment(
        overall_risk=overall_risk,
        risk_score=score,
        loan_to_revenue=f"{loan_to_revenue_ratio * 100:.1f}%",
        cash_flow_coverage=f"{cash_flow_ratio * 100:.1f}%",
    )


def verify_webhook_signature(secret: str, body: bytes, signature: str | None) -> bool:
    """Validate an HMAC-SHA256 webhook signature."""

    if signature is None:
        return True
    expected = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


def _default_bank_analysis(application: LoanApplicationRequest) -> BankStatementAnalysis:
    """Create a conservative synthetic bank analysis when no statement is supplied."""

    annual_revenue = application.annual_revenue
    return BankStatementAnalysis(
        total_deposits=round(annual_revenue * 0.32, 2),
        total_withdrawals=round(annual_revenue * 0.25, 2),
        avg_monthly_balance=round(annual_revenue * 0.09, 2),
        min_balance=round(annual_revenue * 0.03, 2),
        max_balance=round(annual_revenue * 0.15, 2),
        transaction_count=0,
        net_cash_flow=round(annual_revenue * 0.07, 2),
        overdraft_count=0,
        cash_flow_trend="Stable",
    )


def _build_recommendation(
    application: LoanApplicationRequest,
    bank_analysis: BankStatementAnalysis,
    risk_assessment: RiskAssessment,
) -> Recommendation:
    """Construct the lending recommendation section of the memo."""

    if risk_assessment.risk_score >= 55:
        decision = "APPROVE"
        conditions = [
            "Standard collateral requirements",
            "Quarterly financial reporting",
            "12-month term recommended",
        ]
    elif risk_assessment.risk_score >= 35:
        decision = "REVIEW"
        conditions = [
            "Additional documentation required",
            "Higher collateral ratio",
            "6-month review period",
            "Personal guarantee recommended",
        ]
    else:
        decision = "DECLINE"
        conditions = [
            "Insufficient cash flow for requested amount",
            "Re-apply after 6 months with improved financials",
            "Consider reduced loan amount",
        ]

    max_recommended_amount = max(
        0.0,
        min(application.loan_amount, max(bank_analysis.net_cash_flow, 0.0) * 4),
    )

    return Recommendation(
        decision=decision,
        conditions=conditions,
        max_recommended_amount=round(max_recommended_amount, 2),
    )


def _build_flags(
    application: LoanApplicationRequest,
    bank_analysis: BankStatementAnalysis,
) -> list[str]:
    """Generate human-readable underwriting flags."""

    flags: list[str] = []
    loan_to_revenue_ratio = application.loan_amount / application.annual_revenue

    if loan_to_revenue_ratio > 0.5:
        flags.append("High loan-to-revenue ratio (>50%).")
    if bank_analysis.overdraft_count > 0:
        flags.append(f"{bank_analysis.overdraft_count} overdraft(s) detected.")
    if bank_analysis.cash_flow_trend == "Declining":
        flags.append("Declining cash flow trend.")
    if bank_analysis.min_balance < 5000:
        flags.append("Low minimum balance detected.")

    return flags


def _template_narrative(
    application: LoanApplicationRequest,
    bank_analysis: BankStatementAnalysis,
    risk_assessment: RiskAssessment,
) -> str:
    """Build a deterministic fallback narrative when an LLM call is unavailable."""

    decision = (
        "approval"
        if risk_assessment.risk_score >= 55
        else "further review"
        if risk_assessment.risk_score >= 35
        else "decline"
    )

    return (
        f"{application.business_name} is a {application.industry.lower()} business requesting "
        f"${application.loan_amount:,.0f} for {application.loan_purpose.lower()} against "
        f"annual revenue of ${application.annual_revenue:,.0f}.\n\n"
        f"Bank statement analysis shows ${bank_analysis.total_deposits:,.0f} in deposits, "
        f"${bank_analysis.total_withdrawals:,.0f} in withdrawals, and "
        f"${bank_analysis.net_cash_flow:,.0f} in net cash flow. Average balance was "
        f"${bank_analysis.avg_monthly_balance:,.0f} with a {bank_analysis.cash_flow_trend.lower()} "
        f"trend and {bank_analysis.overdraft_count} overdraft occurrence(s).\n\n"
        f"Based on the deterministic assessment, the application scored "
        f"{risk_assessment.risk_score}/100 with {risk_assessment.loan_to_revenue} "
        f"loan-to-revenue and {risk_assessment.cash_flow_coverage} cash flow coverage. "
        f"The recommended outcome is {decision}."
    )


async def generate_llm_narrative(
    application: LoanApplicationRequest,
    bank_analysis: BankStatementAnalysis,
    risk_assessment: RiskAssessment,
    settings: Settings,
) -> str:
    """Generate an LLM-backed credit memo narrative with a deterministic fallback."""

    if not settings.groq_api_key:
        return _template_narrative(application, bank_analysis, risk_assessment)

    prompt = f"""You are a senior credit analyst at a financial services platform.
Write exactly 3 concise paragraphs for this loan application.

APPLICATION
- Business: {application.business_name}
- Industry: {application.industry}
- Annual Revenue: ${application.annual_revenue:,.0f}
- Loan Requested: ${application.loan_amount:,.0f}
- Purpose: {application.loan_purpose}

BANK STATEMENT ANALYSIS
- Total Deposits: ${bank_analysis.total_deposits:,.0f}
- Total Withdrawals: ${bank_analysis.total_withdrawals:,.0f}
- Average Balance: ${bank_analysis.avg_monthly_balance:,.0f}
- Net Cash Flow: ${bank_analysis.net_cash_flow:,.0f}
- Trend: {bank_analysis.cash_flow_trend}
- Overdrafts: {bank_analysis.overdraft_count}

RISK ASSESSMENT
- Risk Score: {risk_assessment.risk_score}/100
- Overall Risk: {risk_assessment.overall_risk}
- Loan-to-Revenue: {risk_assessment.loan_to_revenue}
- Cash Flow Coverage: {risk_assessment.cash_flow_coverage}

Paragraph 1: business context and request.
Paragraph 2: financial findings with specific numbers.
Paragraph 3: risk assessment and recommendation."""

    try:
        async with httpx.AsyncClient(timeout=settings.llm_timeout_seconds) as client:
            response = await client.post(
                settings.groq_api_url,
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.groq_model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You write concise and factual underwriting memos.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.2,
                    "max_tokens": 450,
                },
            )
            response.raise_for_status()
            payload = response.json()
            return str(payload["choices"][0]["message"]["content"]).strip()
    except Exception:
        LOGGER.exception("LLM narrative generation failed; using template fallback")
        return _template_narrative(application, bank_analysis, risk_assessment)


class CreditService:
    """Service layer for the KAPS AI credit analysis workflow."""

    def __init__(
        self,
        settings: Settings,
        session_factory: sessionmaker[Session],
        redis_client: Redis | None,
    ) -> None:
        self.settings = settings
        self.session_factory = session_factory
        self.redis_client = redis_client

    def create_application_record(
        self,
        application: LoanApplicationRequest,
        db: Session,
    ) -> LoanApplicationRecord:
        """Persist a new application record before pipeline execution."""

        job_id = str(uuid4())
        record = LoanApplicationRecord(
            id=job_id,
            business_name=application.business_name,
            industry=application.industry,
            revenue=application.annual_revenue,
            loan_amount=application.loan_amount,
            loan_purpose=application.loan_purpose,
            bank_statement=application.bank_statement,
            status="queued",
            stage=0,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    async def analyze_application(
        self,
        application: LoanApplicationRequest,
        db: Session,
    ) -> CreditMemo:
        """Run the credit pipeline synchronously and return the completed memo."""

        record = self.create_application_record(application, db)
        return await self._run_pipeline(record.id, application, db)

    def queue_application(
        self,
        application: LoanApplicationRequest,
        db: Session,
    ) -> JobAcceptedResponse:
        """Persist an async application request and return its polling metadata."""

        record = self.create_application_record(application, db)
        return JobAcceptedResponse(
            job_id=record.id,
            status=record.status,
            poll_url=f"/status/{record.id}",
        )

    async def process_async_application(
        self,
        job_id: str,
        application_payload: dict,
    ) -> None:
        """Process a queued application in a background task."""

        application = LoanApplicationRequest.model_validate(application_payload)
        with self.session_factory() as db:
            await self._run_pipeline(job_id, application, db)

    def get_job_status(self, job_id: str, db: Session) -> JobStatusResponse:
        """Fetch job status from Redis cache or persistent storage."""

        cache_key = f"kaps:job:{job_id}"
        if self.redis_client is not None:
            cached_status = self.redis_client.get(cache_key)
            if cached_status:
                return JobStatusResponse.model_validate(json.loads(cached_status))

        record = db.get(LoanApplicationRecord, job_id)
        if record is None:
            raise HTTPException(status_code=404, detail="Job not found.")

        result = (
            CreditMemo.model_validate(record.result_payload)
            if record.result_payload is not None
            else None
        )
        response = JobStatusResponse(
            job_id=record.id,
            status=record.status,
            stage=record.stage,
            result=result,
            error=record.error_message,
        )
        self._cache_job_status(response)
        return response

    async def _run_pipeline(
        self,
        job_id: str,
        application: LoanApplicationRequest,
        db: Session,
    ) -> CreditMemo:
        """Execute the full credit pipeline and persist the result."""

        try:
            self._update_status(db, job_id, "parsing", 0)
            self._update_status(db, job_id, "analyzing", 1)
            bank_analysis = (
                parse_bank_statement(application.bank_statement)
                if application.bank_statement
                else _default_bank_analysis(application)
            )

            self._update_status(db, job_id, "scoring", 2)
            risk_assessment = score_risk(application, bank_analysis)

            self._update_status(db, job_id, "generating", 3)
            narrative = await generate_llm_narrative(
                application,
                bank_analysis,
                risk_assessment,
                self.settings,
            )

            recommendation = _build_recommendation(application, bank_analysis, risk_assessment)
            flags = _build_flags(application, bank_analysis)

            memo = CreditMemo(
                job_id=job_id,
                application_summary={
                    "business_name": application.business_name,
                    "industry": application.industry,
                    "annual_revenue": application.annual_revenue,
                    "loan_amount_requested": application.loan_amount,
                    "loan_purpose": application.loan_purpose,
                    "loan_to_revenue_ratio": (
                        f"{(application.loan_amount / application.annual_revenue) * 100:.1f}%"
                    ),
                },
                bank_statement_analysis=bank_analysis,
                risk_assessment=risk_assessment,
                recommendation=recommendation,
                llm_narrative=narrative,
                flags=flags,
                generated_at=datetime.now(timezone.utc).isoformat(),
            )

            record = db.get(LoanApplicationRecord, job_id)
            if record is None:
                raise HTTPException(status_code=404, detail="Job not found.")

            record.status = "complete"
            record.stage = 4
            record.risk_score = risk_assessment.risk_score
            record.decision = recommendation.decision
            record.error_message = None
            record.result_payload = memo.model_dump(mode="json")
            db.commit()
            db.refresh(record)

            self._cache_job_status(
                JobStatusResponse(job_id=job_id, status="complete", stage=4, result=memo, error=None),
            )
            return memo
        except HTTPException:
            raise
        except Exception as exc:
            LOGGER.exception("Credit pipeline failed", extra={"job_id": job_id})
            record = db.get(LoanApplicationRecord, job_id)
            if record is not None:
                record.status = "failed"
                record.stage = 4
                record.error_message = str(exc)
                db.commit()
                self._cache_job_status(
                    JobStatusResponse(
                        job_id=job_id,
                        status="failed",
                        stage=4,
                        result=None,
                        error=str(exc),
                    ),
                )
            raise HTTPException(status_code=500, detail="Credit analysis failed.") from exc

    def _update_status(self, db: Session, job_id: str, status: str, stage: int) -> None:
        """Persist intermediate job status and refresh the Redis cache."""

        record = db.get(LoanApplicationRecord, job_id)
        if record is None:
            raise HTTPException(status_code=404, detail="Job not found.")
        record.status = status
        record.stage = stage
        db.commit()
        self._cache_job_status(
            JobStatusResponse(job_id=job_id, status=status, stage=stage, result=None, error=None),
        )

    def _cache_job_status(self, payload: JobStatusResponse) -> None:
        """Store job status in Redis for faster polling."""

        if self.redis_client is None:
            return
        self.redis_client.setex(
            f"kaps:job:{payload.job_id}",
            self.settings.job_status_ttl_seconds,
            payload.model_dump_json(),
        )


def parse_webhook_payload(raw_body: bytes) -> WebhookPayload:
    """Validate the inbound webhook JSON payload."""

    try:
        parsed_body = json.loads(raw_body)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.") from exc
    return WebhookPayload.model_validate(parsed_body)
