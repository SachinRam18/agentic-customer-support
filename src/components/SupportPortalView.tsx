import React from "react";
import { 
  CreditCard, 
  Settings, 
  RotateCcw, 
  UserCheck, 
  Wrench, 
  ShieldCheck, 
  LifeBuoy, 
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  FileSpreadsheet
} from "lucide-react";

interface SupportPortalViewProps {
  setCurrentTab: (tab: string) => void;
  setFaqCategoryFilter: (category: string) => void;
}

export default function SupportPortalView({ setCurrentTab, setFaqCategoryFilter }: SupportPortalViewProps) {
  
  const categories = [
    {
      title: "Billing Information",
      id: "Billing",
      icon: CreditCard,
      desc: "Retrieve and inspect invoices, edit billing emails, coordinate card updates, and resolve auto-payment failures.",
      color: "blue"
    },
    {
      title: "Subscription Planning",
      id: "Subscription",
      icon: Settings,
      desc: "Learn aboutStarter, Professional, and Enterprise cancellations, tier migrations, storage quotas, and data retention margins.",
      color: "indigo"
    },
    {
      title: "Refund Requisitions",
      id: "Refunds",
      icon: RotateCcw,
      desc: "Review first-time purchase refund eligibilities, transaction gateways clearance frameworks, and clear processing SLAs.",
      color: "rose"
    },
    {
      title: "Account Management",
      id: "Account Management",
      icon: UserCheck,
      desc: "Reset account access password codes, modify primary login emails, enable multi-factor authentication (MFA), and audit active logs.",
      color: "emerald"
    },
    {
      title: "Technical Support",
      id: "Technical Issues",
      icon: Wrench,
      desc: "Troubleshoot cross-platform daemon syncing, review files upload size limitations, restore deleted items, and configure macOS caches.",
      color: "amber"
    }
  ];

  const handleCategoryClick = (catId: string) => {
    setFaqCategoryFilter(catId);
    setCurrentTab("faq");
  };

  const supportSLA = [
    {
      tier: "Starter Tier Support",
      sla: "48-Hour Email SLA",
      points: [
        "Standard digital chatbot triage",
        "Asynchronous email ticket resolution",
        "Online FAQ index search permission"
      ],
      color: "border-slate-200"
    },
    {
      tier: "Professional Tier Support",
      sla: "2-Hour Response SLA",
      points: [
        "Priority chatbot & human routing",
        "Screen-share troubleshooting logs review",
        "Access to native Sync engineers"
      ],
      color: "border-blue-200 bg-blue-50/10 shadow-xs ring-4 ring-blue-50/30"
    },
    {
      tier: "Enterprise Tier Support",
      sla: "15-Minute Dedicated SLA",
      points: [
        "Direct company Slack integration bridge",
        "Dedicated Technical Account Manager",
        "Unlimited custom file upload engineering"
      ],
      color: "border-slate-800 bg-slate-900 text-white"
    }
  ];

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page title header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <LifeBuoy className="h-3.5 w-3.5" />
            <span>Support Resource Desk</span>
          </div>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            CloudBox Help Center
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-sm leading-relaxed font-sans">
            Welcome to the CloudBox Support Portal. Choose a category below to explore specific troubleshooting guides, look up company-wide policies, submit secure help desk tickets, or chat with our automated service assistants.
          </p>
        </div>

        {/* Support Chat Assistant Banner */}
        <div className="rounded-3xl border border-blue-150 bg-gradient-to-r from-blue-50/50 via-indigo-50/45 to-slate-50 p-6 md:p-8 mb-16 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 font-sans">
          <div className="space-y-3 md:max-w-xl font-sans">
            <div className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-[9px] font-extrabold text-blue-800 uppercase tracking-widest font-sans">
              Live Messaging Support
            </div>
            <h2 className="font-sans text-xl md:text-2xl font-bold text-slate-950">
              Need Instant Resolution? Chat with us now
            </h2>
            <p className="text-slate-500 text-xs md:text-sm leading-relaxed font-sans">
              Our automated help desk support agent is online and ready to assist. Change email addresses, calculate refunds, cancel active subscriptions, or raise high-priority coordinator tickets in real-time.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab("chat")}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3.5 shadow-md shadow-blue-200 shrink-0 transition-all active:scale-[0.99] cursor-pointer"
          >
            <MessageSquare className="h-4.5 w-4.5 animate-pulse" />
            <span>Open Support Live Chat</span>
          </button>
        </div>

        {/* Categories Grid (Hovering routes to pre-sorted FAQ) */}
        <div className="space-y-4 mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans px-1">
            Resolve by Category Subject
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <button
                  key={cat.id}
                  id={`cat-card-${cat.id.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => handleCategoryClick(cat.id)}
                  className="flex flex-col text-left justify-between p-5 rounded-2xl border border-slate-150 bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-100/60 hover:scale-[1.01] transition-all duration-300 cursor-pointer group"
                >
                  <div className="space-y-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <CatIcon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-sans text-base font-bold text-slate-900">{cat.title}</h3>
                      <p className="text-slate-500 text-xs leading-relaxed font-normal">{cat.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-blue-600 mt-4 group-hover:text-blue-700">
                    <span>View Category FAQs</span>
                    <ArrowRight className="h-3 w-3 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Support SLAs Comparison Cards */}
        <div className="space-y-4 mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans px-1 text-center">
            CloudBox SLA Response Framework
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-2">
            {supportSLA.map((item, idx) => {
              const isDark = item.sla.includes("15-Minute");

              return (
                <div 
                  key={idx}
                  className={`flex flex-col justify-between p-6 rounded-2xl border ${item.color}`}
                >
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className={`${isDark ? "text-slate-300" : "text-slate-409"} text-xs font-bold uppercase tracking-wider`}>
                        {item.tier}
                      </h3>
                      <div className={`${isDark ? "text-white" : "text-slate-950"} font-sans text-xl font-extrabold tracking-tight`}>
                        {item.sla}
                      </div>
                    </div>

                    <ul className="space-y-2.5 pt-2">
                      {item.points.map((point, pIndex) => (
                        <li key={pIndex} className="flex items-start gap-2 text-xs">
                          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className={isDark ? "text-slate-350" : "text-slate-600"}>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setCurrentTab("contact")}
                    className={`w-full flex items-center justify-center gap-1 rounded-xl font-semibold text-xs py-2.5 mt-6 transition-all ${
                      isDark 
                        ? "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white" 
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    <span>Request Assistance</span>
                  </button>

                </div>
              );
            })}
          </div>
        </div>

        {/* Support Action Trigger Guide */}
        <div className="rounded-2xl border border-slate-150 p-5 bg-slate-50 text-xs flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="text-slate-500 leading-normal">
              In need of instant actions like checking an order or canceling a subscription? Our <span className="font-semibold text-slate-800">Support Dashboard</span> provides simulated access.
            </p>
          </div>
          <button
            onClick={() => setCurrentTab("dashboard")}
            className="flex items-center gap-1 rounded-xl bg-slate-900 text-white font-semibold text-xs px-4 py-2 hover:bg-slate-800 transition-colors shrink-0 text-center"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Open CRM Dashboard</span>
          </button>
        </div>

      </div>
    </div>
  );
}
