from __future__ import annotations

import time

from fastapi import APIRouter, HTTPException, Request

from backend.database import ping_database, ping_redis
from backend.models.schemas import HealthResponse, LiveResponse, ReadyResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health(request: Request) -> HealthResponse:
    """Return basic service metadata."""

    settings = request.app.state.settings
    return HealthResponse(
        status="healthy",
        service="kaps-credit-analyzer",
        version=settings.api_version,
        environment=settings.environment,
    )


@router.get("/health/ready", response_model=ReadyResponse)
async def readiness(request: Request) -> ReadyResponse:
    """Return whether the service can reach MySQL and Redis."""

    try:
        database_ready = ping_database(request.app.state.session_factory)
    except Exception:
        database_ready = False

    try:
        redis_ready = ping_redis(request.app.state.redis)
    except Exception:
        redis_ready = False

    if not database_ready or not redis_ready:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "database": "ready" if database_ready else "unavailable",
                "redis": "ready" if redis_ready else "unavailable",
            },
        )

    return ReadyResponse(status="ready", database="ready", redis="ready")


@router.get("/health/live", response_model=LiveResponse)
async def liveness(request: Request) -> LiveResponse:
    """Return a lightweight liveness response."""

    _ = time.perf_counter() - request.app.state.started_at
    return LiveResponse(status="alive")
