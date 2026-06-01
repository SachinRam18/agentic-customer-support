import React, { useState, useMemo } from "react";
import { Customer, Order, Invoice, Ticket, SubscriptionPlan, SubscriptionStatus } from "../types";
import { 
  Cloud, 
  CreditCard, 
  User, 
  Settings, 
  Layers, 
  CheckCircle, 
  Clock, 
  Video, 
  Search, 
  FileText, 
  Plus, 
  AlertCircle, 
  X, 
  Download, 
  Eye, 
  HelpCircle,
  ShieldCheck,
  MapPin,
  Laptop
} from "lucide-react";

interface ClientDashboardViewProps {
  activeCustomer: Customer;
  customers: Customer[];
  orders: Order[];
  invoices: Invoice[];
  tickets: Ticket[];
  onUpdateCustomerEmail: (id: string, email: string) => void;
  onCancelSubscription: (id: string) => void;
  onTriggerRefund: (id: string, orderId: string) => void;
  onAddTicket: (ticket: Ticket) => void;
  onLogout: () => void;
  setSelectedSubTab: (tab: string) => void;
  selectedSubTab: string;
  onOpenChat?: () => void;
}

export default function ClientDashboardView({
  activeCustomer,
  customers,
  orders,
  invoices,
  tickets,
  onUpdateCustomerEmail,
  onCancelSubscription,
  onTriggerRefund,
  onAddTicket,
  onLogout,
  setSelectedSubTab,
  selectedSubTab,
  onOpenChat
}: ClientDashboardViewProps) {
  
  // Local state for profile creation inputs
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState<any>("Technical Issues");
  const [newTicketPriority, setNewTicketPriority] = useState<any>("Medium");
  const [newTicketMsg, setNewTicketMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  // Settings profile email form
  const [tempSettingsEmail, setTempSettingsEmail] = useState(activeCustomer.email);
  const [settingsSuccess, setSettingsSuccess] = useState("");

  // Filter lists for current logged in customer
  const clientOrders = useMemo(() => {
    return orders.filter(o => o.customerId === activeCustomer.id);
  }, [orders, activeCustomer.id]);

  const clientInvoices = useMemo(() => {
    return invoices.filter(i => i.customerId === activeCustomer.id);
  }, [invoices, activeCustomer.id]);

  const clientTickets = useMemo(() => {
    return tickets.filter(t => t.customerId === activeCustomer.id);
  }, [tickets, activeCustomer.id]);

  // Document Vault simulator state
  const [vaultFiles, setVaultFiles] = useState<Array<{ name: string; size: string; date: string; type: string }>>([
    { name: "tax_records_2025_signed.pdf", size: "14.2 MB", date: "2026-04-12", type: "document" },
    { name: "cloudbox_desktop_client_config.json", size: "124 KB", date: "2026-05-18", type: "config" },
    { name: "marketing_assets_q3.zip", size: "1.4 GB", date: "2026-05-22", type: "archive" },
    { name: "terms_and_conditions_cloudbox.pdf", size: "1.8 MB", date: "2026-01-10", type: "document" }
  ]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUploadMock = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            setVaultFiles(prevFiles => [
              {
                name: `user_upload_${Math.floor(100 + Math.random() * 899)}.pdf`,
                size: `${(1.2 + Math.random() * 20).toFixed(1)} MB`,
                date: new Date().toISOString().split("T")[0],
                type: "document"
              },
              ...prevFiles
            ]);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
  };

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicketSubject.trim() || !newTicketMsg.trim()) {
      alert("Please enter a subject and context query for support coordinators.");
      return;
    }

    const brandTicket: Ticket = {
      id: `TKT-${Math.floor(1210 + Math.random() * 900)}`,
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      subject: newTicketSubject,
      category: newTicketCategory,
      status: "Open",
      priority: newTicketPriority,
      createdDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      lastUpdatedDate: new Date().toISOString().replace("T", " ").substring(0, 16),
      messages: [
        {
          sender: "customer",
          text: newTicketMsg,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    onAddTicket(brandTicket);
    setNewTicketSubject("");
    setNewTicketMsg("");
    setSuccessMsg("Support ticket successfully placed! Our technical coordinators will inspect soon.");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleSaveSettingsEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSettingsEmail.includes("@")) {
      alert("Please specify a valid contact address.");
      return;
    }
    onUpdateCustomerEmail(activeCustomer.id, tempSettingsEmail);
    setSettingsSuccess("Account email successfully updated in secure credentials database.");
    setTimeout(() => setSettingsSuccess(""), 4000);
  };

  // Pricing limits & Storage Quota definitions
  const storageLimit = useMemo(() => {
    if (activeCustomer.plan === SubscriptionPlan.STARTER) return { totalNum: 100, label: "100 GB" };
    if (activeCustomer.plan === SubscriptionPlan.PROFESSIONAL) return { totalNum: 1000, label: "1 TB" };
    return { totalNum: 10000, label: "Unlimited (10 TB Tier)" };
  }, [activeCustomer.plan]);

  const usedStorage = useMemo(() => {
    if (activeCustomer.plan === SubscriptionPlan.STARTER) return 42.6;
    if (activeCustomer.plan === SubscriptionPlan.PROFESSIONAL) return 418.5;
    return 1205.2;
  }, [activeCustomer.plan]);

  const usedPercentage = useMemo(() => {
    if (activeCustomer.plan === SubscriptionPlan.ENTERPRISE) return 12;
    return Math.round((usedStorage / storageLimit.totalNum) * 100);
  }, [usedStorage, storageLimit, activeCustomer.plan]);

  return (
    <div className="bg-slate-50/65 min-h-[85vh] py-8 sm:py-10 text-slate-800 font-sans" id="client-dashboard-root">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Upper Client Header greeting menu */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img 
              src={activeCustomer.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
              alt={activeCustomer.name} 
              className="h-14 w-14 rounded-full ring-4 ring-slate-100 object-cover shrink-0" 
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                  Welcome back, <span className="text-blue-600">{activeCustomer.name}</span>
                </h1>
                <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-bold border border-blue-100 uppercase tracking-tight">
                  {activeCustomer.plan}
                </span>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                Manage your storage, billing, and support. (Account: <span className="font-mono font-semibold text-slate-700">{activeCustomer.id}</span>)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-sans self-start md:self-center">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-slate-500 tracking-tight">All systems operational</span>
            <button 
              onClick={onLogout}
              className="ml-4 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-700 text-xs font-bold px-3 py-1.5 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Dynamic Inner Layout Sidebar & Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT REUSABLE TAB NAVIGATION PANEL (Col: 3) */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-slate-200 p-4 space-y-1.5 shadow-xs">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 pb-2 border-b border-slate-100 mb-2">
              My Account
            </div>

            {([
              { id: "overview", label: "Dashboard", icon: Layers },
              { id: "subscription", label: "Subscription", icon: Cloud },
              { id: "orders", label: "Orders", icon: CreditCard },
              { id: "invoices", label: "Invoices", icon: FileText },
              { id: "chat", label: "Live Chat", icon: HelpCircle },
              { id: "tickets", label: "Tickets", icon: AlertCircle, count: clientTickets.length },
              { id: "settings", label: "Settings", icon: Settings },
            ] as Array<{ id: string; label: string; icon: any; count?: number; badge?: string }>).map((subTab) => {
              const Icon = subTab.icon;
              const isSelected = selectedSubTab === subTab.id;
              return (
                <button
                  key={subTab.id}
                  onClick={() => {
                    if (subTab.id === "chat") {
                      if (onOpenChat) onOpenChat();
                    } else {
                      setSelectedSubTab(subTab.id);
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-medium tracking-tight transition-all cursor-pointer ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-semibold border border-blue-100"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
                    <span>{subTab.label}</span>
                  </div>

                  {subTab.count !== undefined && subTab.count > 0 && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {subTab.count}
                    </span>
                  )}
                  
                  {subTab.badge && (
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${
                      isSelected ? "bg-white text-blue-600" : "bg-blue-100 text-blue-700"
                    }`}>
                      {subTab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT ACTION VIEWS CONTAINER (Col: 9) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400 font-medium">Dashboard</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-semibold">
                {selectedSubTab === "overview" ? "Overview" :
                 selectedSubTab === "subscription" ? "Subscription" :
                 selectedSubTab === "orders" ? "Orders" :
                 selectedSubTab === "invoices" ? "Invoices" :
                 selectedSubTab === "chat" ? "Live Chat" :
                 selectedSubTab === "tickets" ? "Tickets" :
                 selectedSubTab === "settings" ? "Settings" : ""}
              </span>
            </div>

            {/* 1. OVERVIEW SUBTAB */}
            {selectedSubTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Storage meter card */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 space-y-3">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block font-sans">
                      Storage Usage
                    </span>
                    <h2 className="text-xl font-bold text-slate-900">
                      You are using <span className="text-blue-600 font-extrabold">{usedStorage} GB</span> of your {storageLimit.label} allocation
                    </h2>
                    
                    <div className="space-y-1">
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${usedPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 font-medium">
                        <span>{usedPercentage}% capacity consumed</span>
                        <span>{storageLimit.label} Total</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-4 border-t md:border-t-0 md:border-l border-slate-150 pt-6 md:pt-0 md:pl-6 text-center md:text-left space-y-1">
                    <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">ENCRYPTION</span>
                    <div className="text-emerald-600 font-extrabold text-base flex items-center justify-center md:justify-start gap-1.5">
                      <ShieldCheck className="h-5 w-5 text-emerald-500" />
                      <span>Secured (AES-256)</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-sans">Files are fully encrypted on client endpoints</span>
                  </div>
                </div>

                {/* Simulated Document Crypt Vault file system */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-6 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-sans text-base font-bold text-slate-900">My Files</h3>
                      <p className="text-slate-500 text-xs">Your uploaded files and documents.</p>
                    </div>

                    <form onSubmit={handleFileUploadMock} className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={isUploading}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-300 disabled:text-slate-500"
                      >
                        <Plus className="h-4 w-4" />
                        <span>{isUploading ? `Uploading ${uploadProgress}%` : "Upload File"}</span>
                      </button>
                    </form>
                  </div>

                  {isUploading && (
                    <div className="bg-blue-50/40 p-3 border-b border-blue-100 flex items-center gap-2 text-xs text-blue-600 animate-pulse">
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <span className="font-mono font-bold whitespace-nowrap">{uploadProgress}%</span>
                    </div>
                  )}

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-150">
                        <tr>
                          <th className="py-3 px-6">File Name</th>
                          <th className="py-3 px-6">Locker Size</th>
                          <th className="py-3 px-6">Date Uploaded</th>
                          <th className="py-3 px-6 text-right">Vault Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {vaultFiles.map((file, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-all font-sans">
                            <td className="py-3.5 px-6">
                              <div className="flex items-center gap-2.5 font-sans">
                                <FileText className="h-4 w-4 text-blue-500" />
                                <span className="font-mono font-medium text-slate-700">{file.name}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-6 font-mono text-slate-500">{file.size}</td>
                            <td className="py-3.5 px-6 text-slate-400 font-mono">{file.date}</td>
                            <td className="py-3.5 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer" title="Preview">
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer" title="Download">
                                  <Download className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Inline recent records info banner */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Subscription card preview */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs font-sans">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-400 font-sans">
                        My Subscription
                      </span>
                      <span className="rounded bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[9px] font-bold font-sans">
                        {activeCustomer.status}
                      </span>
                    </div>

                    <div className="space-y-1 flex justify-between items-center">
                      <div>
                        <div className="font-extrabold text-slate-900 text-sm">
                          CloudBox {activeCustomer.plan} Plan
                        </div>
                        <div className="text-[11px] text-slate-500 block">Billed monthly. Under constant renewal.</div>
                      </div>
                      <button 
                        onClick={() => setSelectedSubTab("subscription")}
                        className="text-xs font-bold text-blue-600 hover:underline"
                      >
                        Review Limits
                      </button>
                    </div>
                  </div>

                  {/* Complaint tickets overview */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-5 space-y-3 shadow-xs font-sans">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-slate-400 font-sans">
                        Open Support Cases
                      </span>
                      <span className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[9px] font-bold font-sans">
                        {clientTickets.length} cases total
                      </span>
                    </div>

                    <div className="space-y-1">
                      {clientTickets.length > 0 ? (
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <span className="font-semibold text-slate-800 font-sans line-clamp-1 block max-w-[170px]">
                              {clientTickets[0].subject}
                            </span>
                            <span className="text-[10px] text-slate-500">Status: {clientTickets[0].status}</span>
                          </div>
                          <button 
                            onClick={() => setSelectedSubTab("tickets")}
                            className="text-xs font-bold text-blue-600 hover:underline shrink-0"
                          >
                            Join Conversation
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>No open issues registered.</span>
                          <button 
                            onClick={() => setSelectedSubTab("tickets")}
                            className="text-xs font-bold text-blue-600 hover:underline"
                          >
                            Raise Ticket
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* 2. MY SUBSCRIPTION SUBTAB */}
            {selectedSubTab === "subscription" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-fade-in font-sans">
                
                <div className="space-y-1.5 border-b pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Subscription Details</h3>
                  <p className="text-slate-500 text-xs">View your plan details and manage your subscription.</p>
                </div>

                {/* Sub specifications list */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
                  <div className="border border-slate-150 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">ACTIVE TIER</span>
                    <div className="font-extrabold text-lg text-slate-800">{activeCustomer.plan} Storage</div>
                  </div>
                  <div className="border border-slate-150 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">BILLING PERIOD</span>
                    <div className="font-extrabold text-lg text-slate-800">Monthly Cycle</div>
                  </div>
                  <div className="border border-slate-150 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-sans">ACCOUNT STATUS</span>
                    <div className="font-extrabold text-lg text-emerald-600 font-sans flex items-center justify-start gap-1">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>{activeCustomer.status}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 rounded-2xl border p-5 text-xs text-slate-600 space-y-2">
                  <p className="font-semibold text-slate-700">Included Core Features:</p>
                  <ul className="list-disc pl-4 space-y-1 leading-normal font-sans text-slate-500">
                    <li>Full military-grade cryptographic zero-knowledge local key generator.</li>
                    <li>Secure URL resource sharing with custom timeouts.</li>
                    <li>Cross-OS client synchronization daemon permissions configured.</li>
                  </ul>
                </div>

                {/* Cancel interface */}
                <div className="border-t border-slate-150 pt-6 space-y-3 font-sans">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 font-sans">Do you wish to cancel your subscription locker?</h4>
                    <p className="text-slate-500 text-xs">
                      Terminating your subscription stops renewal charges. You will continue to have standard upload access until the next monthly billing limit. After the terms close, archives will be held for 30 consecutive days before purge processes occur. If you cancel, no penalties or fees apply.
                    </p>
                  </div>

                  {activeCustomer.status !== SubscriptionStatus.CANCELED ? (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to cancel your CloudBox ${activeCustomer.plan} plan subscription?`)) {
                          onCancelSubscription(activeCustomer.id);
                        }
                      }}
                      className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 text-xs font-bold py-2.5 px-4 transition-all cursor-pointer"
                    >
                      Terminate Active Subscription
                    </button>
                  ) : (
                    <div className="rounded-xl bg-orange-50 border border-orange-200 text-orange-800 font-semibold p-4 text-xs font-sans">
                      ⚠️ Subscription is already successfully scheduled for standard termination. It is currently running under read-only parameters for any new files.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 3. MY ACTIVE ORDERS SUBTAB */}
            {selectedSubTab === "orders" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-fade-in font-sans">
                
                <div className="space-y-1 border-b pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Purchase Order History</h3>
                  <p className="text-slate-500 text-xs">Inspect historical payments representing secure space allocations.</p>
                </div>

                {clientOrders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-150">
                        <tr>
                          <th className="py-3.5 px-4">Order ID</th>
                          <th className="py-3.5 px-4">Billing Item</th>
                          <th className="py-3.5 px-4">Transaction Date</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4 text-right">Clearance State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {clientOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/20 font-sans">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{o.id}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-700">CloudBox {o.planType} Subscription</td>
                            <td className="py-3.5 px-4 font-mono text-slate-400">{o.date}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹{o.amount}</td>
                            <td className="py-3.5 px-4 text-right">
                              {o.status === "Paid" ? (
                                <span className="inline-flex rounded bg-emerald-50 text-emerald-800 px-2 py-0.5 text-[10.5px] font-bold border border-emerald-100 uppercase tracking-tighter">
                                  Captured
                                </span>
                              ) : (
                                <span className="inline-flex rounded bg-rose-50 text-rose-800 px-2 py-0.5 text-[10.5px] font-bold border border-rose-100 uppercase tracking-tighter">
                                  Refunded
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No purchase transactions registered under this sandbox email.</p>
                )}

              </div>
            )}

            {/* 4. MY INVOICES SUBTAB */}
            {selectedSubTab === "invoices" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 animate-fade-in font-sans">
                
                <div className="space-y-1 border-b pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Tax Invoices Directory</h3>
                  <p className="text-slate-500 text-xs">Verify billing statements copy directories. Retrieve secure PDF receipt parameters.</p>
                </div>

                {clientInvoices.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm">
                      <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-150 font-sans">
                        <tr>
                          <th className="py-3.5 px-4">Invoice ID</th>
                          <th className="py-3.5 px-4">Date Issued</th>
                          <th className="py-3.5 px-4">Terms Due Date</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4">Clearing</th>
                          <th className="py-3.5 px-4 text-right">Document</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {clientInvoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50/20 font-sans">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inv.id}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-400">{inv.date}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-400">{inv.dueDate}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹{inv.amount}</td>
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex rounded px-2.5 py-0.5 text-[9.5px] font-bold uppercase ${
                                inv.status === "Paid" 
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-100" 
                                  : "bg-rose-50 text-rose-800 border border-rose-100"
                              }`}>
                                {inv.status === "Paid" ? "Settled" : "Unpaid"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button 
                                onClick={() => alert(`Downloading secure payment statement receipt ${inv.id}`)}
                                className="inline-flex items-center gap-1.5 text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" />
                                <span>Receipt PDF</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No invoice registers logged.</p>
                )}

              </div>
            )}

            {/* 5. LIVE SUPPORT CHAT SUBTAB OR SUPPORT CHAT BUTTON REDIRECTED TO EXPERIENCES */}
            {selectedSubTab === "chat" && (
              <div className="bg-slate-100 border border-slate-200/50 rounded-3xl p-4 text-center space-y-4 animate-fade-in font-sans">
                <span className="text-3xl">💬</span>
                <h3 className="font-extrabold text-base text-slate-900 font-sans">Support Live Chat Experience</h3>
                <p className="text-xs text-slate-500 max-w-lg mx-auto">
                  Our instant AI support chat mimics premium support desks. It can trigger refunds, modify communication nodes or resolve password resets instantaneously.
                </p>
                
                <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wider animate-pulse">
                  👉 Click on 'Live Support Advisor' item to toggle standard active chat box panel in this workspace. Or click button below to load.
                </p>

                <button
                  onClick={() => setSelectedSubTab("chat")}
                  className="rounded-xl bg-blue-600 text-white font-bold text-xs px-4 py-2.5 shadow-md cursor-pointer"
                >
                  Start Consultation Block
                </button>
              </div>
            )}

            {/* 6. SUPPORT TICKETS SUBTAB */}
            {selectedSubTab === "tickets" && (
              <div className="space-y-6 animate-fade-in font-sans">
                
                {/* File new ticket form */}
                <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
                  
                  <div className="space-y-1.5 border-b pb-4">
                    <h3 className="text-lg font-bold text-slate-900">File a Priority Ticket</h3>
                    <p className="text-slate-500 text-xs">Direct support coordinators to assign systems engineers dynamically.</p>
                  </div>

                  {successMsg && (
                    <div className="rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-150 p-4 font-bold text-xs">
                      {successMsg}
                    </div>
                  )}

                  <form onSubmit={handleCreateTicketSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                    
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Inquiry Subject
                      </label>
                      <input
                        type="text"
                        required
                        value={newTicketSubject}
                        onChange={(e) => setNewTicketSubject(e.target.value)}
                        placeholder="e.g. Sync fails on macOS daemon"
                        className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Relevant Category Node
                      </label>
                      <select
                        value={newTicketCategory}
                        onChange={(e) => setNewTicketCategory(e.target.value as any)}
                        className="w-full text-xs font-semibold px-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
                      >
                        <option value="Billing">Billing Accounts</option>
                        <option value="Subscription">Subscription Planning</option>
                        <option value="Refunds">Refund Requests</option>
                        <option value="Account Management">Account Access Management</option>
                        <option value="Technical Issues">Technical Sync Issues</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Assigned Urgency State
                      </label>
                      <select
                        value={newTicketPriority}
                        onChange={(e) => setNewTicketPriority(e.target.value as any)}
                        className="w-full text-xs font-semibold px-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700 bg-white"
                      >
                        <option value="Low">Low priority (No SLA)</option>
                        <option value="Medium">Medium priority (48h SLA)</option>
                        <option value="High">High priority (2h SLA)</option>
                        <option value="Urgent">Urgent priority (15m SLA)</option>
                      </select>
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Context Explanation Query
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={newTicketMsg}
                        onChange={(e) => setNewTicketMsg(e.target.value)}
                        placeholder="Detail your local server logs, storage issues or refund specifications fully..."
                        className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800"
                      ></textarea>
                    </div>

                    <div className="col-span-2 pt-2 border-t mt-1 flex justify-end">
                      <button
                        type="submit"
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 shadow-md shadow-blue-100 transition-colors cursor-pointer"
                      >
                        Submit Support Ticket
                      </button>
                    </div>

                  </form>
                </div>

                {/* List opened support tickets database */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-6 border-b border-slate-150">
                    <h4 className="font-sans text-base font-bold text-slate-900">Your Support Cases Log</h4>
                    <p className="text-slate-500 text-xs">A comprehensive history of priority tickets. Human responses appear here.</p>
                  </div>

                  {clientTickets.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {clientTickets.map((t) => (
                        <div key={t.id} className="p-6 space-y-4 font-sans hover:bg-slate-50/20 transition-all">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4.5 rounded-2xl border">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-bold text-blue-600">{t.id}</span>
                                <span className="text-xs font-extrabold text-slate-800">{t.subject}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 font-medium">Logged Date: {t.createdDate}</div>
                            </div>

                            <div className="flex items-center gap-2 font-mono text-[9px] font-bold">
                              <span className="rounded bg-slate-200 text-slate-700 px-2 py-0.5">{t.category}</span>
                              <span className="rounded bg-amber-100 text-amber-800 px-2 py-0.5">{t.priority} SLA</span>
                              <span className={`rounded px-2 py-0.5 uppercase tracking-tighter ${
                                t.status === "Resolved" ? "bg-emerald-100 text-emerald-800" : "bg-blue-150 text-blue-800 animate-pulse"
                              }`}>{t.status}</span>
                            </div>
                          </div>

                          {/* Ticket messages feed */}
                          <div className="space-y-3.5 pl-3 border-l-2 border-slate-200/60 ml-2">
                            {t.messages.map((m, idx) => {
                              const isSelf = m.sender === "customer";
                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                    <span className={isSelf ? "text-slate-600" : "text-blue-600 font-extrabold"}>
                                      {isSelf ? "You (Client)" : m.sender === "ai-agent" ? "CloudBox AI Assistant" : "Support Engineer"}
                                    </span>
                                    <span>•</span>
                                    <span className="font-medium font-mono text-[9px]">{m.timestamp}</span>
                                  </div>
                                  <p className="text-xs text-slate-600 leading-relaxed max-w-2xl bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                    {m.text}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs text-slate-400 italic">No tickets opened. Your storage locker operations are smooth!</div>
                  )}
                </div>

              </div>
            )}

            {/* 7. ACCOUNT SETTINGS SUBTAB */}
            {selectedSubTab === "settings" && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 animate-fade-in font-sans">
                
                <div className="space-y-1.5 border-b pb-4">
                  <h3 className="text-lg font-bold text-slate-900">Credential Account Settings</h3>
                  <p className="text-slate-500 text-xs">Verify structural contact directories. Changing addresses syncs details across platforms.</p>
                </div>

                {settingsSuccess && (
                  <div className="rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-150 p-4 font-bold text-xs">
                    {settingsSuccess}
                  </div>
                )}

                <form onSubmit={handleSaveSettingsEmail} className="space-y-5 text-sm">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Client ID node (Non-mutable)
                      </label>
                      <input
                        type="text"
                        disabled
                        value={activeCustomer.id}
                        className="w-full text-xs font-mono font-semibold px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Full Name (Locker Owner)
                      </label>
                      <input
                        type="text"
                        disabled
                        value={activeCustomer.name}
                        className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-400 cursor-not-allowed"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Locker Communication Email (Mutable)
                      </label>
                      <input
                        type="email"
                        required
                        value={tempSettingsEmail}
                        onChange={(e) => setTempSettingsEmail(e.target.value)}
                        placeholder="e.g. contact@company.com"
                        className="w-full text-xs font-semibold px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-slate-700"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t flex justify-end">
                    <button
                      type="submit"
                      className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 shadow-md shadow-blue-100 transition-colors cursor-pointer"
                    >
                      Update Account Parameters
                    </button>
                  </div>

                </form>

                {/* Simulated Security audit details */}
                <div className="border-t border-slate-150 pt-6 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 font-sans">Active Sync Devices</h4>
                    <p className="text-slate-500 text-xs">Verify which local platforms hold decrypted folder structures currently.</p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border text-xs">
                      <div className="flex items-center gap-3">
                        <Laptop className="h-5 w-5 text-slate-400" />
                        <div>
                          <div className="font-bold text-slate-800">macOS Desktop Client (Sonoma 14.2)</div>
                          <div className="text-[10px] text-slate-400">IP address: 124.90.111.9 — Synced 3 minutes ago</div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-600">CONNECTED</span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border text-xs">
                      <div className="flex items-center gap-3">
                        <Laptop className="h-5 w-5 text-slate-400" />
                        <div>
                          <div className="font-bold text-slate-800">Linux API Storage Node (Debian stable)</div>
                          <div className="text-[10px] text-slate-400">IP address: 11.200.10.88 — Synced 12 hours ago</div>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] font-bold text-emerald-600">CONNECTED</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
