import React from "react";
import { Cloud, Heart, Github, Linkedin, ExternalLink } from "lucide-react";

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-100 bg-slate-50 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          
          {/* Company Intro Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm shadow-blue-200">
                <Cloud className="h-4.5 w-4.5" />
              </div>
              <span className="font-sans text-lg font-bold text-slate-900">CloudBox</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed font-sans">
              Secure Cloud Storage for Individuals and Teams. Powered by industry-leading multi-node encryption, real-time desktop sync, and 24/7 dedicated support teams.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="rounded-full bg-white p-2 text-slate-400 border border-slate-200 hover:text-blue-600 shadow-xs hover:shadow-sm transition-all">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-full bg-white p-2 text-slate-400 border border-slate-200 hover:text-blue-600 shadow-xs hover:shadow-sm transition-all">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Solutions Column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-950 font-sans mb-4">Enterprise Services</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentTab("features")} className="text-slate-500 hover:text-blue-600 transition-colors text-left">
                  Personal Cloud Storage
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("features")} className="text-slate-500 hover:text-blue-600 transition-colors text-left">
                  Team Collaboration Tools
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("features")} className="text-slate-500 hover:text-blue-600 transition-colors text-left">
                  Automated Cold Storage Backup
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("features")} className="text-slate-500 hover:text-blue-600 transition-colors text-left">
                  Secure Cryptographic Sharing
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("features")} className="text-slate-500 hover:text-blue-600 transition-colors text-left">
                  Enterprise Volume Solutions
                </button>
              </li>
            </ul>
          </div>

          {/* Support Portal Column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-950 font-sans mb-4">Support & FAQ</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentTab("support")} className="text-slate-500 hover:text-blue-600 transition-colors text-left">
                  Support Portal Home
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("faq")} className="text-slate-500 hover:text-blue-600 transition-colors text-left">
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("contact")} className="text-slate-500 hover:text-blue-600 transition-colors text-left">
                  Technical Support Tickets
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("policies")} className="text-slate-500 hover:text-blue-600 transition-colors text-left">
                  Compliance Policies Docs
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("dashboard")} className="text-slate-500 hover:text-blue-600 transition-colors text-left font-semibold">
                  Employee CRM Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Legal Column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-950 font-sans mb-4">Legal & Compliance</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => setCurrentTab("policies")} className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 justify-start text-left">
                  Refund Rules & Policy
                  <ExternalLink className="h-3 w-3" />
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("policies")} className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 justify-start text-left">
                  Subscription Retention Rules
                  <ExternalLink className="h-3 w-3" />
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab("policies")} className="text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 justify-start text-left">
                  Billing & Retry Cycle Terms
                  <ExternalLink className="h-3 w-3" />
                </button>
              </li>
              <li className="pt-2 text-xs text-slate-400 border-t border-slate-200">
                <span className="font-semibold text-slate-600">Company Standard:</span> These official policy publications outline CloudBox's customer-facing subscription, refund, billing, and privacy terms.
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 sm:flex-row text-xs text-slate-400">
          <p>© {currentYear} CloudBox Inc. All rights reserved. Made in Bengaluru, India.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentTab("policies")} className="hover:text-slate-600 transition-colors">Privacy Policy</button>
            <span>•</span>
            <button onClick={() => setCurrentTab("policies")} className="hover:text-slate-600 transition-colors">Terms of Service</button>
            <span>•</span>
            <button onClick={() => setCurrentTab("support")} className="text-blue-600 bg-blue-50/50 hover:bg-blue-50 hover:text-blue-700 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 font-medium">
              Live Help Desk
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
