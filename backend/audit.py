"""
Audit logging engine for the agentic customer support system.
Stores execution details and LLM reasoning of critical tools and decisions.
"""

from typing import List, Dict, Any, Optional
from backend.models import AuditLogEntry, AnalyticsDashboardData

class AuditLogger:
    def __init__(self):
        self.logs: List[AuditLogEntry] = []

    def log_action(
        self,
        customer_id: str,
        action: str,
        params: Dict[str, Any],
        result: str = "",
        reasoning: str = "",
        session_id: str = ""
    ) -> AuditLogEntry:
        entry = AuditLogEntry(
            customer_id=customer_id,
            action=action,
            params=params,
            result=result,
            agent_reasoning=reasoning,
            session_id=session_id
        )
        self.logs.append(entry)
        return entry

    def get_logs(
        self,
        customer_id: Optional[str] = None,
        action: Optional[str] = None,
        limit: int = 100
    ) -> List[AuditLogEntry]:
        filtered = self.logs
        if customer_id:
            filtered = [log for log in filtered if log.customer_id == customer_id]
        if action:
            filtered = [log for log in filtered if log.action == action]
        return filtered[-limit:]

    def get_all_logs(self) -> List[AuditLogEntry]:
        return self.logs

    def get_stats(self) -> Dict[str, Any]:
        """
        Calculate aggregated stats from the audit log.
        """
        total = len(self.logs)
        action_counts = {}
        successful_actions = 0
        
        for log in self.logs:
            action_counts[log.action] = action_counts.get(log.action, 0) + 1
            if "error" not in log.result.lower() and "fail" not in log.result.lower():
                successful_actions += 1

        success_rate = (successful_actions / total * 100.0) if total > 0 else 100.0
        
        return {
            "total_actions": total,
            "action_counts": action_counts,
            "success_rate": success_rate
        }

# Singleton instance
audit_logger = AuditLogger()
