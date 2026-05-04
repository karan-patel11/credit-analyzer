from __future__ import annotations

from collections.abc import Iterator

from fastapi import Request
from redis import Redis
from sqlalchemy import Engine, create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from backend.models.database_models import Base


def build_engine(database_url: str) -> Engine:
    """Create a SQLAlchemy engine for the configured database."""

    connect_args: dict[str, object] = {}
    if database_url.startswith("sqlite"):
        connect_args["check_same_thread"] = False

    return create_engine(
        database_url,
        pool_pre_ping=True,
        pool_recycle=3600,
        connect_args=connect_args,
    )


def build_session_factory(engine: Engine) -> sessionmaker[Session]:
    """Create the SQLAlchemy session factory."""

    return sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def build_redis_client(redis_url: str) -> Redis | None:
    """Create the Redis client for caching and rate limiting."""

    if not redis_url:
        return None
    return Redis.from_url(redis_url, decode_responses=True)


def initialize_database(engine: Engine) -> None:
    """Create database tables if they do not already exist."""

    Base.metadata.create_all(bind=engine)


def get_db_session(request: Request) -> Iterator[Session]:
    """Yield a request-scoped database session."""

    session_local: sessionmaker[Session] = request.app.state.session_factory
    database_session = session_local()
    try:
        yield database_session
    finally:
        database_session.close()


def ping_database(session_factory: sessionmaker[Session]) -> bool:
    """Return whether the database can serve a simple query."""

    with session_factory() as session:
        session.execute(text("SELECT 1"))
    return True


def ping_redis(redis_client: Redis | None) -> bool:
    """Return whether Redis is reachable."""

    if redis_client is None:
        return False
    return bool(redis_client.ping())
