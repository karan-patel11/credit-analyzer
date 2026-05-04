"""
Consumer instant credit check service for BNPL marketplace.

Decision logic:
1. Calculate DTI (debt-to-income ratio) including estimated new payment
2. Determine max approval amount based on credit tier + merchant risk
3. Make decision based on DTI thresholds + credit tier + merchant risk
4. Generate payment plans if approved/review

Approval multipliers (by credit tier):
  excellent (750+): 3.0x monthly income
  good (670-749):   2.0x monthly income  
  fair (580-669):   1.0x monthly income
  poor (<580):      0.5x monthly income

Merchant risk adjustment:
  LOW risk merchant:    1.0x (no reduction)
  MEDIUM risk merchant: 0.8x
  HIGH risk merchant:   0.6x

Max approval = monthly_income × credit_multiplier × merchant_risk_factor
Capped at $25,000

DTI thresholds:
  DTI > 0.50 → always DECLINE
  DTI > 0.43 → DECLINE (unless excellent credit, then REVIEW)
  DTI > 0.36 → REVIEW (approve with caution)
  DTI <= 0.36 → APPROVE

Risk score (0-100):
  DTI component:      40 points max (lower DTI = higher score)
  Credit tier:         30 points max (excellent=30, good=22, fair=14, poor=5)
  Merchant risk:       20 points max (LOW=20, MEDIUM=14, HIGH=8)
  Purchase ratio:      10 points max (purchase/max_approved — lower = better)
"""
from typing import Literal
from fastapi import HTTPException
from sqlalchemy.orm import Session

from backend.models.database_models import Merchant
from backend.models.schemas import InstantCreditCheckResponse, PaymentPlan

