from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from backend.database import get_db_session
from backend.models.schemas import (
    AutocompleteResponse,
    IndustriesResponse,
    MerchantProfileResponse,
    MerchantSearchQuery,
    MerchantSearchResponse,
    RiskTier,
    SearchSortField,
    SortOrder,
)
from backend.services.search_service import SearchService

router = APIRouter(prefix="/merchants", tags=["merchant-search"])


def _get_search_service(request: Request) -> SearchService:
    """Build the search service from application state."""

    return SearchService(
        settings=request.app.state.settings,
        redis_client=request.app.state.redis,
    )


@router.get("/search", response_model=MerchantSearchResponse)
async def search_merchants(
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
    q: str | None = Query(default=None),
    industry: str | None = Query(default=None),
    city: str | None = Query(default=None),
    state: str | None = Query(default=None),
    risk_tier: RiskTier | None = Query(default=None),
    min_score: int | None = Query(default=None),
    max_score: int | None = Query(default=None),
    sort_by: SearchSortField = Query(default=SearchSortField.RELEVANCE),
    order: SortOrder = Query(default=SortOrder.DESC),
    page: int = Query(default=1),
    page_size: int = Query(default=20),
) -> MerchantSearchResponse:
    """Search the merchant directory with weighted relevance ranking."""

    service = _get_search_service(request)
    params = MerchantSearchQuery(
        q=q,
        industry=industry,
        city=city,
        state=state,
        risk_tier=risk_tier,
        min_score=min_score,
        max_score=max_score,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )
    return service.search_merchants(db, params)


@router.get("/autocomplete", response_model=AutocompleteResponse)
async def autocomplete_merchants(
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
    q: str = Query(...),
) -> AutocompleteResponse:
    """Return merchant autocomplete suggestions."""

    service = _get_search_service(request)
    return service.autocomplete_merchants(db, q)


@router.get("/industries", response_model=IndustriesResponse)
async def list_industries(
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
) -> IndustriesResponse:
    """Return all industries with merchant counts."""

    service = _get_search_service(request)
    return service.list_industries(db)


@router.get("/{merchant_id}", response_model=MerchantProfileResponse)
async def get_merchant_profile(
    merchant_id: int,
    request: Request,
    db: Annotated[Session, Depends(get_db_session)],
) -> MerchantProfileResponse:
    """Return a detailed merchant profile."""

    service = _get_search_service(request)
    return service.get_merchant_profile(db, merchant_id)
