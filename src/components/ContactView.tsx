import React, { useState } from "react";
import { Mail, Phone, Clock, MapPin, Send, Code, Sparkles } from "lucide-react";

export default function ContactView() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "Technical Issues",
    priority: "Medium",
    subject: "",
    text: ""
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.text) {
      alert("Please fill in all required fields to draft a support ticket.");
      return;
    }

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      category: "Technical Issues",
      priority: "Medium",
      subject: "",
      text: ""
    });
    setIsSubmitted(false);
  };

  return (
    <div className="bg-white py-16 sm:py-20 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page title description */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Mail className="h-3.5 w-3.5" />
            <span>Support Request Hub</span>
          </div>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Contact Support Desk
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-sm leading-relaxed font-sans">
            Need direct help regarding your private cloud? Drop us a line below, and our support coordinators will catalog and route it to standard systems engineers immediately.
          </p>
        </div>

        {/* Form Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
          
          {/* Left Column: Official Contact details Card (Col: 4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-3xl border border-slate-150 bg-slate-50 p-6 sm:p-7 space-y-7">
              <h2 className="font-sans text-lg font-bold text-slate-950 border-b pb-3 mb-2">
                CloudBox Headquarters
              </h2>

              {/* Physical details list */}
              <div className="space-y-6 text-xs sm:text-sm">
                
                {/* Mail node */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Mail className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-0.5">Primary Support Inbox</h3>
                    <p className="text-slate-500 font-mono">support@cloudbox.com</p>
                  </div>
                </div>

                {/* Phone node */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Phone className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-0.5">SLA Priority Hotline</h3>
                    <p className="text-slate-500 font-mono">+1 (800) 555-CLDBX</p>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-0.5">Corporate Office Hours</h3>
                    <p className="text-slate-500 font-normal">Mon - Fri: 9:00 AM - 6:00 PM IST</p>
                    <p className="text-[10px] text-slate-400">SLA responders monitor priority channels 24/7/365.</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex gap-3.5 items-start">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                    <MapPin className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-0.5">Bangalore Operations Hub</h3>
                    <p className="text-slate-500 leading-normal">
                      Suite 404, Block-B, Crystal Tech Tower, Prestige Tech Park, Marathahalli-Sarjapur Outer Ring Rd, Bengaluru-560103.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Response SLA Notice Banner */}
            <div className="rounded-2xl bg-slate-900 p-5 text-white space-y-3 font-sans">
              <div className="flex items-center gap-1.5 font-bold text-sm text-blue-400 font-sans">
                <Clock className="h-4.5 w-4.5 text-blue-400" />
                <span>Response SLA Pledge</span>
              </div>
              <p className="text-[11px] text-slate-350 leading-relaxed font-sans">
                Starter Tier accounts receive responder triage within 24 hours. Professional and Enterprise partners are guaranteed response solutions in under 2 hours.
              </p>
            </div>
          </div>

          {/* Right Column: Dynamic Form (Col: 8) */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-150 p-6 sm:p-8 bg-white shadow-xs space-y-6">
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="font-sans text-xl font-bold text-slate-900 border-b pb-4">
                  Draft a Support Ticket
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Your Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Sarah Johnson"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all font-medium"
                      required
                    />
                  </div>

                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Primary Account Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. sarah@cloudbox.com"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Category dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Inquiry Subject Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all font-semibold bg-white"
                    >
                      <option value="Billing">Billing & Payments</option>
                      <option value="Subscription">Subscription Tier Management</option>
                      <option value="Refunds">Refund Requests & Policies</option>
                      <option value="Account Management">Account Credential Updates</option>
                      <option value="Technical Issues">Technical Sync Troubleshooting</option>
                    </select>
                  </div>

                  {/* Priority Select */}
                  <div className="space-y-1.5">
                    <label htmlFor="priority" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                      SLA Priority Urgency
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleInputChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all font-semibold bg-white"
                    >
                      <option value="Low">Low - General Inquiries</option>
                      <option value="Medium">Medium - Product Questions</option>
                      <option value="High">High - Storage Failures (SLA Priority)</option>
                      <option value="Urgent">Urgent - Complete Account Lockouts</option>
                    </select>
                  </div>
                </div>

                {/* Subject Line */}
                <div className="space-y-1.5">
                  <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Ticket Summary Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="e.g. Cannot initialize sync cache folder on Windows daemon"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all font-medium"
                    required
                  />
                </div>

                {/* Question Details Area */}
                <div className="space-y-1.5">
                  <label htmlFor="text" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Comprehensive Query Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="text"
                    name="text"
                    rows={5}
                    value={formData.text}
                    onChange={handleInputChange}
                    placeholder="Provide details of your storage environment, OS distribution, exact error logs, billing order dates, or refund justification..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm placeholder-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-50 transition-all font-normal leading-relaxed"
                    required
                  />
                </div>

                <button
                  type="submit"
                  id="contact-submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-5 shadow-md shadow-blue-100 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Priority Support Ticket</span>
                </button>
              </form>
            ) : (
              <div className="space-y-6 animate-slide-down">
                
                {/* Success state heading */}
                <div className="rounded-2xl bg-emerald-50 border border-emerald-150 p-5 space-y-2 text-slate-800 text-center">
                  <span className="text-2xl">🎉</span>
                  <h3 className="font-sans text-lg font-bold text-emerald-950">Ticket Successfully Placed!</h3>
                  <p className="text-xs text-slate-500 max-w-lg mx-auto">
                    Your inquiry has been submitted directly to our global CRM ticketing system. A coordinator will assign a support representative to resolve your issue under your service level agreement.
                  </p>
                </div>

                {/* Secure Receipt Reference */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 font-sans uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 font-sans text-[11px] font-bold">
                      <Clock className="h-3.5 w-3.5 text-blue-500" />
                      Ticket Receipt Reference
                    </span>
                    <span className="rounded bg-emerald-100 text-emerald-850 px-2 py-0.5 text-[9px] font-bold">Triage Queue Active</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-600 space-y-3 text-xs shadow-xs font-sans">
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium text-slate-500">Ticket Reference ID:</span>
                      <span className="font-mono font-bold text-slate-900">#CB-TICK-{Math.floor(1000 + Math.random() * 9000)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium text-slate-500">Date Logged:</span>
                      <span className="font-sans font-semibold text-slate-700">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium text-slate-500">Category Node:</span>
                      <span className="font-sans font-semibold text-slate-700">{formData.category}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="font-medium text-slate-500">Assigned Priority:</span>
                      <span className="font-sans font-semibold text-amber-600">{formData.priority}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="font-medium text-slate-500">Subject:</span>
                      <span className="font-sans font-semibold text-slate-900 truncate max-w-[200px]">{formData.subject}</span>
                    </div>
                  </div>
                </div>

                {/* Button actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleReset}
                    className="w-full text-center rounded-xl border border-slate-250 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs py-3 transition-colors cursor-pointer"
                  >
                    Draft Another Ticket
                  </button>
                  <button
                    onClick={() => {}}
                    className="w-full text-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 shadow-md shadow-blue-100 transition-colors cursor-pointer pointer-events-none"
                  >
                    Ticket Routed to Assigned Engineer
                  </button>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