async def run_instant_credit_check(
    monthly_income: float,
    monthly_debt: float,
    credit_tier: str,
    merchant_id: int,
    purchase_amount: float,
    db_session: Session
) -> InstantCreditCheckResponse:
    # 1. Fetch merchant from database
    merchant = db_session.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    # 2. Calculate max_approved_amount
    multipliers = {"excellent": 3.0, "good": 2.0, "fair": 1.0, "poor": 0.5}
    risk_factors = {"LOW": 1.0, "MEDIUM": 0.8, "HIGH": 0.6}
    
    credit_multiplier = multipliers.get(credit_tier, 1.0)
    merchant_risk_factor = risk_factors.get(merchant.risk_tier, 0.8)
    
    max_amount = monthly_income * credit_multiplier * merchant_risk_factor
    max_approved_amount = round(min(max_amount, 25000.0), 2)

    # 3. Calculate DTI
    # Use max_plan_months = 12 as default for calculation unless 24 is expected, let's use 12
    max_plan_months = 24 if purchase_amount > 1000 else 12
    estimated_new_payment = purchase_amount / max_plan_months
    dti = (monthly_debt + estimated_new_payment) / monthly_income
    
    # 4. Determine decision
    decision: Literal["APPROVED", "REVIEW", "DECLINED"] = "APPROVED"
    if dti > 0.50:
        decision = "DECLINED"
    elif dti > 0.43:
        decision = "REVIEW" if credit_tier == "excellent" else "DECLINED"
    elif dti > 0.36:
        decision = "REVIEW"
        
    if purchase_amount > max_approved_amount:
        decision = "DECLINED"
        
    if credit_tier == "poor" and dti > 0.30:
        decision = "DECLINED"

    # 5. Calculate risk_score
    # DTI component (max 40)
    dti_score = max(0, int(40 * (1 - (dti / 0.60)))) if dti < 0.60 else 0
    
    # Credit tier (max 30)
    credit_scores = {"excellent": 30, "good": 22, "fair": 14, "poor": 5}
    credit_score = credit_scores.get(credit_tier, 0)
    
    # Merchant risk (max 20)
    merchant_scores = {"LOW": 20, "MEDIUM": 14, "HIGH": 8}
    merchant_score = merchant_scores.get(merchant.risk_tier, 0)
    
    # Purchase ratio (max 10)
    purchase_ratio = purchase_amount / max_approved_amount if max_approved_amount > 0 else 1
    purchase_score = max(0, int(10 * (1 - purchase_ratio))) if purchase_ratio < 1 else 0
    
    risk_score = min(100, dti_score + credit_score + merchant_score + purchase_score)
    
    # 6. Generate payment plans
    payment_plans = []
    if decision in ["APPROVED", "REVIEW"]:
        # Pay in 4: 0% APR
        payment_plans.append(PaymentPlan(
            label="Pay in 4",
            months=4,
            monthly_payment=round(purchase_amount / 4, 2),
            apr=0.0,
            total_cost=round(purchase_amount, 2)
        ))
        
        # Helper for amortization
        def calc_plan(label: str, months: int, apr: float) -> PaymentPlan:
            r = (apr / 100) / 12
            if r == 0:
                monthly = purchase_amount / months
            else:
                monthly = purchase_amount * (r * (1 + r)**months) / ((1 + r)**months - 1)
            monthly = round(monthly, 2)
            return PaymentPlan(
                label=label,
                months=months,
                monthly_payment=monthly,
                apr=apr,
                total_cost=round(monthly * months, 2)
            )
            
        payment_plans.append(calc_plan("Pay in 6", 6, 10.0))
        payment_plans.append(calc_plan("Pay in 12", 12, 15.0))
        
        if purchase_amount > 1000 and decision == "APPROVED":
            payment_plans.append(calc_plan("Pay in 24", 24, 20.0))

    # 7. Build decision_factors
    decision_factors = []
    
    dti_percent = round(dti * 100)
    if dti <= 0.36:
        decision_factors.append(f"Debt-to-income ratio: {dti_percent}% (healthy, below 36% threshold)")
    elif dti <= 0.43:
        decision_factors.append(f"Debt-to-income ratio: {dti_percent}% (elevated, caution advised)")
    else:
        decision_factors.append(f"Debt-to-income ratio: {dti_percent}% (exceeds 43% safe lending threshold)")
        
    credit_tier_map = {
        "excellent": "Excellent (750+ range)",
        "good": "Good (670-749 range)",
        "fair": "Fair (580-669 range)",
        "poor": "Poor (<580 range)"
    }
    decision_factors.append(f"Credit tier: {credit_tier_map.get(credit_tier, 'Unknown')}")
    
    merchant_risk_map = {
        "LOW": "Low (high approval rate history)",
        "MEDIUM": "Medium (standard approval rate)",
        "HIGH": "High (elevated risk profile)"
    }
    decision_factors.append(f"Merchant risk: {merchant_risk_map.get(merchant.risk_tier, 'Unknown')}")
    
    if purchase_amount <= max_approved_amount:
        decision_factors.append(f"Purchase amount (${purchase_amount:,.0f}) within pre-approved limit (${max_approved_amount:,.0f})")
    else:
        decision_factors.append(f"Purchase amount (${purchase_amount:,.0f}) exceeds pre-approved limit (${max_approved_amount:,.0f})")
        
    if decision == "REVIEW":
        decision_factors.append("Elevated DTI — approved with reduced term options")
    elif decision == "DECLINED" and dti <= 0.43 and purchase_amount <= max_approved_amount:
        decision_factors.append("Insufficient debt capacity for requested amount")

    return InstantCreditCheckResponse(
        decision=decision,
        risk_score=risk_score,
        max_approved_amount=max_approved_amount,
        requested_amount=purchase_amount,
        debt_to_income_ratio=round(dti, 4),
        merchant_name=merchant.name,
        merchant_industry=merchant.industry,
        merchant_risk_tier=merchant.risk_tier,
        payment_plans=payment_plans,
        decision_factors=decision_factors
    )
