import React, { useState } from "react";
import { supportPolicies } from "../data";
import { ShieldCheck, BookOpen, FileText, ChevronRight } from "lucide-react";

export default function PoliciesView() {
  const [selectedPolicy, setSelectedPolicy] = useState(0);

  const policyDetails = supportPolicies[selectedPolicy];

  return (
    <div className="bg-white py-16 sm:py-20 animate-fade-in font-sans">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center space-y-4 mb-16 font-sans">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 font-sans">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Company Compliance Desk</span>
          </div>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Customer Support Policies
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-sm leading-relaxed font-sans">
            The official legal bylaws governing CloudBox transactions. These documents outline the clear rules and requirements governing our services to ensure transparency, security, and trust.
          </p>
        </div>

        {/* Modular Grid Layout: Left List, Right Reader Sheet, Far Right Security Telemetry */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start font-sans">
          
          {/* Left Column - Navigation (Col: 3) */}
          <div className="lg:col-span-3 space-y-2.5 font-sans">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans px-3">
              Corporate Records Index
            </div>
            <div className="space-y-1">
              {supportPolicies.map((policy, idx) => (
                <button
                  key={policy.id}
                  id={`pol-btn-${policy.id}`}
                  onClick={() => setSelectedPolicy(idx)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-xs font-bold tracking-tight transition-all block cursor-pointer font-sans ${
                    selectedPolicy === idx
                      ? "bg-slate-100/90 text-slate-900 border-l-4 border-blue-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className="truncate">{policy.section}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>

            {/* Document stats brief */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2 text-xs font-sans">
              <div className="font-bold text-slate-800 flex items-center gap-1 font-sans">
                <FileText className="h-4 w-4 text-slate-550" />
                <span>Document Metadata</span>
              </div>
              <ul className="space-y-1.5 text-slate-500 font-mono text-[10px]">
                <li>VER_STAMP: <span className="font-semibold text-slate-700 font-sans text-[11px]">2026.04.15</span></li>
                <li>INDEX_STATUS: <span className="text-emerald-500 font-semibold font-sans text-[11px]">VERIFIED</span></li>
                <li>SECTIONS: <span className="text-blue-600 font-semibold font-sans text-[11px]">5 chapters</span></li>
              </ul>
            </div>
          </div>

          {/* Center Column - Core Legal Reader (Col: 6) */}
          <div className="lg:col-span-6 rounded-3xl border border-slate-150 bg-white p-6 sm:p-8 shadow-xs space-y-6 font-sans">
            <div className="border-b border-slate-100 pb-5 space-y-2">
              <span className="inline-flex rounded bg-blue-50 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-700 font-sans">
                {policyDetails.section}
              </span>
              <h2 className="font-sans text-2xl font-extrabold text-slate-900 leading-tight">
                {policyDetails.title}
              </h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold font-sans">
                CloudBox Legal Charter Document CB-{policyDetails.id.toUpperCase()}
              </p>
            </div>

            {/* Render items categorized in paragraphs */}
            <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-600 font-normal font-sans">
              {policyDetails.content.map((clause, idx) => {
                const splitClause = clause.split(":");
                const boldHeader = splitClause[0];
                const restText = splitClause.slice(1).join(":");

                return (
                  <div key={idx} className="space-y-1.5 font-sans">
                    <h3 className="font-sans text-xs sm:text-sm font-bold text-slate-900">
                      Clause {idx + 1}. {boldHeader}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed pl-3.5 border-l border-slate-200">
                      {restText}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Ground Truth Stamp */}
            <div className="border-t border-slate-100 pt-5 flex items-center justify-between text-xs text-slate-400 font-sans">
              <div className="flex items-center gap-1.5 font-semibold">
                <BookOpen className="h-4.5 w-4.5 text-blue-600" />
                <span>Official CloudBox Compliance Document</span>
              </div>
              <span>Page 1 of 1</span>
            </div>
          </div>

          {/* Right Column - Security & Compliance Certificate (Col: 3) */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-150 bg-slate-950 p-5 text-white space-y-5 font-sans">
            <div className="flex items-center gap-1.5 border-b border-slate-800 pb-3">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-300">Security & Signatures</span>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase text-emerald-400 font-bold tracking-widest">Global Standards</span>
                <p className="text-xs text-slate-300 leading-relaxed mt-1 font-medium font-sans">
                  Our service level agreements comply fully with ISO/IEC 27001 information safety standards.
                </p>
              </div>

              {/* Security parameters list */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider font-sans">CRYPTOGRAPHIC CAPABILITY</div>
                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2 font-mono text-[10px] text-slate-300">
                  <div className="flex justify-between">
                    <span>Block cipher:</span>
                    <span className="text-emerald-400">AES-256-GCM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Password Hash:</span>
                    <span className="text-blue-400 font-sans">SHA-256</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Key Exchange:</span>
                    <span className="text-indigo-400">ECDHE-RSA</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Certificates:</span>
                    <span className="text-purple-400 font-sans text-[11px]">SOC 2 Type II</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 font-sans font-sans">
                <div className="font-bold text-slate-400 text-[10px] uppercase tracking-wider font-sans">COMPLIANCE CERTIFICATION</div>
                <ul className="space-y-2.5 text-xs text-slate-300 font-sans">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    <span>GDPR Data Rights Compliant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 font-sans"></span>
                    <span>HIPAA Security Safe Seal</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 font-sans"></span>
                    <span>Zero Employee-Key Access policy</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg bg-emerald-950/40 p-3 text-[10px] border border-emerald-900/30 text-emerald-200 font-sans">
                🔒 <span className="font-semibold text-emerald-100 font-sans">Zero-Knowledge Certified:</span> Under Clause 4.1, no clear-text user credentials or files are accessible to CloudBox staff at any point.
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
