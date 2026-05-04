from __future__ import annotations

import json
import logging
import math
import time

from fastapi import HTTPException
from redis import Redis
from sqlalchemy import case, desc, func, or_, select
from sqlalchemy.orm import Session

from backend.config import Settings
from backend.models.database_models import LoanApplicationRecord, Merchant, SearchLog
from backend.models.schemas import (
    AutocompleteResponse,
    IndustriesResponse,
    IndustrySummary,
    MerchantApplicationStats,
    MerchantProfileResponse,
    MerchantResult,
    MerchantSearchQuery,
    MerchantSearchResponse,
)

LOGGER = logging.getLogger("kaps-ai.search")


class SearchService:
    """Service layer for merchant search, discovery, and profile lookups."""

    def __init__(self, settings: Settings, redis_client: Redis | None) -> None:
        self.settings = settings
        self.redis_client = redis_client

    def search_merchants(self, db: Session, params: MerchantSearchQuery) -> MerchantSearchResponse:
        """Search merchants using weighted relevance plus optional filters."""

        page = max(1, params.page)
        page_size = min(max(1, params.page_size), 100)
        normalized_query = (params.q or "").strip().lower()

        cache_key = self._search_cache_key(params, page, page_size)
        start_time = time.perf_counter()

        if self.redis_client is not None:
            cached = self.redis_client.get(cache_key)
            if cached:
                response = MerchantSearchResponse.model_validate(json.loads(cached))
                latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
                self._log_search(db, params, response.total_count, latency_ms, True)
                return response

        name_similarity = case(
            (func.lower(Merchant.name) == normalized_query, 1.0),
            (func.lower(Merchant.name).like(f"{normalized_query}%"), 0.85),
            (func.lower(Merchant.name).like(f"%{normalized_query}%"), 0.65),
            else_=0.0,
        )
        industry_similarity = case(
            (func.lower(Merchant.industry) == normalized_query, 1.0),
            (func.lower(Merchant.industry).like(f"{normalized_query}%"), 0.75),
            (func.lower(Merchant.industry).like(f"%{normalized_query}%"), 0.55),
            else_=0.0,
        )
        normalized_applications = Merchant.total_applications / 250.0
        normalized_approval_rate = Merchant.approval_rate / 100.0
        relevance_score = (
            (0.4 * name_similarity)
            + (0.3 * industry_similarity)
            + (0.2 * normalized_applications)
            + (0.1 * normalized_approval_rate)
        ).label("relevance_score")

        statement = select(Merchant, relevance_score)

        if normalized_query:
            statement = statement.where(
                or_(
                    func.lower(Merchant.name).like(f"%{normalized_query}%"),
                    func.lower(Merchant.industry).like(f"%{normalized_query}%"),
                ),
            )
        if params.industry:
            statement = statement.where(Merchant.industry == params.industry)
        if params.city:
            statement = statement.where(Merchant.city == params.city)
        if params.state:
            statement = statement.where(Merchant.state == params.state)
        if params.risk_tier:
            statement = statement.where(Merchant.risk_tier == params.risk_tier.value)
        if params.min_score is not None:
            statement = statement.where(Merchant.avg_risk_score >= params.min_score)
        if params.max_score is not None:
            statement = statement.where(Merchant.avg_risk_score <= params.max_score)

        count_statement = select(func.count()).select_from(statement.subquery())
        total_count = int(db.execute(count_statement).scalar_one())

        sort_mapping = {
            "relevance": relevance_score,
            "risk_score": Merchant.avg_risk_score,
            "approval_rate": Merchant.approval_rate,
            "revenue": Merchant.revenue_sort_value,
        }
        sort_column = sort_mapping.get(params.sort_by.value, relevance_score)
        order_by = sort_column.asc() if params.order.value == "asc" else desc(sort_column)

        offset = (page - 1) * page_size
        rows = db.execute(
            statement.order_by(order_by, Merchant.id.asc()).offset(offset).limit(page_size),
        ).all()

        results = [
            MerchantResult(
                id=merchant.id,
                name=merchant.name,
                industry=merchant.industry,
                city=merchant.city,
                state=merchant.state,
                zip_code=merchant.zip_code,
                revenue_range=merchant.revenue_range,
                risk_tier=merchant.risk_tier,
                avg_risk_score=round(float(merchant.avg_risk_score), 2),
                total_applications=merchant.total_applications,
                approval_rate=round(float(merchant.approval_rate), 2),
                relevance_score=round(float(score or 0.0), 4),
            )
            for merchant, score in rows
        ]

        total_pages = math.ceil(total_count / page_size) if total_count else 0
        response = MerchantSearchResponse(
            results=results,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

        if self.redis_client is not None:
            self.redis_client.setex(
                cache_key,
                self.settings.search_cache_ttl_seconds,
                response.model_dump_json(),
            )

        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        self._log_search(db, params, total_count, latency_ms, False)
        return response

    def get_merchant_profile(self, db: Session, merchant_id: int) -> MerchantProfileResponse:
        """Return a merchant profile with aggregated application metrics."""

        merchant = db.get(Merchant, merchant_id)
        if merchant is None:
            raise HTTPException(status_code=404, detail="Merchant not found.")

        live_count, live_avg_risk = db.execute(
            select(
                func.count(LoanApplicationRecord.id),
                func.avg(LoanApplicationRecord.risk_score),
            ).where(LoanApplicationRecord.business_name == merchant.name),
        ).one()

        estimated_approved = int(round(merchant.total_applications * (merchant.approval_rate / 100)))
        stats = MerchantApplicationStats(
            lifetime_total_applications=merchant.total_applications,
            estimated_approved_applications=estimated_approved,
            estimated_declined_or_reviewed=max(merchant.total_applications - estimated_approved, 0),
            live_pipeline_applications=int(live_count or 0),
            live_average_risk_score=round(float(live_avg_risk), 2) if live_avg_risk is not None else None,
        )

        return MerchantProfileResponse(
            id=merchant.id,
            name=merchant.name,
            industry=merchant.industry,
            city=merchant.city,
            state=merchant.state,
            zip_code=merchant.zip_code,
            revenue_range=merchant.revenue_range,
            risk_tier=merchant.risk_tier,
            avg_risk_score=round(float(merchant.avg_risk_score), 2),
            total_applications=merchant.total_applications,
            approval_rate=round(float(merchant.approval_rate), 2),
            application_stats=stats,
        )

    def autocomplete_merchants(self, db: Session, query: str) -> AutocompleteResponse:
        """Return cached merchant name suggestions for a search prefix."""

        normalized_query = query.strip().lower()
        if len(normalized_query) < 2:
            raise HTTPException(status_code=400, detail="Query must be at least 2 characters.")

        cache_key = f"kaps:autocomplete:{normalized_query}"
        if self.redis_client is not None:
            cached = self.redis_client.get(cache_key)
            if cached:
                return AutocompleteResponse(query=query, suggestions=json.loads(cached))

        suggestions = [
            name
            for (name,) in db.execute(
                select(Merchant.name)
                .where(func.lower(Merchant.name).like(f"{normalized_query}%"))
                .order_by(Merchant.total_applications.desc(), Merchant.approval_rate.desc())
                .limit(10),
            ).all()
        ]

        if self.redis_client is not None:
            self.redis_client.setex(
                cache_key,
                self.settings.autocomplete_cache_ttl_seconds,
                json.dumps(suggestions),
            )

        return AutocompleteResponse(query=query, suggestions=suggestions)

    def list_industries(self, db: Session) -> IndustriesResponse:
        """Return industry counts with Redis caching."""

        cache_key = "kaps:industries"
        if self.redis_client is not None:
            cached = self.redis_client.get(cache_key)
            if cached:
                return IndustriesResponse.model_validate(json.loads(cached))

        rows = db.execute(
            select(Merchant.industry, func.count(Merchant.id))
            .group_by(Merchant.industry)
            .order_by(func.count(Merchant.id).desc(), Merchant.industry.asc()),
        ).all()
        response = IndustriesResponse(
            industries=[
                IndustrySummary(industry=industry, merchant_count=int(count))
                for industry, count in rows
            ],
        )

        if self.redis_client is not None:
            self.redis_client.setex(
                cache_key,
                self.settings.industries_cache_ttl_seconds,
                response.model_dump_json(),
            )

        return response

    def _log_search(
        self,
        db: Session,
        params: MerchantSearchQuery,
        result_count: int,
        latency_ms: float,
        cache_hit: bool,
    ) -> None:
        """Persist search analytics for every request."""

        log_entry = SearchLog(
            query_text=params.q or "",
            filters_applied={
                **params.model_dump(mode="json", exclude_none=True),
                "cache_hit": cache_hit,
            },
            results_count=result_count,
            latency_ms=latency_ms,
        )
        db.add(log_entry)
        db.commit()

    def _search_cache_key(
        self,
        params: MerchantSearchQuery,
        page: int,
        page_size: int,
    ) -> str:
        """Build the Redis cache key for a search request."""

        payload = params.model_dump(mode="json", exclude_none=True)
        payload["page"] = page
        payload["page_size"] = page_size
        return f"kaps:search:{json.dumps(payload, sort_keys=True)}"
