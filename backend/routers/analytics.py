from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.database import get_db_session
from backend.models.schemas import SearchAnalyticsResponse
from backend.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/search", response_model=SearchAnalyticsResponse)
async def get_search_analytics(
    db: Annotated[Session, Depends(get_db_session)],
) -> SearchAnalyticsResponse:
    """Return analytics for merchant search traffic."""

    return AnalyticsService().get_search_analytics(db)
