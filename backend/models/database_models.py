from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Index, Integer, JSON, String, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utcnow() -> datetime:
    """Return a timezone-aware UTC timestamp."""

    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    """Base class for SQLAlchemy ORM models."""


class Merchant(Base):
    """Merchant directory record used for search and discovery."""

    __tablename__ = "merchants"
    __table_args__ = (
        Index("ix_merchants_name", "name"),
        Index("ix_merchants_filters", "industry", "city", "state", "risk_tier"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(128), nullable=False)
    city: Mapped[str] = mapped_column(String(128), nullable=False)
    state: Mapped[str] = mapped_column(String(32), nullable=False)
    zip_code: Mapped[str] = mapped_column(String(16), nullable=False)
    revenue_range: Mapped[str] = mapped_column(String(64), nullable=False)
    revenue_sort_value: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    risk_tier: Mapped[str] = mapped_column(String(16), nullable=False)
    avg_risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    total_applications: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    approval_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
    )


class LoanApplicationRecord(Base):
    """Persistent credit analysis job and application record."""

    __tablename__ = "loan_applications"
    __table_args__ = (Index("ix_loan_applications_status", "status"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    business_name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str] = mapped_column(String(128), nullable=False)
    revenue: Mapped[float] = mapped_column(Float, nullable=False)
    loan_amount: Mapped[float] = mapped_column(Float, nullable=False)
    loan_purpose: Mapped[str] = mapped_column(String(128), nullable=False, default="Working Capital")
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="queued")
    stage: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    risk_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    decision: Mapped[str | None] = mapped_column(String(32), nullable=True)
    bank_statement: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    result_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=utcnow,
        onupdate=utcnow,
    )


class SearchLog(Base):
    """Logged search request metadata for analytics."""

    __tablename__ = "search_logs"
    __table_args__ = (Index("ix_search_logs_query_text", "query_text"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    query_text: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    filters_applied: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    results_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    latency_ms: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
