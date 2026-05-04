from __future__ import annotations

import pytest

from backend.models.schemas import BankStatementAnalysis, LoanApplicationRequest
from backend.services.credit_service import score_risk


def build_application(loan_amount: float) -> LoanApplicationRequest:
    return LoanApplicationRequest(
        business_name="Scoring Test",
        industry="Retail",
        annual_revenue=1000000,
        loan_amount=loan_amount,
        loan_purpose="Inventory",
        bank_statement=None,
    )


def build_analysis(trend: str, overdrafts: int, net_cash_flow: float) -> BankStatementAnalysis:
    return BankStatementAnalysis(
        total_deposits=120000,
        total_withdrawals=90000,
        avg_monthly_balance=25000,
        min_balance=9000,
        max_balance=40000,
        transaction_count=24,
        net_cash_flow=net_cash_flow,
        overdraft_count=overdrafts,
        cash_flow_trend=trend,
    )


@pytest.mark.parametrize(
    ("loan_amount", "expected_points"),
    [(250000, 30), (450000, 20), (700000, 10)],
)
def test_loan_to_revenue_brackets_affect_score(loan_amount, expected_points):
    risk = score_risk(build_application(loan_amount), build_analysis("Stable", 0, 200000))
    assert risk.risk_score >= expected_points


@pytest.mark.parametrize(
    ("trend", "expected_risk"),
    [("Positive", "Low"), ("Stable", "Medium"), ("Declining", "Medium")],
)
def test_cash_flow_trend_changes_risk_band(trend, expected_risk):
    risk = score_risk(build_application(700000), build_analysis(trend, 0, 200000))
    assert risk.overall_risk == expected_risk


@pytest.mark.parametrize(
    ("overdrafts", "expected_score"),
    [(0, 90), (2, 80), (5, 70)],
)
def test_overdraft_history_penalizes_score(overdrafts, expected_score):
    risk = score_risk(build_application(300000), build_analysis("Positive", overdrafts, 200000))
    assert risk.risk_score == expected_score


@pytest.mark.parametrize(
    ("net_cash_flow", "expected_coverage"),
    [(200000, "66.7%"), (90000, "30.0%"), (30000, "10.0%")],
)
def test_cash_flow_coverage_formatting(net_cash_flow, expected_coverage):
    risk = score_risk(build_application(300000), build_analysis("Stable", 0, net_cash_flow))
    assert risk.cash_flow_coverage == expected_coverage
