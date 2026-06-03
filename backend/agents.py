"""
Multi-agent architecture and orchestrator for the customer support system.
Implements specialized agents and coordinates their execution workflow.
"""

from typing import Dict, List, Any, Optional, Tuple
import uuid
from backend.models import (
    ChatRequest,
    ChatResponse,
    CustomerContext,
    ChatMessage,
    SentimentResult,
    RiskScore,
    TimelineEvent,
    TimelineEventType,
    PendingConfirmation,
    ConfirmableAction,
    AgentWorkflowNode,
    NotificationRecord,
)
from backend.memory import memory_store
from backend.audit import audit_logger
from backend.sentiment import analyze_sentiment_gemini, analyze_sentiment_local, should_auto_escalate
from backend.risk import calculate_risk_score
from backend.security import security_guard
from backend.notifications import notification_service
from backend.rag import policy_rag
import logging

logger = logging.getLogger("uvicorn.error")

class IntentAgent:
    """
    Agent responsible for classifying user intent.
    """
    def process(self, message: str, client: Any) -> Tuple[str, str]:
        """
        Classifies intent and returns (intent_name, reasoning).
        """
        # We'll use the existing classification logic from main.py, but wrapped in agent style.
        from backend.main import classify_intent, classify_intent_local_fallback
        
        reasoning = "Analyzing input tokens to match customer intent rules."
        try:
            intent = classify_intent(message)
            reasoning = f"Gemini classified intent as: {intent} based on semantic mapping."
        except Exception as e:
            logger.error(f"Gemini intent classification failed: {e}. Falling back to local rules.", exc_info=True)
            print(f"Gemini intent classification failed: {e}. Falling back to local rules.", flush=True)
            intent = classify_intent_local_fallback(message)
            reasoning = f"Local heuristic fallback matched keywords to intent: {intent}"
            
        return intent, reasoning


class SupportAgent:
    """
    Agent responsible for generating contextual support replies using RAG context and memory.
    """
    def process(
        self,
        message: str,
        intent: str,
        session_id: str,
        rag_context: str,
        client: Any,
        customer_context: Optional[CustomerContext]
    ) -> Tuple[str, str]:
        """
        Generates bot reply and returns (reply_text, reasoning).
        """
        # If Gemini client is not available or errors out, use the local response generator
        from backend.main import generate_reply_local_fallback
        
        session = memory_store.get_or_create_session(session_id)
        
        system_instruction = (
            "You are Cloudbot, a premium virtual customer support agent for CloudBox.\n"
            "CloudBox details:\n"
            "- Security: client-side End-to-End Encryption (E2EE) with AES-256 standards.\n"
            "- Tiers: Starter ($199/mo, 100 GB), Professional ($499/mo, 1 TB), Enterprise ($999/mo, Unlimited space).\n"
            "- Features: high-speed sync, team workspaces, sharing controls.\n"
            "Style: Be professional, polite, concise, and helpful.\n"
        )
        
        # Build memory history context
        history_context = ""
        # Get last 6 messages for prompt context window
        recent_messages = session.messages[-6:]
        if recent_messages:
            history_context = "Recent Conversation History:\n"
            for msg in recent_messages:
                history_context += f"- {msg.role}: {msg.content}\n"
                
        customer_info = ""
        if customer_context:
            customer_info = (
                f"Customer Context:\n"
                f"- Name: {customer_context.name}\n"
                f"- Plan: {customer_context.plan}\n"
                f"- Status: {customer_context.status}\n"
            )

        prompt = f"""
{system_instruction}

{customer_info}
{history_context}
{rag_context}

The user's detected intent is: {intent}
User message: "{message}"

Generate a helpful support reply. Do not mention system details, RAG, or internal context. Just reply directly to the customer.
"""
        
        try:
            from google.genai import types
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
                config=types.GenerateContentConfig(
                    max_output_tokens=500,
                    temperature=0.6
                )
            )
            reply = response.text.strip()
            reasoning = "Generated response using Gemini with relevant RAG context and conversation history."
        except Exception as e:
            logger.error(f"Gemini reply generation failed: {e}. Falling back to local template.", exc_info=True)
            print(f"Gemini reply generation failed: {e}. Falling back to local template.", flush=True)
            reply = generate_reply_local_fallback(intent, message)
            reasoning = f"Generated template response using local heuristics for intent: {intent}"
            
        return reply, reasoning


