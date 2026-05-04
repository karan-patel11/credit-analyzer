from __future__ import annotations

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from backend.models.database_models import SearchLog
from backend.models.schemas import (
    QueryAnalyticsItem,
    SearchAnalyticsResponse,
    SearchResultsDistribution,
)


class AnalyticsService:
    """Service layer for search analytics reporting."""

    def get_search_analytics(self, db: Session) -> SearchAnalyticsResponse:
        """Return top query, latency, and result distribution metrics."""

        total_searches = int(
            db.execute(select(func.count()).select_from(SearchLog)).scalar_one(),
        )
        avg_latency = float(
            db.execute(select(func.avg(SearchLog.latency_ms))).scalar_one() or 0.0,
        )

        top_query_rows = db.execute(
            select(
                SearchLog.query_text,
                func.count(SearchLog.id).label("search_count"),
                func.avg(SearchLog.latency_ms).label("avg_latency_ms"),
            )
            .where(SearchLog.query_text != "")
            .group_by(SearchLog.query_text)
            .order_by(func.count(SearchLog.id).desc(), SearchLog.query_text.asc())
            .limit(10),
        ).all()

        distribution_row = db.execute(
            select(
                func.sum(case((SearchLog.results_count == 0, 1), else_=0)),
                func.sum(
                    case(
                        (
                            (SearchLog.results_count >= 1)
                            & (SearchLog.results_count <= 5),
                            1,
                        ),
                        else_=0,
                    ),
                ),
                func.sum(
                    case(
                        (
                            (SearchLog.results_count >= 6)
                            & (SearchLog.results_count <= 20),
                            1,
                        ),
                        else_=0,
                    ),
                ),
                func.sum(case((SearchLog.results_count >= 21, 1), else_=0)),
            ),
        ).one()

        distribution = SearchResultsDistribution(
            zero_results=int(distribution_row[0] or 0),
            one_to_five=int(distribution_row[1] or 0),
            six_to_twenty=int(distribution_row[2] or 0),
            twenty_one_plus=int(distribution_row[3] or 0),
        )

        top_queries = [
            QueryAnalyticsItem(
                query_text=query_text,
                search_count=int(search_count),
                avg_latency_ms=round(float(avg_latency_ms or 0.0), 2),
            )
            for query_text, search_count, avg_latency_ms in top_query_rows
        ]

        return SearchAnalyticsResponse(
            total_searches=total_searches,
            avg_latency_ms=round(avg_latency, 2),
            top_queries=top_queries,
            results_distribution=distribution,
        )
