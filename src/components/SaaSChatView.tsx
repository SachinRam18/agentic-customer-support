import React, { useState, useEffect, useRef } from "react";
import { Customer, Order, Invoice, Ticket, SubscriptionPlan, SubscriptionStatus } from "../types";
import { 
  Send, 
  Cloud, 
  ArrowLeft, 
  Headset, 
  Mic, 
  Menu, 
  X, 
  BadgeHelp,
  MessageSquare,
  Sparkles,
  ArrowRight
} from "lucide-react";

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

interface ChatMessage {
  id: string;
  sender: "customer" | "ai-agent" | "human-agent";
  text: string;
  timestamp: string;
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
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeIntent, setActiveIntent] = useState<string | null>(null); // e.g. 'modify_email'
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 80);
    }
  }, [messages, isTyping, isOpen]);

  // Reset/Initialize Chat History based on user identity (Guest vs Customer)
  const resetChat = () => {
    const timeStr = getTimestamp();
    if (activeCustomer) {
      setMessages([
        {
          id: "msg_init_1",
          sender: "ai-agent",
          text: `👋 Hello ${activeCustomer.name}! How can we help you?`,
          timestamp: timeStr
        },
        {
          id: "msg_init_2",
          sender: "ai-agent",
          text: `I can help manage your ${activeCustomer.plan} Plan locker space. You can trigger billing refunds, edit emails, or cancel subscription renewals right here securely!`,
          timestamp: timeStr
        }
      ]);
    } else {
      setMessages([
        {
          id: "msg_init_1",
          sender: "ai-agent",
          text: `👋 Hello Guest! Welcome to CloudBox. How can we help you?`,
          timestamp: timeStr
        },
        {
          id: "msg_init_2",
          sender: "ai-agent",
          text: `I am Cloudbot, your virtual assistant. Feel free to explore our premium secure storage system, browse plans, or ask me questions!`,
          timestamp: timeStr
        }
      ]);
    }
    setActiveIntent(null);
  };

  // Trigger reset whenever active customer switches (log in / log out)
  useEffect(() => {
    resetChat();
  }, [activeCustomer?.id]);

  const getTimestamp = () => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Bot response dispatcher
  const triggerBotReply = (textReply: string, delayMs = 1000) => {
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
    analyzeInputText(userText);
  };

  const handlePillClick = (label: string, query: string) => {
    const newMsg: ChatMessage = {
      id: `msg_${Math.random()}`,
      sender: "customer",
      text: label,
      timestamp: getTimestamp()
    };
    setMessages(prev => [...prev, newMsg]);
    analyzeInputText(query);
  };

  const analyzeInputText = (text: string) => {
    const query = text.toLowerCase();
    
    // If waiting for an email address update input (Customers only)
    if (activeCustomer && activeIntent === "modify_email") {
      if (query.includes("@")) {
        onUpdateCustomerEmail(activeCustomer.id, text);
        setActiveIntent(null);
        triggerBotReply(`Success! I have securely synchronized your primary security email address to: "${text}". All systems are synced.`);
      } else {
        triggerBotReply("Oops, that doesn't look like a standard email format. Please enter a valid address (e.g., mail@example.com), or type 'cancel' to exit.");
      }
      return;
    }

    setIsTyping(true);

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
          triggerBotReply(`I appreciate that query. As your automated coordinator, I can help you with the following:
1. Modify your account email address (type 'email')
2. Request a subscription renewal refund (type 'refund')
3. Cancel your auto-renewal plans (type 'cancel')
4. Escalate this dialogue to a engineering support case (type 'escalate').`);
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
          triggerBotReply(`Welcome to CloudBox Support! I am a virtual assistant. You can learn more about:
• Our features & file systems (type 'features')
• Pricing & subscription tiers (type 'pricing')
• Standard FAQs (type 'faq')
• Contact parameters (type 'contact')
• Logging into a locker vault (type 'login')`);
        }
      }
    }, 900);
  };

  // Specific Customer Intents
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

  return (
    <>
      {/* 1. PERSISTENT FLOATING TOGGLE BUBBLE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white text-slate-900 border-[3px] border-slate-900 rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95 hover:shadow-slate-300 duration-200"
        title="Open Support Chatbot"
        id="persistent-chatbot-bubble"
      >
        {isOpen ? (
          <X className="h-6 w-6 stroke-[2.5]" />
        ) : (
          <MessageSquare className="h-6 w-6 stroke-[2.5] fill-slate-100" />
        )}
      </button>

      {/* 2. CHATBOT WINDOW POPUP */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 z-50 w-[380px] h-[580px] max-h-[80vh] max-w-[calc(100vw-2rem)] bg-white rounded-[28px] border-[3px] border-slate-900 shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans"
          id="cloudbot-floating-panel"
        >
          
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
                <div className="text-sm font-extrabold leading-tight text-slate-900 flex items-center gap-1">
                  <span>Cloudbot</span>
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-600 px-1 py-0.2 rounded uppercase tracking-wider">Agent</span>
                </div>
                <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Online & active</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => triggerBotReply("Cloudbot automated services are fully operational! Connect to live personnel through support tickets. 🎧")}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-150 hover:text-slate-600 transition-colors cursor-pointer"
              title="Get Support Hotline"
            >
              <Headset className="h-5 w-5" />
            </button>
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

                  <div className="flex flex-col space-y-1.5 max-w-[78%]">
                    <div
                      className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-xs ${
                        isBot
                          ? "bg-white text-slate-700 border border-slate-200 rounded-tl-none font-normal"
                          : "bg-blue-600 text-white rounded-tr-none font-semibold"
                      }`}
                    >
                      <p className="whitespace-pre-line">{m.text}</p>
                    </div>
                    <span className={`text-[9px] text-slate-400 font-medium ${isBot ? "text-left pl-1" : "text-right pr-1"}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

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
                  <span>Want to continue last chat?</span>
                  <span className="font-extrabold uppercase text-rose-600 bg-white border border-rose-200 px-1 rounded">No</span>
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
              Powered By <span className="font-extrabold text-slate-500 uppercase tracking-widest text-[8px]">Cloudbot</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
