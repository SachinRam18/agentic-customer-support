export enum SubscriptionPlan {
  STARTER = "Starter",
  PROFESSIONAL = "Professional",
  ENTERPRISE = "Enterprise",
}

export enum SubscriptionStatus {
  ACTIVE = "Active",
  PAST_DUE = "Past Due",
  CANCELED = "Canceled",
}

export interface Customer {
  id: string; // e.g., CUST101
  name: string;
  email: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  joinedDate: string;
  avatarUrl?: string;
}

export interface Order {
  id: string; // e.g., ORD1001
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  planType: SubscriptionPlan;
  status: "Paid" | "Refunded" | "Pending" | "Failed";
}

export interface Invoice {
  id: string; // e.g., INV-2026-001
  customerId: string;
  customerName: string;
  orderId: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "Paid" | "Overdue" | "Unpaid";
  downloadUrl?: string;
}

export interface Ticket {
  id: string; // e.g., TKT-1081
  customerId: string;
  customerName: string;
  subject: string;
  category: "Billing" | "Subscription" | "Refunds" | "Account Management" | "Technical Issues";
  status: "Open" | "In Progress" | "Resolved";
  priority: "Low" | "Medium" | "High" | "Urgent";
  createdDate: string;
  lastUpdatedDate: string;
  messages: {
    sender: "customer" | "ai-agent" | "human-agent";
    text: string;
    timestamp: string;
  }[];
}

export interface FAQItem {
  id: string;
  category: "Billing" | "Subscription" | "Refunds" | "Account Management" | "Technical Issues";
  question: string;
  answer: string;
}

export interface SupportPolicy {
  id: string;
  section: string;
  title: string;
  content: string[];
}

export interface SentimentResult {
  level: "positive" | "neutral" | "negative";
  confidence: number;
  escalation_recommended: boolean;
}

export interface RiskFactor {
  name: string;
  value: number;
  weight: number;
  contribution: number;
}

export interface RiskScore {
  level: "low" | "medium" | "high";
  score: number;
  factors: RiskFactor[];
}

export interface TimelineEvent {
  event_type: string;
  timestamp: string;
  description: string;
  metadata: Record<string, any>;
}

export interface PendingConfirmation {
  action_type: "cancel_subscription" | "trigger_refund" | "account_deletion";
  params: Record<string, any>;
  created_at: string;
  message_preview: string;
}

export interface NotificationRecord {
  id: string;
  type: "email" | "sms";
  recipient: string;
  subject: string;
  body: string;
  sent_at: string;
  status: string;
  customer_id: string;
}

export interface AuditLogEntry {
  timestamp: string;
  customer_id: string;
  action: string;
  params: Record<string, any>;
  result: string;
  agent_reasoning: string;
  session_id: string;
}

export interface AgentWorkflowNode {
  id: string;
  label: string;
  agent_type: "intent" | "rag" | "support" | "escalation" | "audit" | "confirmation";
  status: "idle" | "active" | "completed";
  connections: string[];
}

export interface AnalyticsDashboardData {
  tickets_created: number;
  tickets_resolved: number;
  escalations: number;
  avg_resolution_time_hours: number;
  action_success_rate: number;
  intent_distribution: Record<string, number>;
  sentiment_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  notifications_sent: number;
  active_sessions: number;
}

