import React, { useState, useEffect, useRef } from "react";
import { 
  Customer, 
  Order, 
  Invoice, 
  Ticket, 
  SubscriptionPlan, 
  SubscriptionStatus,
  SentimentResult,
  RiskScore,
  TimelineEvent,
  PendingConfirmation,
  NotificationRecord
} from "../types";
import { 
  Send, 
  ArrowLeft, 
  Headset, 
  Mic, 
  Menu, 
  X, 
  BadgeHelp,
  MessageSquare,
  Sparkles,
  Maximize2,
  Minimize2,
  Lock,
  History,
  Activity,
  UserCheck
} from "lucide-react";
import TimelineView from "./TimelineView";

interface SaaSChatViewProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeCustomer: Customer | null;
  orders: Order[];
  invoices: Invoice[];
  tickets: Ticket[];
  onUpdateCustomerEmail: (id: string, newEmail: string) => void;
  onCancelSubscription: (id: string) => void;
  onTriggerRefund: (customerId: string, orderId: string) => void;
  onAddTicket: (ticket: Ticket) => void;
}

interface UIMessage {
  id: string;
  sender: "customer" | "ai-agent" | "human-agent";
  text: string;
  timestamp: string;
  sentiment?: SentimentResult;
  rag_sources?: string[];
  model_used?: string;
}

