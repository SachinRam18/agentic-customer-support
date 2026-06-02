"""
Notification service for the customer support system.
Mocks sending email and SMS notifications, logging details and tracking history in-memory.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.models import NotificationRecord, NotificationType, CustomerContext

class NotificationService:
    def __init__(self):
        # List of sent notification records
        self.history: List[NotificationRecord] = []

    def send_email(self, to_email: str, subject: str, body: str, customer_id: str = "") -> NotificationRecord:
        """
        Simulate sending an email. Logs to console and stores record.
        """
        record = NotificationRecord(
            type=NotificationType.EMAIL,
            recipient=to_email,
            subject=subject,
            body=body,
            status="sent",
            customer_id=customer_id
        )
        self.history.append(record)
        print(f"\n================ [SEND EMAIL] ================\n"
              f"To: {to_email}\n"
              f"Subject: {subject}\n"
              f"Body:\n{body}\n"
              f"==============================================\n")
        return record

    def send_sms(self, to_phone: str, body: str, customer_id: str = "") -> NotificationRecord:
        """
        Simulate sending an SMS. Logs to console and stores record.
        """
        record = NotificationRecord(
            type=NotificationType.SMS,
            recipient=to_phone,
            subject="",
            body=body,
            status="sent",
            customer_id=customer_id
        )
        self.history.append(record)
        print(f"\n================ [SEND SMS] ================\n"
              f"To: {to_phone}\n"
              f"Body: {body}\n"
              f"============================================\n")
        return record

    def notify_ticket_created(self, customer: CustomerContext, ticket_id: str) -> List[NotificationRecord]:
        """
        Notify customer that a support ticket has been created. Sent via both Email and SMS.
        """
        records = []
        cust_id = customer.customer_id or "unknown"
        email = customer.email or f"{customer.name or 'customer'}@example.com"
        # Mock phone format
        phone = "+1 (555) 019-2831"
        
        email_body = (
            f"Hi {customer.name or 'Valued Customer'},\n\n"
            f"We have opened support ticket #{ticket_id} for your issue. Our human agents have been notified and "
            f"will review the details shortly.\n\n"
            f"Ticket Status: Open\n"
            f"Account Plan: {customer.plan or 'Starter'}\n\n"
            f"Thanks,\n"
            f"CloudBox Enterprise Support"
        )
        records.append(self.send_email(email, f"Support Ticket Created - #{ticket_id}", email_body, cust_id))
        
        sms_body = f"CloudBox Support: Ticket #{ticket_id} created. An agent will review it shortly. Status updates will be sent here."
        records.append(self.send_sms(phone, sms_body, cust_id))
        
        return records

    def notify_refund_approved(self, customer: CustomerContext, amount: float, order_id: str) -> NotificationRecord:
        """
        Notify customer that their refund was approved. Sent via Email.
        """
        cust_id = customer.customer_id or "unknown"
        email = customer.email or f"{customer.name or 'customer'}@example.com"
        
        email_body = (
            f"Hi {customer.name or 'Valued Customer'},\n\n"
            f"Your refund request for transaction {order_id} has been approved.\n\n"
            f"Refund Amount: ${amount:.2f}\n"
            f"Payment Method: Original Card/Account\n"
            f"Processing Time: 3-5 business days\n\n"
            f"We apologize for any inconvenience caused.\n\n"
            f"Thanks,\n"
            f"CloudBox Billing Team"
        )
        return self.send_email(email, f"Refund Approved - Transaction {order_id}", email_body, cust_id)

    def notify_subscription_cancelled(self, customer: CustomerContext) -> NotificationRecord:
        """
        Notify customer of plan cancellation. Sent via Email.
        """
        cust_id = customer.customer_id or "unknown"
        email = customer.email or f"{customer.name or 'customer'}@example.com"
        
        email_body = (
            f"Hi {customer.name or 'Valued Customer'},\n\n"
            f"Your CloudBox subscription ({customer.plan or 'Starter'} Plan) has been successfully cancelled.\n\n"
            f"Your account remains active until the end of your current billing period. "
            f"After that, your account will downgrade to our free tier and storage limits will be applied.\n\n"
            f"We're sad to see you go! If you change your mind, you can re-subscribe at any time from your settings.\n\n"
            f"Thanks,\n"
            f"CloudBox Team"
        )
        return self.send_email(email, "Subscription Cancelled", email_body, cust_id)

    def notify_escalation_created(self, customer: CustomerContext, ticket_id: str) -> List[NotificationRecord]:
        """
        Notify customer of critical escalation. Sent via Email and SMS.
        """
        records = []
        cust_id = customer.customer_id or "unknown"
        email = customer.email or f"{customer.name or 'customer'}@example.com"
        phone = "+1 (555) 019-2831"
        
        email_body = (
            f"Hi {customer.name or 'Valued Customer'},\n\n"
            f"Your support conversation has been escalated to our senior human agent team due to the complexity/urgency. "
            f"We have associated this session with Ticket #{ticket_id}.\n\n"
            f"We will review this and contact you immediately to assist.\n\n"
            f"Thanks,\n"
            f"CloudBox Priority Escalation Desk"
        )
        records.append(self.send_email(email, f"URGENT: Conversation Escalated - Ticket #{ticket_id}", email_body, cust_id))
        
        sms_body = f"CloudBox Support: Your session has been escalated to priority support. Ticket #{ticket_id} opened. An agent will call/chat shortly."
        records.append(self.send_sms(phone, sms_body, cust_id))
        
        return records

    def get_notification_history(self, customer_id: Optional[str] = None) -> List[NotificationRecord]:
        if customer_id:
            return [n for n in self.history if n.customer_id == customer_id]
        return self.history

# Singleton instance
notification_service = NotificationService()
