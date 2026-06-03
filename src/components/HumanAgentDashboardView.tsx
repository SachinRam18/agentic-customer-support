import React, { useState, useEffect } from "react";
import { Ticket, TimelineEvent, AuditLogEntry, Customer } from "../types";
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  User, 
  History, 
  ShieldAlert, 
  ArrowRight,
  ClipboardList,
  UserCheck
} from "lucide-react";
import TimelineView from "./TimelineView";

interface SessionSummary {
  session_id: string;
  customer_context: {
    customer_id?: string;
    name?: string;
    email?: string;
    plan?: string;
    status?: string;
    ticket_count: number;
    escalation_count: number;
  } | null;
  is_escalated: boolean;
  pending_action: {
    action_type: string;
    params: Record<string, any>;
    created_at: string;
    message_preview: string;
  } | null;
  last_message: {
    role: string;
    content: string;
    timestamp: string;
  } | null;
  messages_count: number;
  created_at: string;
}

interface HumanAgentDashboardViewProps {
  tickets: Ticket[];
  onAddTicketMessage: (ticketId: string, text: string, sender: "human-agent") => void;
}

export default function HumanAgentDashboardView({ tickets, onAddTicketMessage }: HumanAgentDashboardViewProps) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [sessionTimeline, setSessionTimeline] = useState<TimelineEvent[]>([]);
  const [sessionAuditLogs, setSessionAuditLogs] = useState<AuditLogEntry[]>([]);
  
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"active" | "escalated" | "pending" | "tickets">("active");
  const [rightPanelTab, setRightPanelTab] = useState<"chat" | "timeline" | "audit">("chat");
  const [responseInput, setResponseInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await fetch("http://localhost:8000/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.warn("Failed to fetch active sessions list:", e);
    }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  const selectSession = async (sessionId: string, customerId?: string) => {
    setSelectedSessionId(sessionId);
    setIsLoading(true);
    try {
      // 1. Fetch chat history
      const historyRes = await fetch(`http://localhost:8000/sessions/${sessionId}/history`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setSessionHistory(historyData);
      }
      
      // 2. Fetch timeline
      const timelineRes = await fetch(`http://localhost:8000/sessions/${sessionId}/timeline`);
      if (timelineRes.ok) {
        const timelineData = await timelineRes.json();
        setSessionTimeline(timelineData);
      }
      
      // 3. Fetch audit logs for this customer
      if (customerId) {
        const auditRes = await fetch(`http://localhost:8000/audit/logs?customer_id=${customerId}`);
        if (auditRes.ok) {
          const auditData = await auditRes.json();
          setSessionAuditLogs(auditData);
        }
      } else {
        setSessionAuditLogs([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger select first session when changing tab if list is not empty
  const getFilteredSessions = () => {
    if (activeWorkspaceTab === "escalated") {
      return sessions.filter(s => s.is_escalated);
    }
    if (activeWorkspaceTab === "pending") {
      return sessions.filter(s => s.pending_action !== null);
    }
    return sessions;
  };

  const filteredSessions = getFilteredSessions();
  const selectedSession = sessions.find(s => s.session_id === selectedSessionId);

  // Handle support ticket response
  const handleTicketSubmit = (ticketId: string) => {
    if (!responseInput.trim()) return;
    onAddTicketMessage(ticketId, responseInput, "human-agent");
    setResponseInput("");
  };

  const getPriorityColor = (plan?: string) => {
    if (plan?.toLowerCase() === "enterprise") return "bg-rose-100 text-rose-700 border-rose-200";
    if (plan?.toLowerCase() === "professional" || plan?.toLowerCase() === "pro") return "bg-amber-100 text-amber-700 border-amber-250";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px] border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-xs font-sans">
      
      {/* LEFT COLUMN: Sessions list */}
      <div className="lg:col-span-4 border-r border-slate-200 flex flex-col h-[650px]">
        {/* Sub-tab selectors */}
        <div className="flex border-b border-slate-150 p-2 gap-1 bg-slate-50/50">
          {(["active", "escalated", "pending", "tickets"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveWorkspaceTab(tab);
                setSelectedSessionId(null);
              }}
              className={`flex-1 py-2 px-1 text-[11px] font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeWorkspaceTab === tab
                  ? "bg-slate-900 text-white"
                  : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-750"
              }`}
            >
              {tab === "active" && `Active (${sessions.length})`}
              {tab === "escalated" && `Escalated (${sessions.filter(s => s.is_escalated).length})`}
              {tab === "pending" && `Pending (${sessions.filter(s => s.pending_action !== null).length})`}
              {tab === "tickets" && `Tickets (${tickets.filter(t => t.status !== "Resolved").length})`}
            </button>
          ))}
        </div>

        {/* Sessions scrollable area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {activeWorkspaceTab !== "tickets" ? (
            filteredSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-slate-400 p-4 text-center">
                <MessageSquare className="h-8 w-8 text-slate-300 mb-2 stroke-[1.5]" />
                <span className="text-xs font-bold uppercase tracking-wider">No Sessions Found</span>
              </div>
            ) : (
              filteredSessions.map((session) => {
                const cust = session.customer_context;
                const isSelected = session.session_id === selectedSessionId;
                return (
                  <div
                    key={session.session_id}
                    onClick={() => selectSession(session.session_id, cust?.customer_id)}
                    className={`p-4 flex flex-col gap-2 cursor-pointer transition-all ${
                      isSelected ? "bg-indigo-50/55 border-l-4 border-indigo-600" : "hover:bg-slate-50/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-bold text-slate-900">
                          {cust?.name || `Guest (${session.session_id.substring(0, 6)})`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {session.is_escalated && (
                          <span className="text-[9px] font-extrabold bg-rose-100 text-rose-700 px-2 py-0.5 rounded border border-rose-250 animate-pulse uppercase tracking-wider">
                            Escalated
                          </span>
                        )}
                        {cust?.plan && (
                          <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full ${getPriorityColor(cust.plan)}`}>
                            {cust.plan}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-semibold truncate">
                      {session.last_message ? session.last_message.content : "No messages exchange yet."}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold">
                      <span>{session.messages_count} messages</span>
                      {session.pending_action && (
                        <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 border border-amber-250 px-1.5 py-0.5 rounded uppercase">
                          Gate: {session.pending_action.action_type.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            tickets.map((t) => {
              const isSelected = t.id === selectedSessionId;
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedSessionId(t.id)}
                  className={`p-4 flex flex-col gap-2 cursor-pointer transition-all ${
                    isSelected ? "bg-indigo-50/55 border-l-4 border-indigo-600" : "hover:bg-slate-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-xs text-indigo-600 uppercase tracking-wider">{t.id}</span>
                    <span className={`text-[9px] font-black border px-1.5 py-0.5 rounded-full ${
                      t.priority === "High" || t.priority === "Urgent" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-slate-50 text-slate-500"
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-800 leading-tight block">{t.subject}</span>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold">
                    <span>{t.customerName}</span>
                    <span className={t.status === "Open" ? "text-amber-600 font-bold" : "text-slate-500"}>{t.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Chat History / Timeline / Action panel */}
      <div className="lg:col-span-8 flex flex-col h-[650px] bg-slate-50/15">
        {selectedSessionId ? (
          activeWorkspaceTab !== "tickets" ? (
            // Session workflow detail view
            <div className="flex flex-col h-full overflow-hidden">
              {/* Tab Selector for Session details */}
              <div className="bg-white px-6 py-3 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <UserCheck className="h-4.5 w-4.5 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Session: {selectedSessionId}
                  </span>
                </div>
                
                <div className="flex border border-slate-200 rounded-xl p-1 gap-1 bg-slate-50">
                  {[
                    { id: "chat", label: "Conversation", icon: <MessageSquare className="h-3.5 w-3.5" /> },
                    { id: "timeline", label: "Timeline Events", icon: <History className="h-3.5 w-3.5" /> },
                    { id: "audit", label: "Security Audit", icon: <ClipboardList className="h-3.5 w-3.5" /> }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setRightPanelTab(tab.id as any)}
                      className={`flex items-center gap-1.5 py-1 px-3 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        rightPanelTab === tab.id
                          ? "bg-white text-slate-900 shadow-xs border border-slate-200"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workspace Content */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center flex-1 space-y-2">
                    <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Loading Context...</span>
                  </div>
                ) : (
                  <>
                    {/* Workspace: CHAT HISTORY */}
                    {rightPanelTab === "chat" && (
                      <div className="flex-1 flex flex-col h-full overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30">
                          {sessionHistory.map((m, idx) => {
                            const isBot = m.role !== "user";
                            return (
                              <div key={idx} className={`flex ${isBot ? "justify-start" : "justify-end"} items-start gap-2.5`}>
                                <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[75%] border ${
                                  isBot 
                                    ? "bg-white border-slate-200 text-slate-700" 
                                    : "bg-indigo-600 border-indigo-600 text-white"
                                }`}>
                                  <p className="whitespace-pre-line font-medium">{m.content}</p>
                                  {m.sentiment && (
                                    <span className="mt-1 mr-1.5 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-50 text-slate-500 border border-slate-200 inline-block">
                                      Sentiment: {m.sentiment.level}
                                    </span>
                                  )}
                                  {isBot && m.model_used && (
                                    <span className={`mt-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border inline-block ${
                                      m.model_used.includes("Gemini")
                                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                        : m.model_used.includes("Rule Engine")
                                        ? "bg-sky-50 text-sky-700 border-sky-200"
                                        : "bg-amber-50 text-amber-750 border-amber-250"
                                    }`}>
                                      Source: {m.model_used}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        {selectedSession?.pending_action && (
                          <div className="bg-amber-50 border-t border-amber-250 p-4 flex items-center justify-between shrink-0">
                            <div>
                              <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider block">Awaiting customer confirmation</span>
                              <span className="text-xs font-bold text-slate-800">
                                Action: {selectedSession.pending_action.action_type}
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-slate-500">
                              Logged in timeline
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Workspace: TIMELINE EVENTS */}
                    {rightPanelTab === "timeline" && (
                      <div className="flex-1 overflow-y-auto bg-white">
                        <TimelineView events={sessionTimeline} />
                      </div>
                    )}

                    {/* Workspace: AUDIT LOGS */}
                    {rightPanelTab === "audit" && (
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                        <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-4">
                          Security Actions Logs
                        </h4>
                        {sessionAuditLogs.length === 0 ? (
                          <p className="text-xs text-slate-400 font-semibold py-8 text-center">
                            No critical actions audited for this account.
                          </p>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {sessionAuditLogs.map((log, idx) => (
                              <div key={idx} className="py-3 space-y-1.5 text-xs">
                                <div className="flex justify-between font-bold">
                                  <span className="text-indigo-600 capitalize font-mono text-[10px] bg-slate-50 border border-slate-150 px-1.5 rounded">Action: {log.action}</span>
                                  <span className="text-slate-450 text-[10px]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-slate-650 leading-relaxed font-semibold">
                                  {log.agent_reasoning}
                                </p>
                                <div className="flex gap-4 text-[10px] font-bold text-slate-400">
                                  <span>Result: <strong className={log.result === "success" ? "text-emerald-600" : "text-rose-500"}>{log.result}</strong></span>
                                  <span>Params: {JSON.stringify(log.params)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            // Support Ticket workspace detail view
            (() => {
              const activeTkt = tickets.find(t => t.id === selectedSessionId);
              if (!activeTkt) return null;
              return (
                <div className="flex flex-col h-full overflow-hidden">
                  <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 tracking-wider block font-sans uppercase">Case Details</span>
                      <h3 className="text-sm font-extrabold text-slate-800 font-sans">{activeTkt.subject}</h3>
                    </div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                      {activeTkt.id}
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/20">
                    {activeTkt.messages.map((m, idx) => (
                      <div key={idx} className={`flex ${m.sender === "customer" ? "justify-start" : "justify-end"} items-start gap-2.5`}>
                        <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed max-w-[75%] border ${
                          m.sender === "customer" 
                            ? "bg-white border-slate-200 text-slate-700 font-normal" 
                            : "bg-slate-900 border-slate-900 text-white font-bold"
                        }`}>
                          <span className="text-[9px] uppercase tracking-wider font-extrabold block text-slate-400 mb-1">
                            {m.sender === "customer" ? "Customer" : m.sender === "ai-agent" ? "AI Agent" : "Staff Support"}
                          </span>
                          <p className="whitespace-pre-line leading-relaxed font-semibold">{m.text}</p>
                          <span className="text-[8px] block text-slate-400 text-right mt-1">{m.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input responder */}
                  {activeTkt.status !== "Resolved" ? (
                    <div className="p-4 bg-white border-t border-slate-150 flex gap-2 shrink-0">
                      <input
                        type="text"
                        value={responseInput}
                        onChange={(e) => setResponseInput(e.target.value)}
                        placeholder="Respond to user as a live support agent..."
                        className="flex-1 border rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-indigo-600 text-slate-800"
                        onKeyDown={(e) => e.key === "Enter" && handleTicketSubmit(activeTkt.id)}
                      />
                      <button
                        onClick={() => handleTicketSubmit(activeTkt.id)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1"
                      >
                        <span>Send Response</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-4 border-t border-slate-150 text-center text-xs font-bold text-slate-400 uppercase tracking-widest select-none shrink-0">
                      Ticket Resolved
                    </div>
                  )}
                </div>
              );
            })()
          )
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-400 p-8 text-center">
            <UserCheck className="h-12 w-12 text-slate-300 mb-2 stroke-[1.5]" />
            <span className="text-sm font-bold uppercase tracking-wider text-slate-500">Select a Conversation or Ticket</span>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Select an item from the left panel to review live user history, session timeline events, RAG retrievals, and security logs.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