class EscalationAgent:
    """
    Agent responsible for handling auto-escalations and ticket creations.
    """
    def process(
        self,
        session_id: str,
        customer_context: Optional[CustomerContext],
        explicit_request: bool = False,
        reason: str = ""
    ) -> Tuple[bool, str, List[NotificationRecord], str]:
        """
        Escalates session if required.
        Returns (is_escalated, ticket_id, sent_notifications, reasoning).
        """
        session = memory_store.get_or_create_session(session_id)
        
        if session.is_escalated:
            return True, f"TKT-{session_id[:6].upper()}", [], "Already escalated in a previous turn."
            
        # Perform escalation
        session.is_escalated = True
        ticket_id = f"TKT-{str(uuid.uuid4())[:8].upper()}"
        
        # Log timeline event
        memory_store.add_timeline_event(
            session_id,
            TimelineEventType.ESCALATION_TRIGGERED,
            f"Escalated to human support: {reason}",
            {"ticket_id": ticket_id, "reason": reason}
        )
        
        # Send notifications
        notifications = []
        if customer_context:
            notifications = notification_service.notify_escalation_created(customer_context, ticket_id)
            for notif in notifications:
                memory_store.add_timeline_event(
                    session_id,
                    TimelineEventType.NOTIFICATION_SENT,
                    f"Sent {notif.type.value} notification to customer",
                    {"recipient": notif.recipient, "notif_id": notif.id}
                )
                
        reasoning = f"Escalated session to human team. Generated ticket #{ticket_id}. Reason: {reason}"
        return True, ticket_id, notifications, reasoning


class AuditAgent:
    """
    Agent responsible for logging actions and maintaining the audit trail.
    """
    def process(
        self,
        customer_id: str,
        action: str,
        params: Dict[str, Any],
        result: str,
        reasoning: str,
        session_id: str
    ) -> str:
        entry = audit_logger.log_action(
            customer_id=customer_id,
            action=action,
            params=params,
            result=result,
            reasoning=reasoning,
            session_id=session_id
        )
        return f"Logged action '{action}' to audit trail (Log ID: {entry.timestamp})."


