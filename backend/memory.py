"""
Conversation memory store for the agentic customer support system.
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
from backend.models import (
    ConversationSession,
    ChatMessage,
    TimelineEvent,
    TimelineEventType,
    PendingConfirmation,
    ConfirmableAction,
    CustomerContext,
)

class ConversationMemory:
    def __init__(self):
        # Maps session_id to ConversationSession
        self.sessions: Dict[str, ConversationSession] = {}

    def get_or_create_session(
        self, session_id: str, customer_context: Optional[CustomerContext] = None
    ) -> ConversationSession:
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationSession(
                session_id=session_id,
                customer_context=customer_context,
                messages=[],
                timeline=[
                    TimelineEvent(
                        event_type=TimelineEventType.CHAT_STARTED,
                        description="Chat session started",
                        metadata={}
                    )
                ],
                pending_action=None,
                sentiment_history=[],
                is_escalated=False
            )
        elif customer_context is not None:
            # Update customer context if it was passed and different
            self.sessions[session_id].customer_context = customer_context
            
        return self.sessions[session_id]

    def add_message(self, session_id: str, role: str, content: str) -> ChatMessage:
        session = self.get_or_create_session(session_id)
        msg = ChatMessage(role=role, content=content)
        session.messages.append(msg)
        return msg

    def get_context_window(self, session_id: str, max_turns: int = 10) -> List[ChatMessage]:
        session = self.get_or_create_session(session_id)
        # 1 turn usually consists of 1 user message and 1 assistant response.
        # We take the last max_turns * 2 messages.
        return session.messages[-(max_turns * 2):]

    def set_pending_action(
        self, session_id: str, action_type: ConfirmableAction, params: Dict[str, Any], message_preview: str = ""
    ) -> PendingConfirmation:
        session = self.get_or_create_session(session_id)
        pending = PendingConfirmation(
            action_type=action_type,
            params=params,
            message_preview=message_preview
        )
        session.pending_action = pending
        
        # Add a timeline event
        self.add_timeline_event(
            session_id,
            TimelineEventType.CONFIRMATION_REQUESTED,
            f"Requested confirmation for {action_type.value}",
            {"action_type": action_type.value, "params": params}
        )
        return pending

    def clear_pending_action(self, session_id: str) -> None:
        session = self.get_or_create_session(session_id)
        session.pending_action = None

    def add_timeline_event(
        self, session_id: str, event_type: TimelineEventType, description: str, metadata: Dict[str, Any] = {}
    ) -> TimelineEvent:
        session = self.get_or_create_session(session_id)
        event = TimelineEvent(
            event_type=event_type,
            description=description,
            metadata=metadata
        )
        session.timeline.append(event)
        return event

    def get_timeline(self, session_id: str) -> List[TimelineEvent]:
        session = self.get_or_create_session(session_id)
        return session.timeline

    def clear_session(self, session_id: str) -> None:
        if session_id in self.sessions:
            del self.sessions[session_id]

# Singleton instance
memory_store = ConversationMemory()
