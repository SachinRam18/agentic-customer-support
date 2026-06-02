import React, { useState, useMemo } from "react";
import { Customer, Order, Invoice, Ticket, SubscriptionPlan, SubscriptionStatus } from "../types";
import { 
  Users, 
  CreditCard, 
  RotateCcw, 
  UserX, 
  Activity,
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  RefreshCw,
  Search,
  Shield,
  FileSpreadsheet,
  Mail,
  UserCheck,
  TrendingUp,
  Tag
} from "lucide-react";
import AnalyticsDashboardView from "./AnalyticsDashboardView";
import HumanAgentDashboardView from "./HumanAgentDashboardView";
import AuditLogView from "./AuditLogView";
import WorkflowVisualization from "./WorkflowVisualization";


interface DashboardViewProps {
  customers: Customer[];
  orders: Order[];
  invoices: Invoice[];
  tickets: Ticket[];
  onUpdateCustomerEmail: (id: string, email: string) => void;
  onCancelSubscription: (id: string) => void;
  onTriggerRefund: (customerId: string, orderId: string) => void;
  onResetDatabase: () => void;
  onAddTicketMessage: (ticketId: string, text: string, sender: "human-agent") => void;
}

export default function DashboardView({
  customers,
  orders,
  invoices,
  tickets,
  onUpdateCustomerEmail,
  onCancelSubscription,
  onTriggerRefund,
  onResetDatabase,
  onAddTicketMessage
}: DashboardViewProps) {
  
  const [activeTab, setActiveTab] = useState<
    "crm-customers" | "crm-orders" | "crm-invoices" | "crm-tickets" | "crm-logs" | 
    "crm-analytics" | "crm-agent" | "crm-audit" | "crm-workflow"
  >("crm-customers");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempEmail, setTempEmail] = useState("");

  // Staff audit logs
  const [auditLogs, setAuditLogs] = useState<Array<{ time: string; msg: string; actor: string }>>([
    { time: "10:15:22", msg: "Initialized system CRM database", actor: "System Agent" },
    { time: "10:20:01", msg: "Verified active E2EE AES-256 cloud encryption key buffers", actor: "Security Daemon" }
  ]);

  const pushLog = (msg: string) => {
    const timeStr = new Date().toTimeString().split(" ")[0];
    setAuditLogs(prev => [{ time: timeStr, msg, actor: "CRM Executive" }, ...prev]);
  };

  const handleEmailSave = (id: string, name: string) => {
    if (!tempEmail || !tempEmail.includes("@")) {
      alert("Please specify a valid contact email layout.");
      return;
    }
    onUpdateCustomerEmail(id, tempEmail);
    pushLog(`Modified contact address for customer ${name} (${id}) to: '${tempEmail}'`);
    setEditingId(null);
  };

  const handleCancelPlan = (id: string, name: string) => {
    if (confirm(`Do you wish to force termination on customer ${name} (${id})'s active subscription renewal?`)) {
      onCancelSubscription(id);
      pushLog(`Canceled active subscription plan for customer ${name} (${id})`);
    }
  };

  const handleRefundClick = (customerId: string, orderId: string, name: string, amount: number) => {
    if (confirm(`Confirm refund of ₹${amount} corresponding to order ${orderId} for customer ${name}?`)) {
      onTriggerRefund(customerId, orderId);
      pushLog(`Initiated refund processing of ₹${amount} for order ${orderId} (${name})`);
    }
  };

  const processedCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  // Total MRR calculation
  const totalMRR = useMemo(() => {
    return customers.reduce((sum, c) => {
      if (c.status !== SubscriptionStatus.ACTIVE) return sum;
      if (c.plan === SubscriptionPlan.STARTER) return sum + 199;
      if (c.plan === SubscriptionPlan.PROFESSIONAL) return sum + 499;
      return sum + 999;
    }, 0);
  }, [customers]);

  return (
    <div className="bg-slate-50/70 min-h-screen py-10 sm:py-12 font-sans animate-fade-in" id="crm-dashboard-root">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Modern CRM Header */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-widest font-sans">
              <Shield className="h-4 w-4" />
              <span>Staff Administrative Console</span>
            </div>
            <h1 className="font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              CloudBox Operational CRM
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm max-w-2xl">
              Internal directory tools to analyze subscription quotas, initiate transaction refunds, resolve technical tickets, and review audit records cleanly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                onResetDatabase();
                pushLog("Reset entire CRM environment to default configuration.");
              }}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 px-4 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-slate-500" />
              <span>Reset Environment</span>
            </button>
          </div>
        </div>

        {/* Analytics bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                Active Subscribers
              </span>
              <div className="text-xl font-black text-slate-950 font-sans mt-0.5">
                {customers.filter(c => c.status === SubscriptionStatus.ACTIVE).length} / {customers.length} Accounts
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                Monthly Recurring Revenue
              </span>
              <div className="text-xl font-black text-slate-950 font-sans mt-0.5">
                ₹{totalMRR.toLocaleString()} MRR
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle className="h-6 w-6 text-rose-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                Active Ticket Backlog
              </span>
              <div className="text-xl font-black text-slate-950 font-sans mt-0.5">
                {tickets.filter(t => t.status !== "Resolved").length} Open Complaints
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">
                CRM Status Integrity
              </span>
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 mt-1 font-sans">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span>Operational (SLA Secured)</span>
              </div>
            </div>
          </div>

        </div>

        {/* Categories Tab Selector */}
        <div className="flex border-b border-slate-200 mb-6 overflow-x-auto space-x-1 pl-1">
          {[
            { id: "crm-customers", label: "Subscriber Directory", count: customers.length },
            { id: "crm-orders", label: "Transaction Orders", count: orders.length },
            { id: "crm-invoices", label: "Tax Invoices", count: invoices.length },
            { id: "crm-tickets", label: "Complaint Queue", count: tickets.length },
            { id: "crm-logs", label: "Internal Audit Logs", count: auditLogs.length },
            { id: "crm-analytics", label: "Support Analytics" },
            { id: "crm-agent", label: "Human Agent Workspace" },
            { id: "crm-audit", label: "Agent Audit Trail" },
            { id: "crm-workflow", label: "Agent Workflow Graph" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchTerm("");
              }}
              className={`pb-3.5 px-4 font-semibold text-sm tracking-tight border-b-2 whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-700"
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold font-mono px-2 py-0.5">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Global Directory Search Bar */}
        {activeTab === "crm-customers" && (
          <div className="relative mb-6">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user profiles by name, unique ID, or contact email address..."
              className="w-full pl-10 pr-4 py-3 border border-slate-250 bg-white rounded-2xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-750 font-medium"
            />
          </div>
        )}

        {/* Tables Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          
          {/* SubTab 1: CUSTOMERS */}
          {activeTab === "crm-customers" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs sm:text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-150">
                  <tr>
                    <th className="py-4 px-6">Customer Block</th>
                    <th className="py-4 px-6">Locker Contact Address</th>
                    <th className="py-4 px-6 font-sans">Active Tier</th>
                    <th className="py-4 px-6">Status State</th>
                    <th className="py-4 px-6">Timestamp Joined</th>
                    <th className="py-4 px-6 text-right">Operational Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {processedCustomers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/20 transition-all font-sans">
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3 font-sans">
                          <img 
                            src={c.avatarUrl} 
                            alt={c.name} 
                            className="h-10 w-10 rounded-full bg-slate-100 ring-2 ring-slate-100 object-cover shrink-0" 
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block leading-none">{c.name}</span>
                            <span className="font-mono text-[10px] text-slate-450 block mt-1 font-semibold">{c.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4.5 px-6">
                        {editingId === c.id ? (
                          <div className="flex items-center gap-1.5 font-sans">
                            <input
                              type="email"
                              value={tempEmail}
                              onChange={(e) => setTempEmail(e.target.value)}
                              className="border rounded-lg text-xs px-2 py-1 focus:border-indigo-500 text-slate-800 outline-none"
                            />
                            <button
                              onClick={() => handleEmailSave(c.id, c.name)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] p-1.5 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold text-[10px] p-1.5 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-650">{c.email}</span>
                            <button
                              onClick={() => {
                                setEditingId(c.id);
                                setTempEmail(c.email);
                              }}
                              className="text-indigo-600 leading-none text-[10px] font-bold hover:underline"
                            >
                              (Edit)
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="py-4.5 px-6 font-semibold text-slate-800 font-sans">
                        {c.plan}
                      </td>

                      <td className="py-4.5 px-6">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide border ${
                          c.status === SubscriptionStatus.ACTIVE 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                            : "bg-rose-50 text-rose-800 border-rose-100"
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="py-4.5 px-6 font-mono text-slate-400">
                        {c.joinedDate}
                      </td>

                      <td className="py-4.5 px-6 text-right">
                        {c.status !== SubscriptionStatus.CANCELED ? (
                          <button
                            onClick={() => handleCancelPlan(c.id, c.name)}
                            className="inline-flex items-center gap-1 hover:bg-rose-50 p-1.5 rounded-lg text-xs font-bold text-rose-700 transition-colors border border-transparent hover:border-rose-100 cursor-pointer"
                          >
                            <UserX className="h-4 w-4" />
                            <span>Terminate Plan</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs font-semibold italic">Terminated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {processedCustomers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 italic font-sans text-xs">
                        No clients detected with search query terms.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* SubTab 2: ORDERS */}
          {activeTab === "crm-orders" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs sm:text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-150">
                  <tr>
                    <th className="py-4 px-6">Order ID</th>
                    <th className="py-4 px-6">Customer Profile</th>
                    <th className="py-4 px-6">Subscription Tier</th>
                    <th className="py-4 px-6">Cleared Date</th>
                    <th className="py-4 px-6">Billed Amount</th>
                    <th className="py-4 px-6">Tax Status</th>
                    <th className="py-4 px-6 text-right">CRM Interventions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/20 font-sans">
                      <td className="py-4.5 px-6 font-mono font-bold text-slate-900">{o.id}</td>
                      <td className="py-4.5 px-6 font-bold text-slate-850">{o.customerName}</td>
                      <td className="py-4.5 px-6 font-semibold text-slate-600">{o.planType}</td>
                      <td className="py-4.5 px-6 font-mono text-slate-400">{o.date}</td>
                      <td className="py-4.5 px-6 font-mono font-extrabold text-slate-900">₹{o.amount}</td>
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9.5px] font-bold border border-transparent ${
                          o.status === "Paid" 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-100" 
                            : "bg-rose-50 text-rose-800 border-rose-100"
                        }`}>
                          {o.status === "Paid" ? "Cleared" : "Refunded"}
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        {o.status === "Paid" ? (
                          <button
                            onClick={() => handleRefundClick(o.customerId, o.id, o.customerName, o.amount)}
                            className="inline-flex items-center gap-1 hover:bg-amber-50 p-1.5 rounded-lg text-xs font-bold text-amber-700 transition-colors border border-transparent hover:border-amber-100 cursor-pointer"
                          >
                            <RotateCcw className="h-4 w-4" />
                            <span>Authorize Refund</span>
                          </button>
                        ) : (
                          <span className="text-slate-450 text-xs italic font-semibold">Refund Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SubTab 3: INVOICES */}
          {activeTab === "crm-invoices" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs sm:text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-150">
                  <tr>
                    <th className="py-4 px-6">Invoice ID</th>
                    <th className="py-4 px-6">Billing Customer</th>
                    <th className="py-4 px-6">Related Order</th>
                    <th className="py-4 px-6">Issued Timestamp</th>
                    <th className="py-4 px-6">Terms Due Date</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Clearing status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/20 font-sans">
                      <td className="py-4.5 px-6 font-mono font-bold text-slate-900">{inv.id}</td>
                      <td className="py-4.5 px-6 font-bold text-slate-850">{inv.customerName}</td>
                      <td className="py-4.5 px-6 font-mono text-slate-450">{inv.orderId}</td>
                      <td className="py-4.5 px-6 font-mono text-slate-400">{inv.date}</td>
                      <td className="py-4.5 px-6 font-mono text-slate-400">{inv.dueDate}</td>
                      <td className="py-4.5 px-6 font-mono font-extrabold text-slate-900">₹{inv.amount}</td>
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex rounded px-2 py-0.5 text-[9.5px] font-bold ${
                          inv.status === "Paid" 
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                            : "bg-rose-50 text-rose-800 border border-rose-100"
                        }`}>
                          {inv.status === "Paid" ? "Settled" : "Overdue"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SubTab 4: TICKETS COMPLAINT QUEUE */}
          {activeTab === "crm-tickets" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs sm:text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-150">
                  <tr>
                    <th className="py-4 px-6">Ticket Node</th>
                    <th className="py-4 px-6">Client Name</th>
                    <th className="py-4 px-6">Subject Query</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">SLA Status</th>
                    <th className="py-4 px-6 text-right">Complaint Stage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/20 font-sans">
                      <td className="py-4.5 px-6 font-mono font-bold text-slate-900">{t.id}</td>
                      <td className="py-4.5 px-6 font-bold text-slate-800">{t.customerName}</td>
                      <td className="py-4.5 px-6">
                        <span className="font-bold text-slate-900 block leading-tight">{t.subject}</span>
                        <span className="text-[10px] text-slate-400 font-medium font-sans">Updated: {t.lastUpdatedDate}</span>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className="rounded bg-slate-100 text-slate-600 px-2 py-0.5 text-[9px] font-bold uppercase font-mono tracking-wide">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide border ${
                          t.priority === "Urgent" || t.priority === "High"
                            ? "bg-rose-50 text-rose-800 border-rose-100 animate-pulse"
                            : "bg-indigo-50 text-indigo-800 border-indigo-100"
                        }`}>
                          {t.priority} SLA
                        </span>
                      </td>
                      <td className="py-4.5 px-6 text-right">
                        <span className={`inline-flex items-center gap-1 rounded bg-slate-100 text-slate-650 px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                          t.status === "Resolved" 
                            ? "bg-emerald-50 text-emerald-800 font-sans" 
                            : t.status === "In Progress"
                            ? "bg-indigo-50 text-indigo-800 font-sans"
                            : "bg-blue-50 text-blue-800 font-sans"
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SubTab 5: AUDIT LOGS */}
          {activeTab === "crm-logs" && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b pb-3 mb-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">
                  Staff Intervention Audit Timeline
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto">
                {auditLogs.map((log, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-slate-50/50 rounded-xl border border-slate-150 text-xs">
                    <span className="font-mono text-indigo-600 font-bold tracking-tight shrink-0 bg-indigo-50 p-1 rounded">
                      [{log.time}]
                    </span>
                    <div className="space-y-0.5">
                      <p className="text-slate-700 font-semibold leading-relaxed font-sans">{log.msg}</p>
                      <span className="text-[10px] text-slate-400 font-medium">Logged by operator: <span className="font-bold text-slate-600">{log.actor}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SubTab 6: SUPPORT ANALYTICS */}
          {activeTab === "crm-analytics" && (
            <AnalyticsDashboardView />
          )}

          {/* SubTab 7: HUMAN AGENT DESK */}
          {activeTab === "crm-agent" && (
            <HumanAgentDashboardView 
              tickets={tickets} 
              onAddTicketMessage={onAddTicketMessage} 
            />
          )}

          {/* SubTab 8: AGENT AUDIT TRAIL */}
          {activeTab === "crm-audit" && (
            <AuditLogView />
          )}

          {/* SubTab 9: WORKFLOW GRAPH */}
          {activeTab === "crm-workflow" && (
            <WorkflowVisualization />
          )}

        </div>

        {/* Quick Help Guide Card */}
        <div className="mt-8 bg-indigo-50/30 border border-indigo-100 rounded-3xl p-6 text-xs text-indigo-950 font-sans space-y-2">
          <p className="font-extrabold text-sm text-indigo-950">💡 Executive Help Desk Reference Guide:</p>
          <p className="leading-relaxed font-normal">
            Actions executed in this back-office CRM directly mutate real-time client states. For example, selecting "Authorize Refund" inside the transaction ledger immediately refunds the customer and adjusts tax invoice clearances dynamically.
          </p>
        </div>

      </div>
    </div>
  );
}
