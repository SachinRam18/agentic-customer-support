"""
Pydantic models for the enterprise-grade customer support system.
Covers conversation memory, audit logging, sentiment, risk scoring,
notifications, timeline events, and multi-agent architecture.
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


# ─────────────────────────────────────────────────────────────
# Enums
# ─────────────────────────────────────────────────────────────

class SentimentLevel(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TimelineEventType(str, Enum):
    CHAT_STARTED = "chat_started"
    INTENT_DETECTED = "intent_detected"
    RAG_RETRIEVAL = "rag_retrieval"
    TOOL_CALLED = "tool_called"
    CONFIRMATION_REQUESTED = "confirmation_requested"
    CONFIRMATION_RECEIVED = "confirmation_received"
    TICKET_GENERATED = "ticket_generated"
    ESCALATION_TRIGGERED = "escalation_triggered"
    RESOLUTION_COMPLETED = "resolution_completed"
    SENTIMENT_ALERT = "sentiment_alert"
    NOTIFICATION_SENT = "notification_sent"

class NotificationType(str, Enum):
    EMAIL = "email"
    SMS = "sms"

class ConfirmableAction(str, Enum):
    CANCEL_SUBSCRIPTION = "cancel_subscription"
    TRIGGER_REFUND = "trigger_refund"
    ACCOUNT_DELETION = "account_deletion"


# ─────────────────────────────────────────────────────────────
# Core Chat Models
# ─────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    sentiment: Optional["SentimentResult"] = None
    model_used: Optional[str] = None

class CustomerContext(BaseModel):
    customer_id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    plan: Optional[str] = None
    status: Optional[str] = None
    ticket_count: int = 0
    escalation_count: int = 0

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    customer_context: Optional[CustomerContext] = None

class PendingConfirmation(BaseModel):
    action_type: ConfirmableAction
    params: Dict[str, Any] = {}
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    message_preview: str = ""  # What the bot told the user about this action

class ChatResponse(BaseModel):
    reply: str
    intent: str
    message: str
    sentiment: Optional["SentimentResult"] = None
    risk_score: Optional["RiskScore"] = None
    timeline_events: List["TimelineEvent"] = []
    pending_confirmation: Optional[PendingConfirmation] = None
    notifications_sent: List["NotificationRecord"] = []
    rag_sources: List[str] = []
    agent_reasoning: str = ""
    model_used: Optional[str] = None


# ─────────────────────────────────────────────────────────────
# Timeline
# ─────────────────────────────────────────────────────────────

class TimelineEvent(BaseModel):
    event_type: TimelineEventType
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    description: str
    metadata: Dict[str, Any] = {}


# ─────────────────────────────────────────────────────────────
# Audit Logging
# ─────────────────────────────────────────────────────────────

class AuditLogEntry(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now().isoformat())
    customer_id: str
    action: str
    params: Dict[str, Any] = {}
    result: str = ""
    agent_reasoning: str = ""
    session_id: str = ""


# ─────────────────────────────────────────────────────────────
# Sentiment Analysis
# ─────────────────────────────────────────────────────────────

class SentimentResult(BaseModel):
    level: SentimentLevel
    confidence: float = 0.0
    escalation_recommended: bool = False


# ─────────────────────────────────────────────────────────────
# Risk Scoring
# ─────────────────────────────────────────────────────────────

class RiskFactor(BaseModel):
    name: str
    value: float
    weight: float
    contribution: float

class RiskScore(BaseModel):
    level: RiskLevel
    score: float  # 0-100
    factors: List[RiskFactor] = []


# ─────────────────────────────────────────────────────────────
# Notifications
# ─────────────────────────────────────────────────────────────

class NotificationRecord(BaseModel):
    id: str = Field(default_factory=lambda: f"NOTIF-{datetime.now().strftime('%H%M%S')}-{id(object())%1000}")
    type: NotificationType
    recipient: str
    subject: str = ""
    body: str
    sent_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    status: str = "sent"
    customer_id: str = ""


# ─────────────────────────────────────────────────────────────
# Conversation Session (aggregate)
# ─────────────────────────────────────────────────────────────

class ConversationSession(BaseModel):
    session_id: str
    customer_context: Optional[CustomerContext] = None
    messages: List[ChatMessage] = []
    timeline: List[TimelineEvent] = []
    pending_action: Optional[PendingConfirmation] = None
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    sentiment_history: List[SentimentLevel] = []
    is_escalated: bool = False


# ─────────────────────────────────────────────────────────────
# Agent Workflow
# ─────────────────────────────────────────────────────────────

class AgentWorkflowNode(BaseModel):
    id: str
    label: str
    agent_type: str  # intent, rag, support, escalation, audit, confirmation
    status: str = "idle"  # idle, active, completed
    connections: List[str] = []  # ids of connected nodes


# ─────────────────────────────────────────────────────────────
# Analytics
# ─────────────────────────────────────────────────────────────

class AnalyticsDashboardData(BaseModel):
    tickets_created: int = 0
    tickets_resolved: int = 0
    escalations: int = 0
    avg_resolution_time_hours: float = 0.0
    action_success_rate: float = 0.0
    intent_distribution: Dict[str, int] = {}
    sentiment_distribution: Dict[str, int] = {}
    risk_distribution: Dict[str, int] = {}
    notifications_sent: int = 0
    active_sessions: int = 0
