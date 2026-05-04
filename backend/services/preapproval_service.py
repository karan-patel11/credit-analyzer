"""
Stateless pre-approval calculation service for BNPL marketplace.
"""

def calculate_preapproval(
    monthly_income: float,
    credit_tier: str,
    merchant_risk_tier: str
) -> float:
    """Calculate max pre-approved amount for a consumer at a specific merchant.
    
    This is a stateless calculation — no DB needed.
    Used by GET /credit/preapproval endpoint for batch calculations.
    """
    multipliers = {"excellent": 3.0, "good": 2.0, "fair": 1.0, "poor": 0.5}
    risk_factors = {"LOW": 1.0, "MEDIUM": 0.8, "HIGH": 0.6}
    
    max_amount = monthly_income * multipliers.get(credit_tier, 1.0) * risk_factors.get(merchant_risk_tier, 0.8)
    return min(round(max_amount, 2), 25000.0)
