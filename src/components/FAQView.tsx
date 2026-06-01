import React, { useState, useMemo } from "react";
import { supportFAQs } from "../data";
import { Search, HelpCircle, ChevronDown, ChevronUp, Sparkles, SlidersHorizontal } from "lucide-react";

export default function FAQView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [openFAQId, setOpenFAQId] = useState<string | null>(null);

  const categories = ["All", "Billing", "Subscription", "Refunds", "Account Management", "Technical Issues"];

  // Toggle single accordion panel
  const toggleFAQ = (id: string) => {
    setOpenFAQId(openFAQId === id ? null : id);
  };

  // Filter lists dynamically based on selections
  const filteredFAQs = useMemo(() => {
    return supportFAQs.filter((faq) => {
      const matchCategory = activeCategory === "All" || faq.category === activeCategory;
      const matchSearch = 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Support Center Library</span>
          </div>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-sm leading-relaxed">
            Quickly query our extensive index of customer billing, refund policies, technical sync guides, and member credentials FAQs.
          </p>
        </div>

        {/* Search Input and Filters Area */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 mb-8 space-y-4">
          
          {/* Main search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              id="faq-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by keyword (e.g. 'refund', 'cancel', 'password', 'sync')..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm placeholder-slate-400 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
            />
          </div>

          {/* Pill category selection */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 font-sans text-xs font-bold uppercase tracking-wider px-1">
              <SlidersHorizontal className="h-3 w-3" />
              <span>Filter by Category</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  id={`cat-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    setActiveCategory(cat);
                    setOpenFAQId(null); // Close accordion on category change
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold tracking-tight transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-slate-900 text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200/60 hover:border-slate-350 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Accordions Index */}
        {filteredFAQs.length > 0 ? (
          <div className="space-y-3.5">
            {filteredFAQs.map((faq) => {
              const isOpen = openFAQId === faq.id;
              return (
                <div 
                  key={faq.id}
                  id={`faq-item-${faq.id}`}
                  className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                    isOpen 
                      ? "border-blue-200 bg-blue-50/15 shadow-sm"
                      : "border-slate-150 hover:border-slate-300 bg-white"
                  }`}
                >
                  {/* Accordion clickable summary bar */}
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="flex w-full items-center justify-between text-left px-5 py-4 cursor-pointer gap-4"
                  >
                    <div className="space-y-1.5">
                      <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                        {faq.category}
                      </span>
                      <h3 className="font-sans text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </h3>
                    </div>
                    <span className="shrink-0 text-slate-400 bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg border border-slate-150 transition-colors">
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </span>
                  </button>

                  {/* Expandable description block */}
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-4 bg-white text-slate-600 text-sm leading-relaxed whitespace-pre-line animate-slide-down">
                      {faq.answer}
                      <div className="mt-3 flex items-center justify-end text-[10px] font-bold text-blue-500 uppercase tracking-widest gap-1 pointer-events-none">
                        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                        <span>Ground Truth FAQ Verification</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 border rounded-2xl border-dashed border-slate-200 space-y-2">
            <p className="font-bold text-slate-600 text-base">No matching FAQs found</p>
            <p className="text-slate-400 text-xs">Try adjusting your search criteria or categories to locate compliance indices.</p>
            <button 
              onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
              className="text-xs font-semibold text-blue-600 underline"
            >
              Reset all filters
            </button>
          </div>
        )}

        {/* SLA Callout banner */}
        <div className="mt-12 text-center text-xs text-slate-400">
          Can't locate your question? Review our exhaustive legal policies inside <span className="font-bold">Support Policies</span>, or dispatch a direct inquiry in the <span className="font-bold">Contact Us</span> tab.
        </div>

      </div>
    </div>
  );
}
