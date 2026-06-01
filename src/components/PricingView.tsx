import React, { useState } from "react";
import { Check, ShieldCheck, Zap, Server, BrainCircuit, ArrowRight } from "lucide-react";

interface PricingViewProps {
  setCurrentTab: (tab: string) => void;
}

export default function PricingView({ setCurrentTab }: PricingViewProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Starter Plan",
      id: "starter",
      price: billingCycle === "monthly" ? 199 : 159, // 20% discount on yearly
      storage: "100 GB Storage Space",
      support: "Basic Live Support",
      supportTier: "Basic email & standard chatbot support. Ticket turnaround is within 48 hours.",
      bullets: [
        "100 GB Secure Storage Zone",
        "E2EE Encryption on Uploads",
        "Single File Share Cap up to 5GB",
        "30-day File Version History Logs",
        "2 Connected Synchronized Devices",
        "Standard Web and Mobile App access"
      ],
      icon: Server,
      badge: null,
      cta: "Configure Starter Tier",
      colorStyle: "border-slate-200 text-slate-800 focus:ring-slate-500 hover:border-slate-350"
    },
    {
      name: "Professional Plan",
      id: "professional",
      price: billingCycle === "monthly" ? 499 : 399,
      storage: "1 TB Storage Space",
      support: "Priority Live Support",
      supportTier: "Priority support node. Instant AI routing + human support engineers within 2 hours.",
      bullets: [
        "1 TB Professional Secure Storage",
        "Advanced AES-256-GCM passphrase control",
        "Single File Upload Cap up to 50GB",
        "90-day File Version History Logs",
        "Unlimited Connected Synced Devices",
        "Automated System Backup Scheduler",
        "Shared Team workspaces (up to 3 members)"
      ],
      icon: Zap,
      badge: "MOST POPULAR",
      cta: "Upgrade to Professional Tier",
      colorStyle: "border-blue-600 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100"
    },
    {
      name: "Enterprise Plan",
      id: "enterprise",
      price: billingCycle === "monthly" ? 999 : 799,
      storage: "Unlimited Storage",
      support: "Dedicated Live Support",
      supportTier: "Dedicated support channel. Direct slack integration, 15-minute SLA hotline.",
      bullets: [
        "Unlimited Cryptographic Volume Space",
        "Custom compliance reports & audit controls",
        "Single File Share Cap up to 250GB",
        "365-day File Version History Logs",
        "Collaborative workspaces (unlimited members)",
        "Active Directory & Single Sign-On (SSO)",
        "Dedicated Customer Success Manager"
      ],
      icon: ShieldCheck,
      badge: "ENTERPRISE ESSENTIAL",
      cta: "Contact Enterprise Sales",
      colorStyle: "border-slate-800 bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-200"
    }
  ];

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page title and description */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Simple, honest subscriptions
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-sm sm:text-base leading-relaxed">
            Secure cloud storage for individuals and teams, priced transparently under predictable billing cycles. Cancel anytime with zero friction.
          </p>

          {/* Billing toggle switcher */}
          <div className="flex items-center justify-center pt-4">
            <div className="relative flex rounded-xl bg-slate-100/80 p-1 border border-slate-200/40">
              
              <button
                type="button"
                id="toggle-monthly"
                onClick={() => setBillingCycle("monthly")}
                className={`rounded-lg px-4.5 py-1.5 text-xs font-semibold tracking-tight transition-all ${
                  billingCycle === "monthly"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Monthly plans
              </button>
              
              <button
                type="button"
                id="toggle-yearly"
                onClick={() => setBillingCycle("yearly")}
                className={`rounded-lg px-4.5 py-1.5 text-xs font-semibold tracking-tight transition-all flex items-center gap-1.5 ${
                  billingCycle === "yearly"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span>Yearly Saver</span>
                <span className="rounded-md bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 animate-pulse">
                  Save 20%
                </span>
              </button>

            </div>
          </div>
        </div>

        {/* Plan Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch pt-6">
          {plans.map((plan) => {
            const PlanIcon = plan.icon;
            const isProfessional = plan.id === "professional";
            return (
              <div 
                key={plan.id}
                id={`plan-card-${plan.id}`}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
                  isProfessional 
                    ? "border-2 border-blue-600 ring-4 ring-blue-50/50 shadow-lg shadow-blue-50" 
                    : "border border-slate-200 bg-white"
                }`}
              >
                {/* Upper banner badge */}
                {plan.badge && (
                  <span className={`absolute -top-3.5 left-6 rounded-full px-4 py-1 text-[9px] font-extrabold tracking-widest uppercase ${
                    isProfessional 
                      ? "bg-blue-600 text-white ring-4 ring-blue-100" 
                      : "bg-slate-900 text-white border border-slate-800"
                  }`}>
                    {plan.badge}
                  </span>
                )}

                {/* Pricing / Tiers header */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-1">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isProfessional ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"
                    }`}>
                      <PlanIcon className="h-5 w-5" />
                    </div>
                    <span className="font-sans text-xl font-bold text-slate-900">{plan.name}</span>
                  </div>

                  <p className="text-slate-400 text-xs font-medium uppercase font-sans">
                    Cloudbox secure tier limits
                  </p>

                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-extrabold text-slate-950 font-sans tracking-tight">₹{plan.price}</span>
                    <span className="text-slate-500 text-sm font-semibold">/ month</span>
                  </div>

                  {billingCycle === "yearly" && (
                    <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      Billed as ₹{plan.price * 12} annually
                    </div>
                  )}

                  {/* Highlight core resources */}
                  <div className="space-y-1 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600">
                    <div className="font-bold text-slate-900">{plan.storage}</div>
                    <div>Support Level: <span className="font-semibold text-slate-900">{plan.support}</span></div>
                  </div>

                  <div className="border-t border-slate-100 my-4"></div>

                  {/* Bullets */}
                  <ul className="space-y-3 pt-2">
                    {plan.bullets.map((bullet, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-xs text-slate-600 leading-normal">
                        <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support Tier summary & CTA */}
                <div className="mt-8 space-y-4">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-600 block mb-0.5 uppercase tracking-wider text-[9px]">Included SLA:</span>
                    {plan.supportTier}
                  </p>

                  {isProfessional ? (
                    <button 
                      onClick={() => setCurrentTab("sandbox")}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 text-white font-semibold text-sm py-3 hover:bg-blue-700 hover:shadow-md transition-all cursor-pointer"
                    >
                      <BrainCircuit className="h-4.5 w-4.5" />
                      <span>Simulate CRM Upgrades</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => setCurrentTab("contact")}
                      className={`w-full flex items-center justify-center gap-1 rounded-xl text-slate-700 font-semibold text-sm py-3 hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer`}
                    >
                      <span>Inquire pricing specs</span>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Small Notice / Disclaimer */}
        <div className="mt-12 rounded-2xl bg-slate-50/70 border border-slate-100 p-5 text-xs text-slate-500 space-y-2 text-center max-w-3xl mx-auto">
          <p className="font-semibold text-slate-700">Need specific customized compliance or gigabyte allocations?</p>
          <p className="leading-relaxed">
            Our Enterprise tier can be configured to host bespoke dedicated storage blocks with full storage SLA overrides. For complete validation details on cancellations and payments, review our official details under <button onClick={() => setCurrentTab("policies")} className="font-bold text-blue-600 hover:underline">Billing Policies</button>.
          </p>
        </div>

      </div>
    </div>
  );
}