class AgentOrchestrator:
    """
    Orchestrates the multi-agent execution pipeline.
    """
    def __init__(self, client: Any):
        self.client = client
        self.intent_agent = IntentAgent()
        self.support_agent = SupportAgent()
        self.escalation_agent = EscalationAgent()
        self.audit_agent = AuditAgent()

    def process(self, request: ChatRequest) -> ChatResponse:
        session_id = request.session_id
        message = request.message
        cust_context = request.customer_context or CustomerContext()
        customer_id = cust_context.customer_id or "unknown"
        
        # Initialize session & append user message
        session = memory_store.get_or_create_session(session_id, cust_context)
        user_msg = memory_store.add_message(session_id, "user", message)
        
        # Analyze Sentiment of user message
        try:
            sentiment_res = analyze_sentiment_gemini(message, self.client)
        except Exception:
            sentiment_res = analyze_sentiment_local(message)
        user_msg.sentiment = sentiment_res
        session.sentiment_history.append(sentiment_res.level)
        
        # If sentiment triggers alert, log timeline event
        if sentiment_res.level == "negative":
            memory_store.add_timeline_event(
                session_id,
                TimelineEventType.SENTIMENT_ALERT,
                f"Negative customer sentiment detected: {sentiment_res.confidence:.1%} confidence",
                {"message": message, "escalation_recommended": sentiment_res.escalation_recommended}
            )

        # ─────────────────────────────────────────────────────────────
        # Initialize Agent Workflow Nodes for UI Visualization
        # ─────────────────────────────────────────────────────────────
        nodes = [
            AgentWorkflowNode(id="intent", label="Intent Classifier", agent_type="intent", status="idle", connections=["rag"]),
            AgentWorkflowNode(id="rag", label="RAG Knowledge Retrieval", agent_type="rag", status="idle", connections=["orchestrator"]),
            AgentWorkflowNode(id="orchestrator", label="Routing Orchestrator", agent_type="support", status="idle", connections=["confirmation", "escalation", "support"]),
            AgentWorkflowNode(id="confirmation", label="Confirmation Guard", agent_type="confirmation", status="idle", connections=["tool_execution"]),
            AgentWorkflowNode(id="tool_execution", label="Tool Execution Engine", agent_type="support", status="idle", connections=["audit"]),
            AgentWorkflowNode(id="escalation", label="Escalation Specialist", agent_type="escalation", status="idle", connections=["audit"]),
            AgentWorkflowNode(id="support", label="Support Core Agent", agent_type="support", status="idle", connections=["audit"]),
            AgentWorkflowNode(id="audit", label="Audit Logs Officer", agent_type="audit", status="idle", connections=[])
        ]
        
        def update_node(node_id: str, status: str):
            for node in nodes:
                if node.id == node_id:
                    node.status = status

        # Start Execution Workflow
        # Node: Intent Classification
        update_node("intent", "active")
        intent, intent_reasoning = self.intent_agent.process(message, self.client)
        update_node("intent", "completed")
        
        # Log intent detected on timeline
        memory_store.add_timeline_event(
            session_id,
            TimelineEventType.INTENT_DETECTED,
            f"Intent classified as '{intent}'",
            {"intent": intent, "reasoning": intent_reasoning}
        )

        # Node: RAG Retrieval
        update_node("rag", "active")
        rag_context, rag_sources = policy_rag.get_rag_context(message)
        if rag_sources:
            memory_store.add_timeline_event(
                session_id,
                TimelineEventType.RAG_RETRIEVAL,
                f"Retrieved {len(rag_sources)} matching policy documents",
                {"sources": rag_sources}
            )
        update_node("rag", "completed")
        
        update_node("orchestrator", "active")
        
        # Risk Evaluation
        risk_score = calculate_risk_score(customer_id, cust_context, session.messages)
        
        # ─────────────────────────────────────────────────────────────
        # Handle Pending Confirmations or Confirm/Cancel triggers
        # ─────────────────────────────────────────────────────────────
        pending_conf = session.pending_action
        
        # Default empty outputs
        reply = ""
        agent_reasoning = intent_reasoning
        notifications_sent = []
        model_used = "System Rule Engine"
        
        # Check if user is responding to a confirmation prompt
        cleaned_msg = message.strip().lower()
        is_confirm = cleaned_msg in ["yes", "y", "confirm", "sure", "indeed", "please do", "do it"]
        is_cancel = cleaned_msg in ["no", "n", "cancel", "stop", "abort", "don't", "dont", "no way"]
        
        if pending_conf and (is_confirm or is_cancel):
            update_node("confirmation", "active")
            action = pending_conf.action_type
            params = pending_conf.params
            
            if is_confirm:
                # User confirmed! Execute the action
                memory_store.add_timeline_event(
                    session_id,
                    TimelineEventType.CONFIRMATION_RECEIVED,
                    f"Customer confirmed action: {action.value}",
                    {"action": action.value}
                )
                
                # Check security controls before execution
                allowed, security_err = security_guard.validate_action_allowed(customer_id, action.value, session_id)
                if not allowed:
                    reply = f"⚠️ Security Alert: We could not process your request. Reason: {security_err}"
                    self.audit_agent.process(
                        customer_id=customer_id,
                        action=action.value,
                        params=params,
                        result="security_blocked",
                        reasoning=f"Block action due to security rules: {security_err}",
                        session_id=session_id
                    )
                    memory_store.clear_pending_action(session_id)
                else:
                    # Action execution logic
                    result_msg = ""
                    if action == ConfirmableAction.CANCEL_SUBSCRIPTION:
                        # Perform subscription cancellation mock
                        result_msg = "subscription cancelled successfully"
                        notif = notification_service.notify_subscription_cancelled(cust_context)
                        notifications_sent.append(notif)
                    elif action == ConfirmableAction.TRIGGER_REFUND:
                        # Perform refund mock
                        amount = params.get("amount", 199.0)
                        order_id = params.get("order_id", "ORD1002")
                        result_msg = f"refund of ${amount:.2f} approved for order {order_id}"
                        notif = notification_service.notify_refund_approved(cust_context, amount, order_id)
                        notifications_sent.append(notif)
                    elif action == ConfirmableAction.ACCOUNT_DELETION:
                        # Perform account deletion mock
                        result_msg = "account deleted and data purge scheduled"
                        
                    # Log notifications
                    for notif in notifications_sent:
                        memory_store.add_timeline_event(
                            session_id,
                            TimelineEventType.NOTIFICATION_SENT,
                            f"Sent {notif.type.value} notification to customer",
                            {"recipient": notif.recipient, "notif_id": notif.id}
                        )
                        
                    # Execute tool in dashboard
                    memory_store.add_timeline_event(
                        session_id,
                        TimelineEventType.TOOL_CALLED,
                        f"Executed action '{action.value}'",
                        {"params": params, "result": result_msg}
                    )
                    
                    # Record destructive action timestamp for security
                    security_guard.record_destructive_action(session_id)
                    
                    # Audit execution
                    self.audit_agent.process(
                        customer_id=customer_id,
                        action=action.value,
                        params=params,
                        result="success",
                        reasoning=f"Customer confirmed action via multi-turn chat.",
                        session_id=session_id
                    )
                    
                    # Clear pending actions
                    memory_store.clear_pending_action(session_id)
                    
                    # Generate confirmation message
                    reply = f"Thank you. I have successfully processed your request to {action.value.replace('_', ' ')}. "
                    if action == ConfirmableAction.CANCEL_SUBSCRIPTION:
                        reply += "A confirmation email has been sent. Your premium benefits will continue until the end of the billing period."
                    elif action == ConfirmableAction.TRIGGER_REFUND:
                        reply += "The refund will be credited back to your original payment method in 5-7 business days."
                    elif action == ConfirmableAction.ACCOUNT_DELETION:
                        reply += "We will purge all your storage volumes in 30 days under the Right to be Forgotten guidelines."
                
                update_node("tool_execution", "completed")
            else:
                # User cancelled the action!
                memory_store.add_timeline_event(
                    session_id,
                    TimelineEventType.CONFIRMATION_RECEIVED,
                    f"Customer cancelled action: {action.value}",
                    {"action": action.value}
                )
                self.audit_agent.process(
                    customer_id=customer_id,
                    action=action.value,
                    params=params,
                    result="user_cancelled",
                    reasoning="Customer declined confirmation prompt.",
                    session_id=session_id
                )
                memory_store.clear_pending_action(session_id)
                reply = f"Okay, I have cancelled the {action.value.replace('_', ' ')} request. No changes have been made to your account."
                
            update_node("confirmation", "completed")
            update_node("orchestrator", "completed")
            update_node("audit", "active")
            update_node("audit", "completed")
            
            # Save assistant response to memory
            memory_store.add_message(session_id, "assistant", reply, model_used=model_used)
            
            return ChatResponse(
                reply=reply,
                intent=intent,
                message=message,
                sentiment=sentiment_res,
                risk_score=risk_score,
                timeline_events=session.timeline,
                pending_confirmation=None,
                notifications_sent=notifications_sent,
                rag_sources=rag_sources,
                agent_reasoning=f"Processed confirmation input. User confirmed={is_confirm}",
                model_used=model_used
            )

        # ─────────────────────────────────────────────────────────────
        # Process regular intents
        # ─────────────────────────────────────────────────────────────
        
        # Check if the intent requires confirmation (destructive actions)
        if security_guard.require_confirmation(intent):
            update_node("confirmation", "active")
            action_type = ConfirmableAction(intent)
            
            # Pre-populate params based on current user context / defaults
            params = {}
            if action_type == ConfirmableAction.TRIGGER_REFUND:
                params = {"amount": 199.0, "order_id": "ORD1002"}
            elif action_type == ConfirmableAction.CANCEL_SUBSCRIPTION:
                params = {"plan": cust_context.plan or "Starter"}
            elif action_type == ConfirmableAction.ACCOUNT_DELETION:
                params = {"email": cust_context.email or ""}
                
            message_preview = f"You are requesting to {intent.replace('_', ' ')}. This action is destructive/billing-critical."
            
            pending = memory_store.set_pending_action(session_id, action_type, params, message_preview)
            
            reply = f"⚠️ To complete this request, please confirm you would like to proceed with **{intent.replace('_', ' ')}**. Reply YES to confirm or NO to cancel."
            
            update_node("confirmation", "completed")
            update_node("orchestrator", "completed")
            update_node("audit", "active")
            update_node("audit", "completed")
            
            memory_store.add_message(session_id, "assistant", reply, model_used=model_used)
            
            return ChatResponse(
                reply=reply,
                intent=intent,
                message=message,
                sentiment=sentiment_res,
                risk_score=risk_score,
                timeline_events=session.timeline,
                pending_confirmation=pending,
                notifications_sent=[],
                rag_sources=rag_sources,
                agent_reasoning=f"Destructive action detected. Created pending confirmation for {action_type}.",
                model_used=model_used
            )

        # Check for auto-escalation or explicit escalation
        is_escalation_needed = (intent == "escalate_ticket") or should_auto_escalate(session.messages)
        
        if is_escalation_needed:
            update_node("escalation", "active")
            reason = "Customer explicitly requested a human specialist" if intent == "escalate_ticket" else "Negative sentiment trend threshold exceeded"
            
            escalated, ticket_id, notifs, esc_reasoning = self.escalation_agent.process(
                session_id=session_id,
                customer_context=cust_context,
                explicit_request=(intent == "escalate_ticket"),
                reason=reason
            )
            notifications_sent.extend(notifs)
            agent_reasoning += " | " + esc_reasoning
            
            # Generate support reply stating we are transferring
            reply = (
                f"🎟️ I have escalated this conversation and opened support ticket **#{ticket_id}** for you.\n\n"
                f"A human agent on our priority support team has been notified. "
                f"Email and SMS alerts have been sent to you. We'll chat here shortly!"
            )
            update_node("escalation", "completed")
        else:
            # Regular support interaction
            update_node("support", "active")
            reply, support_reasoning = self.support_agent.process(
                message=message,
                intent=intent,
                session_id=session_id,
                rag_context=rag_context,
                client=self.client,
                customer_context=cust_context
            )
            agent_reasoning += " | " + support_reasoning
            update_node("support", "completed")
            if "Gemini" in support_reasoning:
                model_used = "Gemini 2.5 Flash"
            else:
                model_used = "Local Fallback Template"

        update_node("orchestrator", "completed")
        
        # Save assistant reply to memory
        memory_store.add_message(session_id, "assistant", reply, model_used=model_used)

        # Node: Audit logging
        update_node("audit", "active")
        self.audit_agent.process(
            customer_id=customer_id,
            action="chat_message",
            params={"message": message, "intent": intent},
            result="success",
            reasoning=agent_reasoning,
            session_id=session_id
        )
        update_node("audit", "completed")
        
        # Render the response
        return ChatResponse(
            reply=reply,
            intent=intent,
            message=message,
            sentiment=sentiment_res,
            risk_score=risk_score,
            timeline_events=session.timeline,
            pending_confirmation=session.pending_action,
            notifications_sent=notifications_sent,
            rag_sources=rag_sources,
            agent_reasoning=agent_reasoning,
            model_used=model_used
        )
