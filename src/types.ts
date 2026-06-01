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
