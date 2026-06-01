import React, { useState } from "react";
import { Cloud, Menu, X, MessageSquare, Shield, LogOut, User, Activity } from "lucide-react";
import { Customer } from "../types";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isLoggedIn: boolean;
  userRole: "customer" | "admin" | "guest";
  currentUser: Customer | null;
  onLogout: () => void;
  setSelectedSubTab: (subTab: string) => void;
  selectedSubTab: string;
  onOpenChat?: () => void;
}

export default function Header({
  currentTab,
  setCurrentTab,
  isLoggedIn,
  userRole,
  currentUser,
  onLogout,
  setSelectedSubTab,
  selectedSubTab,
  onOpenChat
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic Navigation Setup
  const guestNavItems = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "faq", label: "FAQ" },
    { id: "policies", label: "Policies" },
    { id: "contact", label: "Contact Us" }
  ];

  // Map user tabs to dashboard child panel selections
  const customerNavItems = [
    { id: "overview", label: "Locker Dashboard" },
    { id: "subscription", label: "My Subscription" },
    { id: "orders", label: "My Orders" },
    { id: "invoices", label: "My Invoices" },
    { id: "chat", label: "Support Chat" },
    { id: "tickets", label: "Support Tickets" },
    { id: "settings", label: "Account Settings" }
  ];

  const handleCustomerNav = (subTabId: string) => {
    if (subTabId === "chat") {
      if (onOpenChat) onOpenChat();
      setIsOpen(false);
      return;
    }
    setCurrentTab("dashboard");
    setSelectedSubTab(subTabId);
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-150 bg-white/95 backdrop-blur-md font-sans">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <div 
          onClick={() => {
            if (isLoggedIn && userRole === "customer") {
              setCurrentTab("dashboard");
              setSelectedSubTab("overview");
            } else if (isLoggedIn && userRole === "admin") {
              setCurrentTab("admin");
            } else {
              setCurrentTab("home");
            }
          }} 
          className="flex cursor-pointer items-center gap-2.5 hover:opacity-90 transition-opacity"
          id="header-brand-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200">
            <Cloud className="h-5.5 w-5.5 stroke-[2.5]" />
          </div>
          <div>
            <span className="font-sans text-xl font-extrabold tracking-tight text-slate-950">Cloud<span className="text-blue-600">Box</span></span>
            <div className="text-[9px] font-bold tracking-widest uppercase text-slate-400">Enterprise Cloud</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {/* GUEST MODE ON */}
          {!isLoggedIn && guestNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentTab(item.id);
                setIsOpen(false);
              }}
              className={`rounded-lg px-3 py-2 text-sm font-medium tracking-tight transition-all duration-150 cursor-pointer ${
                currentTab === item.id
                  ? "bg-slate-50 text-blue-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-50/70 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* CUSTOMER PORTAL MODE */}
          {isLoggedIn && userRole === "customer" && customerNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleCustomerNav(item.id)}
              className={`rounded-lg px-2.5 py-2 text-xs font-semibold tracking-tight transition-all duration-150 cursor-pointer ${
                currentTab === "dashboard" && selectedSubTab === item.id
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-850"
              }`}
            >
              {item.label}
            </button>
          ))}

          {/* STAFF CRM MODE */}
          {isLoggedIn && userRole === "admin" && (
            <div className="flex items-center gap-2">
              <span className="inline-flex rounded-md bg-amber-50 text-amber-800 px-3 py-1 text-xs font-extrabold border border-amber-200 uppercase tracking-widest gap-1 flex items-center shadow-xs">
                <Shield className="h-4 w-4 text-amber-600" />
                <span>Executive back-office CRM activated</span>
              </span>
            </div>
          )}
        </nav>

        {/* CTA Actions */}
        <div className="hidden sm:flex items-center gap-3 font-sans">
          
          {/* Guest Signup/In ctas */}
          {!isLoggedIn && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentTab("login")}
                className={`text-slate-600 hover:text-slate-900 text-sm font-semibold tracking-tight px-3.5 py-2.5 transition-colors cursor-pointer ${
                  currentTab === "login" ? "text-blue-600" : ""
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setCurrentTab("login");
                }}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 shadow-md shadow-blue-100 transition-all cursor-pointer"
              >
                Start Service Workspace
              </button>
            </div>
          )}

          {/* Customer Logged In Profile view */}
          {isLoggedIn && userRole === "customer" && currentUser && (
            <div className="flex items-center gap-3">
              <div 
                onClick={() => handleCustomerNav("settings")}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <img 
                  src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"} 
                  alt={currentUser.name} 
                  className="h-7 w-7 rounded-full object-cover bg-slate-100 shrink-0" 
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-bold text-slate-700 font-sans tracking-tight leading-none max-w-[90px] truncate">
                  {currentUser.name}
                </span>
              </div>

              <button
                onClick={onLogout}
                className="rounded-xl border border-rose-200 bg-rose-50/50 p-2 text-rose-700 hover:bg-rose-100 transition-colors"
                title="Secure Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* CRM Admin Account Logged In control */}
          {isLoggedIn && userRole === "admin" && (
            <div className="flex items-center gap-2">
              <button
                onClick={onLogout}
                className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-bold text-xs px-3 py-2 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Exit Back-office</span>
              </button>
            </div>
          )}

        </div>

        {/* Mobile menu triggers */}
        <div className="lg:hidden flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-xl border p-2 text-slate-500 bg-white hover:bg-slate-50 transition-colors"
            aria-label="Toggle Navigation Panel"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* Mobile expandable dropdown */}
      {isOpen && (
        <div className="lg:hidden bg-white px-4 py-3 border-t border-slate-150 shadow-lg space-y-1">
          {/* Guest Mobile Menu */}
          {!isLoggedIn && (
            <>
              {guestNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    currentTab === item.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-2 border-t mt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setCurrentTab("login");
                    setIsOpen(false);
                  }}
                  className="w-full text-center rounded-xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setCurrentTab("login");
                    setIsOpen(false);
                  }}
                  className="w-full text-center rounded-xl bg-blue-600 py-3 text-sm font-extrabold text-white shadow-sm"
                >
                  Start Service Workspace
                </button>
              </div>
            </>
          )}

          {/* Customer Mobile Menu */}
          {isLoggedIn && userRole === "customer" && (
            <>
              {customerNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCustomerNav(item.id)}
                  className={`block w-full text-left rounded-xl px-4 py-3 text-sm font-bold transition-all ${
                    currentTab === "dashboard" && selectedSubTab === item.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <div className="pt-2 border-t mt-2">
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-700 font-extrabold text-sm py-3 border border-rose-100"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span>Exit Secure Session</span>
                </button>
              </div>
            </>
          )}

          {/* Admin Mobile Menu */}
          {isLoggedIn && userRole === "admin" && (
            <div className="py-2 text-center space-y-4">
              <span className="text-xs font-bold text-amber-800 uppercase bg-amber-50 rounded-xl px-4 py-2 border border-amber-200 block">
                Executive back-office active
              </span>
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-xs py-3.5 border border-rose-100"
              >
                <LogOut className="h-4 w-4" />
                <span>Exit CRM back-office</span>
              </button>
            </div>
          )}

        </div>
      )}

    </header>
  );
}