export default function SaaSChatView({
  isOpen,
  setIsOpen,
  activeCustomer,
  orders,
  invoices,
  tickets,
  onUpdateCustomerEmail,
  onCancelSubscription,
  onTriggerRefund,
  onAddTicket
}: SaaSChatViewProps) {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeIntent, setActiveIntent] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Enterprise states
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const [showTimelinePanel, setShowTimelinePanel] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "info" }[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset full screen and timeline states when closed
  useEffect(() => {
    if (!isOpen) {
      setIsFullScreen(false);
      setShowTimelinePanel(false);
    }
  }, [isOpen]);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 80);
    }
  }, [messages, isTyping, isOpen]);

  // Toast notifier helper
  const showToast = (message: string, type: "success" | "info" = "info") => {
    const id = `toast_${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Reset/Initialize Chat History based on user identity (Guest vs Customer)
  const resetChat = () => {
    const timeStr = getTimestamp();
    setRiskScore(null);
    setTimelineEvents([]);
    setPendingConfirmation(null);
    
    if (activeCustomer) {
      setMessages([
        {
          id: "msg_init_1",
          sender: "ai-agent",
          text: `👋 Hello ${activeCustomer.name}! How can we help you?`,
          timestamp: timeStr,
          model_used: "System Welcome"
        },
        {
          id: "msg_init_2",
          sender: "ai-agent",
          text: `I can help manage your ${activeCustomer.plan} Plan locker space. You can trigger billing refunds, edit emails, or cancel subscription renewals right here securely!`,
          timestamp: timeStr,
          model_used: "System Welcome"
        }
      ]);
      // Fetch initial risk/timeline from backend if running
      fetchTimelineAndRisk(activeCustomer.id);
    } else {
      setMessages([
        {
          id: "msg_init_1",
          sender: "ai-agent",
          text: `👋 Hello Guest! Welcome to CloudBox. How can we help you?`,
          timestamp: timeStr,
          model_used: "System Welcome"
        },
        {
          id: "msg_init_2",
          sender: "ai-agent",
          text: `I am Cloudbot, your virtual assistant. Feel free to explore our premium secure storage system, browse plans, or ask me questions!`,
          timestamp: timeStr,
          model_used: "System Welcome"
        }
      ]);
    }
    setActiveIntent(null);
  };

  const fetchTimelineAndRisk = async (customerId: string) => {
    try {
      const riskRes = await fetch(`http://localhost:8000/risk/${customerId}`);
      if (riskRes.ok) {
        const riskData = await riskRes.json();
        setRiskScore(riskData);
      }
      const timelineRes = await fetch(`http://localhost:8000/sessions/${customerId}/timeline`);
      if (timelineRes.ok) {
        const timelineData = await timelineRes.json();
        setTimelineEvents(timelineData);
      }
    } catch (e) {
      console.warn("Failed to fetch initial timeline/risk score from backend.", e);
    }
  };

  // Trigger reset whenever active customer switches (log in / log out)
  useEffect(() => {
    resetChat();
  }, [activeCustomer?.id]);

  const getTimestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Bot response dispatcher
  const triggerBotReply = (
    textReply: string,
    delayMs = 1000,
    sentiment?: SentimentResult,
    ragSources?: string[],
    modelUsed?: string
  ) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `msg_${Math.random()}`,
          sender: "ai-agent",
          text: textReply,
          timestamp: getTimestamp(),
          sentiment,
          rag_sources: ragSources,
          model_used: modelUsed || "Local Heuristic Fallback"
        }
      ]);
    }, delayMs);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal;
    setInputVal("");

    const newMsg: UIMessage = {
      id: `msg_${Math.random()}`,
      sender: "customer",
      text: userText,
      timestamp: getTimestamp()
    };

    setMessages(prev => [...prev, newMsg]);
    analyzeInputText(userText);
  };

  const handlePillClick = (label: string, query: string) => {
    const newMsg: UIMessage = {
      id: `msg_${Math.random()}`,
      sender: "customer",
      text: label,
      timestamp: getTimestamp()
    };
    setMessages(prev => [...prev, newMsg]);
    analyzeInputText(query);
  };

  const handleConfirmationResponse = async (isConfirm: boolean) => {
    if (!activeCustomer) return;
    setIsTyping(true);
    
    try {
      const endpoint = isConfirm ? "confirm" : "cancel";
      const response = await fetch(`http://localhost:8000/sessions/${activeCustomer.id}/${endpoint}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setIsTyping(false);

      // Append confirmation answer from customer
      setMessages(prev => [
        ...prev,
        {
          id: `msg_${Math.random()}`,
          sender: "customer",
          text: isConfirm ? "YES, Confirm" : "NO, Cancel",
          timestamp: getTimestamp()
        }
      ]);

      // Append bot response
      triggerBotReply(data.reply, 100, data.sentiment, data.rag_sources, data.model_used);

      // Update states
      if (data.risk_score) setRiskScore(data.risk_score);
      if (data.timeline_events) setTimelineEvents(data.timeline_events);
      setPendingConfirmation(data.pending_confirmation || null);

      // Trigger toasts for notification events
      if (data.notifications_sent && data.notifications_sent.length > 0) {
        data.notifications_sent.forEach((n: NotificationRecord) => {
          showToast(`📩 ${n.type.toUpperCase()} sent to ${n.recipient}`, "success");
        });
      }

      // Synchronize frontend CRM state based on confirmed action
      if (isConfirm) {
        const confirmedAction = pendingConfirmation?.action_type;
        if (confirmedAction === "cancel_subscription") {
          onCancelSubscription(activeCustomer.id);
          showToast("Subscription cancelled in dashboard", "success");
        } else if (confirmedAction === "trigger_refund") {
          const refundOrderId = pendingConfirmation.params?.order_id || "ORD1002";
          onTriggerRefund(activeCustomer.id, refundOrderId);
          showToast(`Refund processed for order ${refundOrderId}`, "success");
        }
      }

    } catch (err) {
      console.warn("Confirmation failed. Falling back to cancel.", err);
      setIsTyping(false);
      setPendingConfirmation(null);
      triggerBotReply("I encountered an issue executing that command. Let's start over.", 100);
    }
  };

  const analyzeInputText = async (text: string) => {
    const query = text.toLowerCase();
    
    // If waiting for an email address update input (Customers only)
    if (activeCustomer && activeIntent === "modify_email") {
      if (query.includes("@")) {
        onUpdateCustomerEmail(activeCustomer.id, text);
        setActiveIntent(null);
        triggerBotReply(`Success! I have securely synchronized your primary security email address to: "${text}". All systems are synced.`);
        
        // Log action on timeline and check risk
        fetchTimelineAndRisk(activeCustomer.id);
      } else {
        triggerBotReply("Oops, that doesn't look like a standard email format. Please enter a valid address (e.g., mail@example.com), or type 'cancel' to exit.");
      }
      return;
    }

    setIsTyping(true);

    try {
      const sessionId = activeCustomer?.id || "guest";
      const customerContextPayload = activeCustomer ? {
        customer_id: activeCustomer.id,
        name: activeCustomer.name,
        email: activeCustomer.email,
        plan: activeCustomer.plan,
        status: activeCustomer.status,
        ticket_count: tickets.filter(t => t.customerId === activeCustomer.id).length,
        escalation_count: tickets.filter(t => t.customerId === activeCustomer.id && t.priority === "High").length
      } : null;

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          session_id: sessionId,
          customer_context: customerContextPayload
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      setIsTyping(false);

      const intent = data.intent;
      const reply = data.reply;

      // Update state data
      if (data.risk_score) setRiskScore(data.risk_score);
      if (data.timeline_events) setTimelineEvents(data.timeline_events);
      setPendingConfirmation(data.pending_confirmation || null);

      // Trigger toasts for notification events
      if (data.notifications_sent && data.notifications_sent.length > 0) {
        data.notifications_sent.forEach((n: NotificationRecord) => {
          showToast(`📩 ${n.type.toUpperCase()} sent to ${n.recipient}`, "success");
        });
      }

      // Check if this requires immediate action updates (no confirmation flow, e.g. email updates setup)
      if (activeCustomer) {
        if (intent === "update_email") {
          setActiveIntent("modify_email");
        } else if (intent === "escalate_ticket") {
          // Sync with local tickets queue state
          const newTkt: Ticket = {
            id: `TKT-${Math.floor(1100 + Math.random() * 850)}`,
            customerId: activeCustomer.id,
            customerName: activeCustomer.name,
            subject: text,
            category: "Technical Issues",
            status: "In Progress",
            priority: "High",
            createdDate: new Date().toISOString().replace("T", " ").substring(0, 16),
            lastUpdatedDate: new Date().toISOString().replace("T", " ").substring(0, 16),
            messages: [
              { sender: "customer", text, timestamp: getTimestamp() },
              { sender: "ai-agent", text: reply, timestamp: getTimestamp() }
            ]
          };
          onAddTicket(newTkt);
        }
      }

      // Normal bot reply animation
      triggerBotReply(reply, 100, data.sentiment, data.rag_sources, data.model_used);

    } catch (err) {
      console.warn("Backend error, falling back to local chat logic:", err);
      
      // Fallback to original local mock logic
      setTimeout(() => {
        setIsTyping(false);

        // 1. Check if logged in customer
        if (activeCustomer) {
          if (query.includes("cancel") || query.includes("terminate") || query.includes("unsubscribe")) {
            handleCancelLockerIntent();
          } else if (query.includes("refund") || query.includes("double charge") || query.includes("double bill")) {
            handleRefundIntent();
          } else if (query.includes("email") || query.includes("change address")) {
            handleEmailUpdateIntent();
          } else if (query.includes("ticket") || query.includes("escalat") || query.includes("human")) {
            handleEscalateTicketIntent("Support request raised from instant live overlay chat.");
          } else if (query.includes("size") || query.includes("limit") || query.includes("much storage") || query.includes("storage")) {
            let size = activeCustomer.plan === SubscriptionPlan.STARTER ? "100 GB" : activeCustomer.plan === SubscriptionPlan.PROFESSIONAL ? "1 TB" : "Unlimited";
            triggerBotReply(`Your active ${activeCustomer.plan} Plan allows for up to ${size} of synced folder structures. You can check your storage consumption in the Locker Dashboard.`);
          } else if (query.includes("encrypt") || query.includes("security") || query.includes("safe")) {
            triggerBotReply("CloudBox is built on premium, client-side E2EE AES-256 standards. Your files are fully encrypted before leaving your local devices.");
          } else {
            triggerBotReply(`I appreciate that query. As your automated coordinator, I can help you with the following:\n1. Modify your account email address (type 'email')\n2. Request a subscription renewal refund (type 'refund')\n3. Cancel your auto-renewal plans (type 'cancel')\n4. Escalate this dialogue to a engineering support case (type 'escalate').`);
          }
        } 
        // 2. Guest user flow
        else {
          if (query.includes("service") || query.includes("feature") || query.includes("what is") || query.includes("offer")) {
            triggerBotReply("CloudBox is an enterprise-grade cloud storage and file collaboration platform. We feature secure locker spaces, high-speed instant sync, team workspaces, client-side encryption, and seamless sharing controls!");
          } else if (query.includes("pricing") || query.includes("plan") || query.includes("cost") || query.includes("price")) {
            triggerBotReply("We offer three flexible tiers: \n• Starter ($199/mo, 100 GB)\n• Professional ($499/mo, 1 TB)\n• Enterprise ($999/mo, Unlimited space).\n\nYou can explore exact pricing or upgrade dynamically under our Pricing page!");
          } else if (query.includes("faq") || query.includes("question") || query.includes("help")) {
            triggerBotReply("CloudBox provides extensive documentation! Popular topics include encryption models, high-performance local folders, team controls, and billing cycles. Click 'FAQ' on the landing menu to explore them!");
          } else if (query.includes("contact") || query.includes("reach") || query.includes("support")) {
            triggerBotReply("Our primary customer care desk is always online! You can leave us a secure query in the Contact Us page, or email support@cloudbox.com directly.");
          } else if (query.includes("login") || query.includes("sign in") || query.includes("register")) {
            triggerBotReply("To access your dashboard or start a new workspace, click 'Sign In' at the top right of our landing page header. If you are a new customer, you can create a test account in seconds there!");
          } else {
            triggerBotReply(`Welcome to CloudBox Support! I am a virtual assistant. You can learn more about:\n• Our features & file systems (type 'features')\n• Pricing & subscription tiers (type 'pricing')\n• Standard FAQs (type 'faq')\n• Contact parameters (type 'contact')\n• Logging into a locker vault (type 'login')`);
          }
        }
      }, 900);
    }
  };

  // Specific Customer Heuristic Intent Fallbacks (if API fails)
  const handleCancelLockerIntent = () => {
    if (!activeCustomer) return;
    if (activeCustomer.status === SubscriptionStatus.CANCELED) {
      triggerBotReply("I checked your profile. Your subscription renewal is already set to terminate, so no further action is required. We preserve your folders safely for 30 days!");
      return;
    }
    onCancelSubscription(activeCustomer.id);
    triggerBotReply(`Request processed successfully. 😔 I have canceled your active subscription renewal for your CloudBox account. You will retain full access until the current billing expiration. No further fees will occur.`);
  };

  const handleRefundIntent = () => {
    if (!activeCustomer) return;
    const paidOrders = orders.filter(o => o.customerId === activeCustomer.id && o.status === "Paid");
    if (paidOrders.length === 0) {
      triggerBotReply("I scrutinized your billing state, but could not detect any paid charges on our statements ready for cancellation adjustments. Would you like to log a Support ticket instead?");
      return;
    }
    const orderToRefund = paidOrders[0];
    onTriggerRefund(activeCustomer.id, orderToRefund.id);
    triggerBotReply(`Verification complete. I detected paid order ${orderToRefund.id} (Amount: ₹${orderToRefund.amount}). I have authorized a refund transaction back to your original credit card. Clearing typically takes 5-7 business days.`);
  };

  const handleEmailUpdateIntent = () => {
    if (!activeCustomer) return;
    setActiveIntent("modify_email");
    triggerBotReply("I can process a secure email address change instantly. Please enter your new communication address now (e.g. mail@example.com):");
  };

  const handleEscalateTicketIntent = (subjectTxt: string) => {
    if (!activeCustomer) return;
    const ticketId = `TKT-${Math.floor(1100 + Math.random() * 850)}`;
    const newTkt: Ticket = {
      id: ticketId,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      subject: subjectTxt,
      category: "Technical Issues",
      status: "In Progress",
      priority: "High",
      createdDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      lastUpdatedDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      messages: [
        { sender: "customer", text: "Live conversation escalated to engineering specialists.", timestamp: getTimestamp() },
        { sender: "ai-agent", text: "Hi support desk team, I have automatically escalated this standard user dialog representing local syncing delays.", timestamp: getTimestamp() }
      ]
    };
    onAddTicket(newTkt);
    triggerBotReply(`Understood. I have securely generated engineering Support Case ${ticketId} and assigned it to a live technical specialist with high-priority support SLA coverage. You can trace progress inside your 'Tickets' panel.`);
  };

  const guestPills = [
    { label: "Features ⚙️", query: "What are your services and features?" },
    { label: "Pricing 💎", query: "What plans do you offer?" },
    { label: "FAQ ❓", query: "Where are the FAQs?" },
    { label: "Contact Us 📞", query: "How do I contact you?" },
    { label: "Sign In 🔐", query: "How do I sign in?" }
  ];

  const customerPills = [
    { label: "🚫 Cancel Plan", query: "Cancel my subscription" },
    { label: "₹ Refund Charges", query: "Refund my double billing charges" },
    { label: "✉️ Update Email", query: "Update account email address" },
    { label: "⚠️ Escalate Case", query: "Escalate support ticket" },
    { label: "📂 My Storage", query: "How much storage do I have?" }
  ];

  const activePills = activeCustomer ? customerPills : guestPills;

  // Custom User Health Label for header risk scores
  const getAccountHealthLabel = (level: string) => {
    if (level === "high") return { text: "Needs Attention", color: "bg-rose-50 text-rose-600 border-rose-200" };
    if (level === "medium") return { text: "Fair Health", color: "bg-amber-50 text-amber-700 border-amber-200" };
    return { text: "Account Health: Good", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  };

  return (
    <>
      {/* Real-time notification toasts portal */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className="animate-fade-in pointer-events-auto bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 shadow-xl flex items-center gap-2 max-w-sm"
          >
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
          </div>
        ))}
      </div>

      {/* 1. PERSISTENT FLOATING TOGGLE BUBBLE */}
      {(!isOpen || !isFullScreen) && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white text-slate-900 border-[3px] border-slate-900 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 hover:shadow-slate-350 duration-200"
          title="Open Support Chatbot"
          id="persistent-chatbot-bubble"
        >
          {isOpen ? (
            <X className="h-6 w-6 stroke-[2.5]" />
          ) : (
            <MessageSquare className="h-6 w-6 stroke-[2.5] fill-slate-100" />
          )}
        </button>
      )}

      {/* 2. CHATBOT WINDOW POPUP */}
      {isOpen && (
        <div 
          className={
            isFullScreen
              ? "fixed inset-0 z-50 w-screen h-screen bg-white flex overflow-hidden animate-fade-in font-sans"
              : "fixed bottom-24 right-6 z-50 w-[380px] h-[580px] max-h-[80vh] max-w-[calc(100vw-2rem)] bg-white rounded-[28px] border-[3px] border-slate-900 shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans"
          }
          id="cloudbot-floating-panel"
        >
          {/* Outer flex layout for Chat + Timeline side-by-side in Fullscreen mode */}
          <div className="flex-1 flex overflow-hidden w-full h-full">
            
            {/* Main Chat Panel */}
            <div className={`flex-1 flex flex-col h-full overflow-hidden border-r border-slate-100 ${showTimelinePanel && !isFullScreen ? "hidden" : "flex"}`}>
              {/* Header element */}
              <div className="bg-white px-4.5 py-3.5 border-b-2 border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full text-slate-500 hover:bg-slate-150 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Minimize chat"
                  >
                    <ArrowLeft className="h-5 w-5 stroke-[2.5]" />
                  </button>
                  
                  <div className="relative shrink-0">
                    <div className="h-10 w-10 rounded-full bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-md ring-2 ring-slate-100">
                      CB
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-400 border-2 border-white"></span>
                  </div>
                  
                  <div>
                    <div className="text-sm font-extrabold leading-tight text-slate-900 flex items-center gap-1.5">
                      <span>Cloudbot</span>
                      {riskScore && (
                        <span className={`text-[9px] font-bold border px-1.5 py-0.2 rounded-full ${getAccountHealthLabel(riskScore.level).color}`}>
                          {getAccountHealthLabel(riskScore.level).text}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Online & active</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Timeline Toggle Button */}
                  {activeCustomer && (
                    <button 
                      onClick={() => setShowTimelinePanel(!showTimelinePanel)}
                      className={`p-1.5 rounded-full transition-colors cursor-pointer ${showTimelinePanel ? "text-blue-600 bg-blue-50" : "text-slate-450 hover:bg-slate-150 hover:text-slate-700"}`}
                      title="Toggle Customer Timeline"
                    >
                      <History className="h-5 w-5 stroke-[2.2]" />
                    </button>
                  )}

                  <button 
                    onClick={() => triggerBotReply("Cloudbot enterprise services are online! Active context window handles multi-turn triggers automatically. 🎧")}
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-150 hover:text-slate-600 transition-colors cursor-pointer"
                    title="Get Support Hotline"
                  >
                    <Headset className="h-5 w-5" />
                  </button>

                  <button 
                    onClick={() => setIsFullScreen(!isFullScreen)}
                    className="p-1.5 rounded-full text-slate-400 hover:bg-slate-150 hover:text-slate-650 transition-colors cursor-pointer"
                    title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
                  >
                    {isFullScreen ? (
                      <Minimize2 className="h-5 w-5" />
                    ) : (
                      <Maximize2 className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Messages layout */}
              <div className="flex-1 overflow-y-auto p-4.5 space-y-4.5 bg-slate-50/45">
                
                {messages.map((m) => {
                  const isBot = m.sender !== "customer";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${isBot ? "justify-start" : "justify-end"} items-end gap-2.5 max-w-full`}
                    >
                      {isBot && (
                        <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                          <BadgeHelp className="h-4 w-4" />
                        </div>
                      )}

                      <div className="flex flex-col space-y-1 max-w-[78%]">
                        <div
                          className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-xs ${
                            isBot
                              ? "bg-white text-slate-700 border border-slate-200 rounded-tl-none font-normal"
                              : "bg-blue-600 text-white rounded-tr-none font-semibold"
                          }`}
                        >
                          <p className="whitespace-pre-line">{m.text}</p>
                          
                          {/* Sentiment Tag */}
                          {isBot && m.sentiment && (
                            <div className="mt-1.5 flex justify-start">
                              <span 
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  m.sentiment.level === "positive" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                  m.sentiment.level === "negative" ? "bg-rose-50 text-rose-700 border-rose-100 animate-shake" : "bg-slate-50 text-slate-500 border-slate-150"
                                }`}
                                title={`Analysis Confidence: ${(m.sentiment.confidence * 100).toFixed(0)}%`}
                              >
                                {m.sentiment.level === "positive" ? "😊 Positive Agent Mood" :
                                 m.sentiment.level === "negative" ? "⚠️ Frustrated Customer Alert" : "😐 Neutral"}
                              </span>
                            </div>
                          )}

                          {/* Model Used Badge */}
                          {isBot && m.model_used && (
                            <div className="mt-1.5 flex justify-start">
                              <span 
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-extrabold border uppercase tracking-wider ${
                                  m.model_used.includes("Gemini")
                                    ? "bg-indigo-50 text-indigo-700 border-indigo-250 shadow-indigo-50"
                                    : m.model_used.includes("Rule Engine")
                                    ? "bg-sky-50 text-sky-700 border-sky-200"
                                    : m.model_used.includes("Welcome")
                                    ? "bg-slate-50 text-slate-600 border-slate-200"
                                    : "bg-amber-50 text-amber-700 border-amber-250"
                                }`}
                              >
                                <Sparkles className={`h-2.5 w-2.5 ${m.model_used.includes("Gemini") ? "text-indigo-500 animate-pulse" : "text-slate-400"}`} />
                                <span>Source: {m.model_used}</span>
                              </span>
                            </div>
                          )}

                          {/* RAG Knowledge Citations */}
                          {isBot && m.rag_sources && m.rag_sources.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-100">
                              <details className="text-[10px] text-slate-400 font-semibold cursor-pointer">
                                <summary className="hover:text-slate-600 select-none flex items-center gap-1">
                                  <Sparkles className="h-3 w-3 text-cyan-500" />
                                  <span>View Citations ({m.rag_sources.length})</span>
                                </summary>
                                <ul className="mt-1 pl-4 list-disc space-y-0.5 font-medium text-slate-500">
                                  {m.rag_sources.map((src, i) => (
                                    <li key={i} className="hover:underline">{src}</li>
                                  ))}
                                </ul>
                              </details>
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] text-slate-400 font-medium ${isBot ? "text-left pl-1" : "text-right pr-1"}`}>
                          {m.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Inline Confirmation Card trigger */}
                {pendingConfirmation && (
                  <div className="mx-8 bg-amber-50/70 border-2 border-amber-300 rounded-2xl p-4 space-y-3 shadow-md animate-fade-in select-none">
                    <div className="flex items-start gap-2.5">
                      <Lock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                          Action Approval Required
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          You are requesting to: <strong className="text-amber-800">{pendingConfirmation.action_type.replace("_", " ")}</strong>. This is a critical transaction.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-1.5 justify-end">
                      <button
                        onClick={() => handleConfirmationResponse(false)}
                        className="px-3.5 py-1.5 rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all cursor-pointer active:scale-95"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmationResponse(true)}
                        className="px-4.5 py-1.5 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-black transition-all cursor-pointer active:scale-95 shadow-sm"
                      >
                        Confirm & Execute
                      </button>
                    </div>
                  </div>
                )}

                {isTyping && (
                  <div className="flex justify-start items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                      <BadgeHelp className="h-4 w-4 animate-bounce" />
                    </div>
                    <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200 text-slate-400 text-xs flex items-center gap-1.5 shadow-xs">
                      <span>Cloudbot is typing</span>
                      <span className="flex gap-0.5">
                        <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce"></span>
                        <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="h-1 w-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick-action capsule pills element - wrapper inside bottom */}
              <div className="bg-white px-4.5 py-3 border-t border-slate-100 space-y-2">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block px-1">
                  Select a quick action
                </span>
                <div className="flex flex-wrap items-center gap-1.5 justify-start">
                  {activePills.map((pill, index) => (
                    <button
                      key={index}
                      onClick={() => handlePillClick(pill.label, pill.query)}
                      className="rounded-full bg-slate-50 border border-slate-200 hover:border-slate-400 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer select-none active:scale-95"
                    >
                      {pill.label}
                    </button>
                  ))}
                </div>

                {/* Clear history toggle */}
                {messages.length > 2 && (
                  <div className="flex justify-center pt-2">
                    <button 
                      onClick={resetChat}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-full px-3 py-1 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                    >
                      <span>Start clean conversation?</span>
                      <span className="font-extrabold uppercase text-rose-600 bg-white border border-rose-200 px-1 rounded">Yes</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Footer input form */}
              <div className="p-3 border-t-2 border-slate-100 bg-white flex flex-col space-y-1">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <div className="flex-1 relative flex items-center bg-slate-100/60 rounded-full px-4.5 py-2.5 border border-transparent focus-within:border-slate-300 focus-within:bg-white transition-all">
                    <input
                      type="text"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                      placeholder="Ask me anything..."
                      className="flex-1 text-xs bg-transparent outline-none border-none text-slate-800 placeholder-slate-400 font-semibold mr-6"
                    />
                    <button
                      type="button"
                      onClick={() => triggerBotReply("Speech input interface is simulated. Try writing your requests! 🎤")}
                      className="absolute right-3.5 text-slate-400 hover:text-slate-650 transition-colors"
                      title="Speech input"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="submit"
                    className="h-9 w-9 bg-slate-950 hover:bg-slate-850 text-white rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-sm active:scale-95"
                    title="Send Message"
                  >
                    <Send className="h-3.5 w-3.5 fill-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerBotReply("SaaS automated options panel is simulated! Choose the capsules above for instant modifications. 📑")}
                    className="h-9 w-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center shrink-0 transition-colors cursor-pointer active:scale-95"
                    title="SaaS Options"
                  >
                    <Menu className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </form>
                
                <div className="text-[9px] text-center text-slate-400 font-sans tracking-wide pt-1 select-none">
                  Powered By <span className="font-extrabold text-slate-500 uppercase tracking-widest text-[8px]">Cloudbot Enterprise</span>
                </div>
              </div>
            </div>

            {/* Customer Timeline Side Panel (shows alongside chat in Fullscreen, slides over on mobile/popover) */}
            {activeCustomer && showTimelinePanel && (
              <div className={`h-full bg-slate-50 flex flex-col border-l border-slate-200 ${isFullScreen ? "w-[360px]" : "flex-1 w-full animate-fade-in"}`}>
                <div className="bg-white px-4.5 py-4 border-b border-slate-150 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4.5 w-4.5 text-blue-600 stroke-[2.2]" />
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      Customer Timeline
                    </h3>
                  </div>
                  <button 
                    onClick={() => setShowTimelinePanel(false)}
                    className="p-1 rounded-full text-slate-400 hover:bg-slate-150 hover:text-slate-700 transition-colors cursor-pointer"
                    title="Close Timeline"
                  >
                    <X className="h-4.5 w-4.5 stroke-[2.5]" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-hidden flex flex-col bg-white">
                  {/* Embedded Timeline View */}
                  <TimelineView events={timelineEvents} />
                </div>
              </div>
            )}

          </div>

        </div>
      )}
    </>
  );
}
