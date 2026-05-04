from __future__ import annotations

import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pythonjsonlogger.json import JsonFormatter

from backend.config import Settings, get_settings
from backend.database import (
    build_engine,
    build_redis_client,
    build_session_factory,
    initialize_database,
)
from backend.routers.analytics import router as analytics_router
from backend.routers.credit import router as credit_router
from backend.routers.health import router as health_router
from backend.routers.search import router as search_router
from backend.seed_data import seed_merchants_if_empty

LOGGER = logging.getLogger("kaps-ai.app")


def configure_logging(log_level: str) -> None:
    """Configure structured JSON logging."""

    root_logger = logging.getLogger()
    if root_logger.handlers:
        return

    handler = logging.StreamHandler()
    handler.setFormatter(
        JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s"),
    )
    root_logger.addHandler(handler)
    root_logger.setLevel(log_level.upper())


def create_app(
    settings: Settings | None = None,
    session_factory=None,
    redis_client=None,
) -> FastAPI:
    """Create and configure the FastAPI application."""

    resolved_settings = settings or get_settings()
    configure_logging(resolved_settings.log_level)
    engine = build_engine(resolved_settings.database_url) if session_factory is None else None
    resolved_session_factory = session_factory or build_session_factory(engine)
    resolved_redis_client = redis_client if redis_client is not None else build_redis_client(
        resolved_settings.redis_url,
    )

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.settings = resolved_settings
        app.state.session_factory = resolved_session_factory
        app.state.redis = resolved_redis_client
        app.state.started_at = time.perf_counter()

        if engine is not None:
            initialize_database(engine)
            if resolved_settings.auto_seed_merchants:
                with resolved_session_factory() as db:
                    seeded_count = seed_merchants_if_empty(db, resolved_settings.seed_merchant_count)
                    if seeded_count:
                        LOGGER.info("Seeded synthetic merchants", extra={"count": seeded_count})

        yield

        if engine is not None:
            engine.dispose()
        if resolved_redis_client is not None:
            resolved_redis_client.close()

    app = FastAPI(
        title=resolved_settings.app_name,
        description=resolved_settings.app_description,
        version=resolved_settings.api_version,
        lifespan=lifespan,
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=resolved_settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.middleware("http")
    async def rate_limit_middleware(request: Request, call_next):
        """Apply Redis-backed request rate limiting."""

        if request.url.path.startswith("/health"):
            return await call_next(request)

        redis = request.app.state.redis
        if redis is not None:
            try:
                client_host = request.client.host if request.client else "unknown"
                bucket_key = f"kaps:rate-limit:{client_host}:{int(time.time() // 60)}"
                current_count = redis.incr(bucket_key)
                if current_count == 1:
                    redis.expire(bucket_key, 60)
                if current_count > request.app.state.settings.rate_limit_per_minute:
                    return JSONResponse(
                        status_code=429,
                        content={"detail": "Rate limit exceeded. Try again in a minute."},
                    )
            except Exception:
                LOGGER.exception("Rate limiting degraded; continuing request")

        return await call_next(request)

    app.include_router(credit_router)
    app.include_router(search_router)
    app.include_router(analytics_router)
    app.include_router(health_router)
    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
