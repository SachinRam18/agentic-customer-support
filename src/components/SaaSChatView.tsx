import React, { useState, useEffect, useRef } from "react";
import { Customer, Order, Invoice, Ticket, SubscriptionPlan, SubscriptionStatus } from "../types";
import { Send, Cloud, MessageSquare, ArrowRight, ShieldAlert, Sparkles, User, RefreshCw, BadgeHelp } from "lucide-react";

interface SaaSChatViewProps {
  activeCustomer: Customer;
  orders: Order[];
  invoices: Invoice[];
  tickets: Ticket[];
  onUpdateCustomerEmail: (id: string, newEmail: string) => void;
  onCancelSubscription: (id: string) => void;
  onTriggerRefund: (customerId: string, orderId: string) => void;
  onAddTicket: (ticket: Ticket) => void;
}

interface ChatMessage {
  id: string;
  sender: "customer" | "ai-agent" | "human-agent";
  text: string;
  timestamp: string;
}

export default function SaaSChatView({
  activeCustomer,
  orders,
  invoices,
  tickets,
  onUpdateCustomerEmail,
  onCancelSubscription,
  onTriggerRefund,
  onAddTicket
}: SaaSChatViewProps) {
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeIntent, setActiveIntent] = useState<string | null>(null); // e.g. 'cancel', 'refund', 'email'
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initial welcome message from Intercom bot on load
  useEffect(() => {
    setMessages([
      {
        id: "msg_init_1",
        sender: "ai-agent",
        text: `Hi ${activeCustomer.name}! I am your CloudBox Automated Support Specialist. 🔐`,
        timestamp: getTimestamp()
      },
      {
        id: "msg_init_2",
        sender: "ai-agent",
        text: `How can I assist you with your ${activeCustomer.plan} locker today? You can choose one of the quick secure actions below, or ask me any question about storage and billing.`,
        timestamp: getTimestamp()
      }
    ]);
  }, [activeCustomer]);

  const getTimestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Bot response dispatcher
  const triggerBotReply = (textReply: string, delayMs = 1200) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev,
        {
          id: `msg_${Math.random()}`,
          sender: "ai-agent",
          text: textReply,
          timestamp: getTimestamp()
        }
      ]);
    }, delayMs);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal;
    setInputVal("");

    const newMsg: ChatMessage = {
      id: `msg_${Math.random()}`,
      sender: "customer",
      text: userText,
      timestamp: getTimestamp()
    };

    setMessages(prev => [...prev, newMsg]);

    // Handle ongoing state-based intent captures or analyze text
    analyzeInputText(userText);
  };

  const analyzeInputText = (text: string) => {
    const query = text.toLowerCase();
    
    // Check if we are waiting for an email address update input
    if (activeIntent === "modify_email") {
      if (query.includes("@")) {
        onUpdateCustomerEmail(activeCustomer.id, text);
        setActiveIntent(null);
        triggerBotReply(`Success! I have securely synchronized your primary security email address to: "${text}". Your multi-platform accounts are synced.`);
      } else {
        triggerBotReply("Oops, that doesn't look like a standard email format. Please enter a valid address (e.g., service@acme-inc.com), or type 'cancel' to exit.");
      }
      return;
    }

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // Match core questions
      if (query.includes("cancel") || query.includes("terminate") || query.includes("unsubscribe")) {
        handleCancelLockerIntent();
      } else if (query.includes("refund") || query.includes("double charge") || query.includes("double bill")) {
        handleRefundIntent();
      } else if (query.includes("email") || query.includes("change address")) {
        handleEmailUpdateIntent();
      } else if (query.includes("ticket") || query.includes("escalat") || query.includes("human")) {
        handleEscalateTicketIntent("Support request raised from instant live message context");
      } else if (query.includes("size") || query.includes("limit") || query.includes("much storage")) {
        let size = activeCustomer.plan === SubscriptionPlan.STARTER ? "100 GB" : activeCustomer.plan === SubscriptionPlan.PROFESSIONAL ? "1 TB" : "Unlimited";
        triggerBotReply(`Your current ${activeCustomer.plan} Plan storage capacity allows for up to ${size} of local synced folder structures. You can configure upgrades in My Subscription anytime!`);
      } else if (query.includes("encrypt") || query.includes("security") || query.includes("safe")) {
        triggerBotReply("CloudBox is built on premium, client-side E2EE AES-256 standards. Our employees do not hold secondary master decryption tokens, shielding folders completely.");
      } else {
        triggerBotReply(`I appreciate that query. As an automated coordinator, I can help you: 
1. Modify your login email parameters (type 'email') 
2. Request duplicate billing refunds (type 'refund') 
3. Terminate renewals / cancel plans (type 'cancel') 
4. Escalate this conversation to a senior technical support tickets queue (type 'escalate').`);
      }
    }, 1000);
  };

  // Specific intents
  const handleCancelLockerIntent = () => {
    if (activeCustomer.status === SubscriptionStatus.CANCELED) {
      triggerBotReply("I checked your profile roster. Your subscription is already set to terminate under read-only parameters, so no further action is required. We preserve your folders safely for 30 days!");
      return;
    }

    onCancelSubscription(activeCustomer.id);
    triggerBotReply(`Request processed successfully. 😔 I have canceled your active subscription renewal for your CloudBox account. You will retain full access until the current billing expiration. No further fees will occur.`);
  };

  const handleRefundIntent = () => {
    const paidOrders = orders.filter(o => o.customerId === activeCustomer.id && o.status === "Paid");
    if (paidOrders.length === 0) {
      triggerBotReply("I scrutinized your billing state, but could not detect any active paid charges on our statement rows ready for cancellation adjustments. Would you like to log a Support ticket instead?");
      return;
    }

    // Refund the first eligible paid order
    const orderToRefund = paidOrders[0];
    onTriggerRefund(activeCustomer.id, orderToRefund.id);
    triggerBotReply(`Verification complete. I detected paid order ${orderToRefund.id} (Amount: ₹${orderToRefund.amount}). I have authorized a refund transaction back to your original credit card. Clearing typically takes 5-7 business days.`);
  };

  const handleEmailUpdateIntent = () => {
    setActiveIntent("modify_email");
    triggerBotReply("I can process a secure email address change instantly. Please enter the new communication address now (e.g. liam@acme.com):");
  };

  const handleEscalateTicketIntent = (subjectTxt: string) => {
    // Generate new ticket
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
        {
          sender: "customer",
          text: "Live conversation escalated to engineering specialists.",
          timestamp: getTimestamp()
        },
        {
          sender: "ai-agent",
          text: "Hi support desk team, I have automatically escalated this standard user dialog representing local syncing delays.",
          timestamp: getTimestamp()
        }
      ]
    };

    onAddTicket(newTkt);
    triggerBotReply(`Understood. I have securely generated engineering Support Case ${ticketId} and assigned it to a live technical specialist with high-priority support SLA coverage. You can trace progress inside the 'Support Tickets' panel.`);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-lg flex flex-col h-[550px] overflow-hidden font-sans" id="saas-help-chat">
      
      {/* Support chat header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-4 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/10 text-white flex items-center justify-center">
            <Cloud className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight font-sans flex items-center gap-1.5">
              <span>CloudBox Help Specialist</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            </div>
            <span className="text-[10px] text-slate-200 block font-normal">Automated Customer Triage — High-SLA Online</span>
          </div>
        </div>

        <div className="bg-white/15 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider text-white">
          Active Sandbox
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50">
        
        {messages.map((m) => {
          const isBot = m.sender !== "customer";
          return (
            <div
              key={m.id}
              className={`flex ${isBot ? "justify-start" : "justify-end"} items-end gap-2.5 max-w-full`}
            >
              {isBot && (
                <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <BadgeHelp className="h-4 w-4" />
                </div>
              )}

              <div className="flex flex-col space-y-1 max-w-[75%]">
                <div
                  className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? "bg-white text-slate-700 border border-slate-200 shadow-sm rounded-tl-none font-normal"
                      : "bg-blue-600 text-white shadow-xs rounded-tr-none font-medium"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <span className={`text-[9px] text-slate-400 font-mono ${isBot ? "text-left pl-1" : "text-right pr-1"}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
              <BadgeHelp className="h-4 w-4 animate-bounce" />
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 border border-slate-200 text-slate-400 text-xs flex items-center gap-1.5">
              <span>Assistant is typing</span>
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 bg-slate-350 rounded-full animate-bounce"></span>
                <span className="h-1.5 w-1.5 bg-slate-350 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-1.5 w-1.5 bg-slate-350 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested fast Actions */}
      <div className="bg-slate-50 p-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5 justify-start">
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block w-full px-1 mb-1">
          Instant Bot Integrations
        </span>

        <button
          onClick={() => {
            setMessages(prev => [...prev, { id: `m_${Math.random()}`, sender: "customer", text: "Cancel my renewal subscription plan", timestamp: getTimestamp() }]);
            handleCancelLockerIntent();
          }}
          className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
        >
          🚫 Cancel Subscription
        </button>

        <button
          onClick={() => {
            setMessages(prev => [...prev, { id: `m_${Math.random()}`, sender: "customer", text: "Check refund status for double billing charges", timestamp: getTimestamp() }]);
            handleRefundIntent();
          }}
          className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
        >
          ₹ Refund Duplicate Charges
        </button>

        <button
          onClick={() => {
            setMessages(prev => [...prev, { id: `m_${Math.random()}`, sender: "customer", text: "Update primary contact email details", timestamp: getTimestamp() }]);
            handleEmailUpdateIntent();
          }}
          className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
        >
          ✉️ Update Support Email
        </button>

        <button
          onClick={() => {
            setMessages(prev => [...prev, { id: `m_${Math.random()}`, sender: "customer", text: "Please escalate my syncing query to engineering specialists", timestamp: getTimestamp() }]);
            handleEscalateTicketIntent("Sync delay reported on local Sonoma OS folders");
          }}
          className="rounded-lg bg-white border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
        >
          ⚠️ Escalate Ticket
        </button>
      </div>

      {/* Input panel */}
      <form onSubmit={handleSendMessage} className="p-3 border-t bg-white flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Ask a question or select action buttons above..."
          className="flex-1 px-4.5 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-100 transition-all font-medium text-slate-800"
        />
        <button
          type="submit"
          className="h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center shrink-0 transition-colors cursor-pointer"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
}
