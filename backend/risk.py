"""
Risk scoring module for the customer support system.
Calculates a composite customer churn/escalation risk score.
"""

from typing import List, Dict, Any, Optional
from backend.models import (
    RiskScore,
    RiskFactor,
    RiskLevel,
    CustomerContext,
    ChatMessage,
    SentimentLevel,
)
from backend.audit import audit_logger

def calculate_risk_score(
    customer_id: str,
    customer_context: Optional[CustomerContext],
    messages: List[ChatMessage]
) -> RiskScore:
    """
    Calculate a customer risk score (0-100) based on audit logs, customer context, and message history.
    """
    # 1. Retrieve information from audit logs
    all_logs = audit_logger.get_logs(customer_id=customer_id, limit=100)
    
    complaint_count = sum(1 for log in all_logs if log.action in ["complaint", "trigger_refund"])
    audit_escalation_count = sum(1 for log in all_logs if log.action == "escalate_ticket")
    
    # 2. Extract context values
    ticket_count = customer_context.ticket_count if customer_context else 0
    escalation_count = max(customer_context.escalation_count if customer_context else 0, audit_escalation_count)
    plan = (customer_context.plan or "starter").lower() if customer_context else "starter"
    
    # 3. Calculate factor values (each normalized to 0-100)
    
    # Factor A: Complaint Frequency (Weight: 30%)
    complaint_value = min(complaint_count * 25.0, 100.0)
    
    # Factor B: Support Ticket Count (Weight: 20%)
    ticket_value = min(ticket_count * 20.0, 100.0)
    
    # Factor C: Escalation History (Weight: 25%)
    escalation_value = min(escalation_count * 35.0, 100.0)
    
    # Factor D: Subscription Value (Weight: 15%)
    # Enterprise users are high-value, their churn represents higher risk, but Starter plans churn more easily.
    # We assign higher risk to Starter accounts for churn tendency, or Professional. Let's score it:
    # Starter = 80 (high risk of churn), Professional = 45, Enterprise = 15
    if plan == "enterprise":
        plan_value = 15.0
    elif plan == "professional" or plan == "pro":
        plan_value = 45.0
    else:
        plan_value = 80.0
        
    # Factor E: Current Sentiment Trend (Weight: 10%)
    user_messages = [m for m in messages if m.role == "user"]
    if user_messages:
        neg_count = sum(1 for m in user_messages if m.sentiment and m.sentiment.level == SentimentLevel.NEGATIVE)
        sentiment_value = (neg_count / len(user_messages)) * 100.0
    else:
        sentiment_value = 0.0

    # 4. Assemble the Risk Factors
    factors = [
        RiskFactor(
            name="Complaint Frequency",
            value=complaint_value,
            weight=0.30,
            contribution=complaint_value * 0.30
        ),
        RiskFactor(
            name="Ticket History",
            value=ticket_value,
            weight=0.20,
            contribution=ticket_value * 0.20
        ),
        RiskFactor(
            name="Escalation Count",
            value=escalation_value,
            weight=0.25,
            contribution=escalation_value * 0.25
        ),
        RiskFactor(
            name="Subscription Tier",
            value=plan_value,
            weight=0.15,
            contribution=plan_value * 0.15
        ),
        RiskFactor(
            name="Session Sentiment",
            value=sentiment_value,
            weight=0.10,
            contribution=sentiment_value * 0.10
        )
    ]
    
    # 5. Composite Score
    score = sum(f.contribution for f in factors)
    
    # Map composite score to Risk Level
    if score >= 65.0:
        level = RiskLevel.HIGH
    elif score >= 35.0:
        level = RiskLevel.MEDIUM
    else:
        level = RiskLevel.LOW
        
    return RiskScore(
        level=level,
        score=round(score, 1),
        factors=factors
    )
