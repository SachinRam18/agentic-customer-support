"""
Security controls and abuse prevention module for customer support transactions.
Includes refund abuse checks, rate limits on destructive actions, and confirmation policy enforcement.
"""

from typing import Dict, List, Any, Tuple
from datetime import datetime, timedelta
from backend.models import ConfirmableAction
from backend.audit import audit_logger

class SecurityGuard:
    def __init__(self):
        # session_id -> list of timestamps of destructive actions taken in this session
        self.session_destructive_actions: Dict[str, List[datetime]] = {}

    def require_confirmation(self, action_type: str) -> bool:
        """
        Check if an action is destructive and requires explicit client confirmation.
        """
        try:
            ConfirmableAction(action_type)
            return True
        except ValueError:
            return False

    def check_refund_abuse(self, customer_id: str) -> bool:
        """
        Checks if the customer has made > 2 refund requests in the last 30 days.
        """
        logs = audit_logger.get_logs(customer_id=customer_id, action="trigger_refund", limit=100)
        
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_refunds = 0
        
        for log in logs:
            try:
                log_time = datetime.fromisoformat(log.timestamp)
                if log_time > thirty_days_ago and "error" not in log.result.lower():
                    recent_refunds += 1
            except Exception:
                # Fallback to simple counter if ISO parsing fails
                recent_refunds += 1
                
        return recent_refunds >= 2

    def record_destructive_action(self, session_id: str) -> None:
        """
        Logs that a destructive action was performed in this session.
        """
        if session_id not in self.session_destructive_actions:
            self.session_destructive_actions[session_id] = []
        self.session_destructive_actions[session_id].append(datetime.now())

    def is_rate_limited(self, session_id: str, limit: int = 5) -> bool:
        """
        Check if the session has exceeded the maximum allowed destructive actions (rate limit).
        """
        actions = self.session_destructive_actions.get(session_id, [])
        # We clean up older than 1 hour just to keep memory tidy
        one_hour_ago = datetime.now() - timedelta(hours=1)
        actions = [t for t in actions if t > one_hour_ago]
        self.session_destructive_actions[session_id] = actions
        
        return len(actions) >= limit

    def validate_action_allowed(self, customer_id: str, action: str, session_id: str) -> Tuple[bool, str]:
        """
        Performs a unified security check before executing any high-risk action.
        Returns (is_allowed, error_reason)
        """
        # 1. Rate Limiting Check
        if self.is_rate_limited(session_id):
            return False, "Rate limit exceeded. Too many sensitive actions attempted in this session."

        # 2. Refund Abuse Check
        if action == ConfirmableAction.TRIGGER_REFUND.value:
            if self.check_refund_abuse(customer_id):
                return False, "Refund request blocked: exceeded the limit of allowed refunds in a 30-day window."
                
        return True, ""

# Singleton instance
security_guard = SecurityGuard()
