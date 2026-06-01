import React, { useState } from "react";
import { Customer, SubscriptionPlan, SubscriptionStatus } from "../types";
import { Cloud, ArrowRight, Shield, User, Mail, Plus, Lock } from "lucide-react";

interface LoginViewProps {
  customers: Customer[];
  onLogin: (userId: string, role: "customer" | "admin") => void;
  onRegister: (newCustomer: Customer) => void;
  setCurrentTab: (tab: string) => void;
}

export default function LoginView({ customers, onLogin, onRegister, setCurrentTab }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [selectedUser, setSelectedUser] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPlan, setRegPlan] = useState<SubscriptionPlan>(SubscriptionPlan.STARTER);

  // Auto-fill selected login user
  React.useEffect(() => {
    if (customers.length > 0) {
      setSelectedUser(customers[0].id);
    }
  }, [customers]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser === "admin") {
      onLogin("admin", "admin");
    } else {
      onLogin(selectedUser, "customer");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim()) {
      alert("Please provide both name and email to establish your sandbox storage locker.");
      return;
    }

    const uniqueId = `CUST${Math.floor(110 + Math.random() * 890)}`;
    const newCust: Customer = {
      id: uniqueId,
      name: regName,
      email: regEmail,
      plan: regPlan,
      status: SubscriptionStatus.ACTIVE,
      joinedDate: new Date().toISOString().split("T")[0],
      avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999)}?auto=format&fit=crop&w=150&h=150&q=80`
    };

    onRegister(newCust);
    onLogin(uniqueId, "customer");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in" id="login-container">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100/50">
        
        {/* Brand identity */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-100">
            <Cloud className="h-6 w-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 font-sans tracking-tight">
            Welcome to CloudBox
          </h2>
          <p className="text-sm text-slate-500 font-sans">
            Secure files and document lockers, synchronized in real time.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("login")}
            className={`w-1/2 pb-3 text-sm font-semibold tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === "login"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("register")}
            className={`w-1/2 pb-3 text-sm font-semibold tracking-tight border-b-2 transition-all cursor-pointer ${
              activeTab === "register"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Create Free Locker
          </button>
        </div>

        {activeTab === "login" ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Choose Login Profile
              </label>

              <div className="space-y-2.5">
                {customers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedUser(c.id)}
                    className={`flex w-full items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedUser === c.id
                        ? "border-blue-600 bg-blue-50/10 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={c.avatarUrl} alt={c.name} className="h-9 w-9 rounded-full bg-slate-100 object-cover shrink-0" referrerPolicy="no-referrer" />
                      <div>
                        <div className="text-sm font-bold text-slate-800 leading-tight">{c.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{c.email}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 rounded px-2 py-0.5">
                      {c.plan}
                    </span>
                  </button>
                ))}

                {/* Staff bypass options */}
                <div className="border-t border-dashed border-slate-200 pt-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedUser("admin")}
                    className={`flex w-full items-center justify-between p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedUser === "admin"
                        ? "border-amber-600 bg-amber-50/15 shadow-sm"
                        : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Lock className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-amber-950 leading-tight">Staff CRM Admin Bypass</div>
                        <div className="text-[10px] text-amber-600">Simulate Administrative View</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold bg-amber-200 text-amber-800 rounded px-2 py-0.5">
                      STAFF
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 shadow-md shadow-blue-100 transition-colors cursor-pointer"
            >
              <span>Authenticate and Launch Workspace</span>
              <ArrowRight className="h-4 w-4" />
            </button>

          </form>
        ) : (
          /* REGISTER FORM */
          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Liam Vance"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Primary Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. liam@acme.com"
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Preferred Support Plan
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: SubscriptionPlan.STARTER, label: "Starter", price: "₹199" },
                    { value: SubscriptionPlan.PROFESSIONAL, label: "Pro", price: "₹499" },
                    { value: SubscriptionPlan.ENTERPRISE, label: "Enterprise", price: "₹999" }
                  ].map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setRegPlan(p.value)}
                      className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                        regPlan === p.value
                          ? "border-blue-600 bg-blue-50/15 font-bold text-blue-700"
                          : "border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium"
                      }`}
                    >
                      <div className="text-xs">{p.label}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{p.price}/m</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3.5 shadow-md shadow-blue-100 transition-colors cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Create Account and Enter Portal</span>
            </button>

          </form>
        )}

        {/* Security Policy assurance */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-center text-[10px] text-slate-400 leading-normal font-sans">
          <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>All cloud lockers are backed by zero-knowledge encryption protocols.</span>
        </div>

      </div>
    </div>
  );
}
