from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from backend.database import get_db_session
from backend.models.database_models import Merchant
from backend.models.schemas import (
    CreditMemo, JobAcceptedResponse, JobStatusResponse, LoanApplicationRequest,
    InstantCreditCheckRequest, InstantCreditCheckResponse,
    BatchPreapprovalRequest, BatchPreapprovalResponse, PreapprovalResult
)
from backend.services.credit_service import CreditService, parse_webhook_payload, verify_webhook_signature
from backend.services.credit_check_service import run_instant_credit_check
from backend.services.preapproval_service import calculate_preapproval

router = APIRouter(tags=["credit"])


def _get_credit_service(request: Request) -> CreditService:
    """Build the credit service from application state."""

    return CreditService(
        settings=request.app.state.settings,
        session_factory=request.app.state.session_factory,
        redis_client=request.app.state.redis,
    )


@router.post("/analyze", response_model=CreditMemo)
async def analyze_application(
    application: LoanApplicationRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
) -> CreditMemo:
    """Run a credit analysis request synchronously."""

    service = _get_credit_service(request)
    return await service.analyze_application(application, db)


@router.post("/analyze/async", response_model=JobAcceptedResponse)
async def analyze_application_async(
    application: LoanApplicationRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
) -> JobAcceptedResponse:
    """Queue a credit analysis request and return a polling token."""

    service = _get_credit_service(request)
    response = service.queue_application(application, db)
    background_tasks.add_task(
        service.process_async_application,
        response.job_id,
        application.model_dump(mode="json"),
    )
    return response


@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_status(
    job_id: str,
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
) -> JobStatusResponse:
    """Return the persistent status for a credit analysis job."""

    service = _get_credit_service(request)
    return service.get_job_status(job_id, db)


@router.post("/webhook")
async def receive_webhook(
    request: Request,
    x_webhook_signature: Annotated[str | None, Header()] = None,
) -> dict[str, str | None]:
    """Validate and acknowledge inbound webhook events."""

    raw_body = await request.body()
    if not verify_webhook_signature(
        request.app.state.settings.webhook_secret,
        raw_body,
        x_webhook_signature,
    ):
        raise HTTPException(status_code=401, detail="Invalid webhook signature.")

    payload = parse_webhook_payload(raw_body)
    return {"status": "received", "event": payload.event, "job_id": payload.job_id}


@router.post("/credit/instant-check", response_model=InstantCreditCheckResponse)
async def instant_credit_check(
    request: InstantCreditCheckRequest,
    db: Annotated[Session, Depends(get_db_session)],
) -> InstantCreditCheckResponse:
    """Consumer credit check for a specific merchant purchase."""

    return await run_instant_credit_check(
        monthly_income=request.monthly_income,
        monthly_debt=request.monthly_debt,
        credit_tier=request.credit_tier,
        merchant_id=request.merchant_id,
        purchase_amount=request.purchase_amount,
        db_session=db,
    )


@router.post("/credit/preapproval-batch", response_model=BatchPreapprovalResponse)
async def batch_preapproval(
    request: BatchPreapprovalRequest,
    db: Annotated[Session, Depends(get_db_session)],
) -> BatchPreapprovalResponse:
    """Calculate pre-approval amounts for multiple merchants at once."""

    # Fetch all requested merchants
    merchants = db.query(Merchant).filter(Merchant.id.in_(request.merchant_ids)).all()
    
    results = []
    for merchant in merchants:
        max_approved = calculate_preapproval(
            monthly_income=request.monthly_income,
            credit_tier=request.credit_tier,
            merchant_risk_tier=merchant.risk_tier,
        )
        results.append(
            PreapprovalResult(
                merchant_id=merchant.id,
                merchant_name=merchant.name,
                risk_tier=merchant.risk_tier,
                max_approved=max_approved,
            )
        )
        
    return BatchPreapprovalResponse(results=results)
