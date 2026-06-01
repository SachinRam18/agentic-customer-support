import React, { useState } from "react";
import { 
  Cloud, 
  ShieldCheck, 
  Users, 
  History, 
  Share2, 
  RefreshCw, 
  Database,
  ArrowRight,
  Sparkles,
  BookOpen
} from "lucide-react";

interface FeaturesViewProps {
  setCurrentTab: (tab: string) => void;
}

export default function FeaturesView({ setCurrentTab }: FeaturesViewProps) {
  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = [
    {
      id: "sec_storage",
      icon: Cloud,
      color: "blue",
      title: "Secure Storage Console",
      headline: "Distributed storage architectures engineered for absolute data protection",
      desc: "CloudBox doesn't stack files in single physical units. We fragment files into encrypted segments distributed across nested, high-durability redundant nodes. This guarantees 99.999999999% ('eleven nines') target availability.",
      bulletPoints: [
        "Dynamic multi-region replication layers",
        "Instant metadata validation on read triggers",
        "Automatic server failure failovers without synchronization drift"
      ],
      techSpecs: "Block storage chunking, split-region availability nodes, TLS 1.3 encryption on transport pathways."
    },
    {
      id: "e2e_enc",
      icon: ShieldCheck,
      color: "emerald",
      title: "End-to-End Encryption (E2EE)",
      headline: "No clear-text files touch the cloud. Secrets are generated on-device.",
      desc: "Our zero-knowledge E2EE system wraps directory trees using AES-256-GCM configurations on the local client level. The generated private key passphrase never synchronizes to our cloud directories, isolating folders beyond our own admin capabilities.",
      bulletPoints: [
        "On-device key compilation",
        "No master decrypt passphrases saved on the cloud server",
        "Fully audit-compliant with international privacy legislations"
      ],
      techSpecs: "AES-256-GCM encryption, Argon2id client hashing algorithms, customer-held master key structures."
    },
    {
      id: "team_collab",
      icon: Users,
      color: "indigo",
      title: "Real-time Team Collaboration",
      headline: "Co-edit and synchronize company workspaces transparently",
      desc: "Establish virtual secure workspaces that support shared storage limits. Grant precise customer, contractor, and employee member permission trees without sacrificing localized file safety.",
      bulletPoints: [
        "Shared team directories with customizable read/write parameters",
        "Dynamic audit logs tracking member access history logs",
        "Workspace consolidation alerts tracking cross-user conflicts"
      ],
      techSpecs: "Operational transformation algorithms, visual member audit trails, granular team directory schemas."
    },
    {
      id: "file_sharing",
      icon: Share2,
      color: "rose",
      title: "Secure File Sharing",
      headline: "Generate encrypted share credentials with password constraints",
      desc: "Distribute access codes inside email or chat channels with professional constraints. Protect shared assets by setting force timestamps, password overlays, and digital maximum download thresholds.",
      bulletPoints: [
        "Cryptographically hashed download URLs",
        "Add multi-factor passwords or custom access verification steps",
        "Instant share revocation controls on live folders"
      ],
      techSpecs: "SHA-256 URL encoding, automatic cron-based link expiration schedules, dynamic authentication tokens."
    },
    {
      id: "version_hist",
      icon: History,
      color: "purple",
      title: "Deep Version History (365 days)",
      headline: "Rewind document cycles easily and recover from system mistakes",
      desc: "Never fear accidental file deletions or ransom lockouts. CloudBox registers incremental differentials, permitting users to restore historical files back to any historical second across up to a full year.",
      bulletPoints: [
        "Deduplicated delta-sync saves bandwidth",
        "Recover deleted file structures instantly from Trash within 30 days",
        "Detailed comparison audits showing file metadata evolution"
      ],
      techSpecs: "Incremental block-delta storage, automated Cron purgatory tracking, deduplicated structural logs."
    },
    {
      id: "cross_sync",
      icon: RefreshCw,
      color: "amber",
      title: "Cross-Platform Sync Daemon",
      headline: "Background synchronization nodes built for lightweight thread footprints",
      desc: "Install native synchronization engines on your client devices. Run incremental background task mirroring across macOS, Windows, Linux, iOS, and Android without slowing down workspace operations.",
      bulletPoints: [
        "Smart file prioritization rules based on size profiles",
        "Works offline with active file queue reconciliations upon reconnection",
        "Minimal background memory footprint (<50MB RAM)"
      ],
      techSpecs: "Native Rust-compiled daemon, multi-threaded worker pools, file-watcher event listener bindings."
    },
    {
      id: "auto_backup",
      icon: Database,
      color: "sky",
      title: "Automated Cold Backup Schedule",
      headline: "Hands-off periodic backups protecting physical drive failures",
      desc: "Schedule automated snapshot directories on your hard volumes. Select your critical folders and let CloudBox perform backup sweeps in the background during system idle periods.",
      bulletPoints: [
        "Trigger backups based on custom calendar schedules or network conditions",
        "Incremental sweeps save bandwidth limits",
        "Automated report emails tracking synchronization health indicators"
      ],
      techSpecs: "VSS (Volume Shadow Copy) bindings for Windows, FSEvents on macOS, strict background system priority tuning."
    }
  ];

  const currentFeatureDetails = features[selectedFeature];
  const IconComponent = currentFeatureDetails.icon;

  const colorStyles: Record<string, { bg: string; text: string; ring: string; banner: string }> = {
    blue: { bg: "bg-blue-50 text-blue-600", ring: "ring-blue-100", text: "text-blue-600", banner: "from-blue-600 to-indigo-600" },
    emerald: { bg: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100", text: "text-emerald-500", banner: "from-emerald-600 to-teal-600" },
    indigo: { bg: "bg-indigo-50 text-indigo-600", ring: "ring-indigo-100", text: "text-indigo-600", banner: "from-indigo-600 to-blue-700" },
    rose: { bg: "bg-rose-50 text-rose-600", ring: "ring-rose-100", text: "text-rose-500", banner: "from-rose-600 to-pink-600" },
    purple: { bg: "bg-purple-50 text-purple-600", ring: "ring-purple-100", text: "text-purple-600", banner: "from-purple-600 to-indigo-700" },
    amber: { bg: "bg-amber-50 text-amber-600", ring: "ring-amber-100", text: "text-amber-500", banner: "from-amber-500 to-orange-500" },
    sky: { bg: "bg-sky-50 text-sky-600", ring: "ring-sky-100", text: "text-sky-500", banner: "from-sky-500 to-blue-500" },
  };

  const activeStyles = colorStyles[currentFeatureDetails.color];

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Head Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Product Mechanics</span>
          </div>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            A secure cloud ecosystem built for compliance
          </h1>
          <p className="max-w-2xl mx-auto text-slate-500 text-sm sm:text-base leading-relaxed">
            Examine our core technology features below. Learn about the cryptographic, distributed, and client-side systems backing our subscriptions.
          </p>
        </div>

        {/* Feature Layout Split: Left List, Right Detailed Interactive View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Selection Column (Col span: 4) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-sans px-3">
              Explore Core Tech Modules
            </div>
            <div className="space-y-1">
              {features.map((feature, idx) => {
                const FeatIcon = feature.icon;
                const isSelected = selectedFeature === idx;
                const featColor = colorStyles[feature.color];
                return (
                  <button
                    key={feature.id}
                    id={`feat-btn-${feature.id}`}
                    onClick={() => setSelectedFeature(idx)}
                    className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-left text-sm font-semibold tracking-tight transition-all duration-200 ${
                      isSelected 
                        ? "bg-slate-100/90 text-slate-950 shadow-xs border-r-4 border-blue-600"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-100 ${
                      isSelected 
                        ? featColor.bg + " " + featColor.ring 
                        : "bg-white text-slate-400"
                    }`}>
                      <FeatIcon className="h-4.5 w-4.5" />
                    </div>
                    <span>{feature.title}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Direct Support Notice Card */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4.5 space-y-3.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <BookOpen className="h-4.5 w-4.5 text-blue-600" />
                <span>Compliance & Policy Center</span>
              </div>
              <p className="text-slate-500 leading-normal">
                These product specifications and capabilities align directly with our standard <span className="font-semibold text-slate-700">Support Policies</span> and Terms of Service.
              </p>
              <button 
                onClick={() => setCurrentTab("policies")} 
                className="font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                <span>View Company Policies</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Right Detailed Panel Column (Col span: 8) */}
          <div className="lg:col-span-8 rounded-3xl border border-slate-150/40 bg-white p-6 sm:p-8 shadow-md shadow-slate-100 space-y-6">
            
            {/* Header section with category color styling */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${activeStyles.bg} ring-8 ${activeStyles.ring}`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-sans text-xl font-bold text-slate-950">{currentFeatureDetails.title}</h2>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">CloudBox Secure Services Platform</p>
                </div>
              </div>
              
              <div className={`rounded-full px-3 py-1 text-xs font-semibold ${activeStyles.bg}`}>
                Verified Compliance Module
              </div>
            </div>

            {/* Main content body */}
            <div className="space-y-4">
              <h3 className="font-sans text-lg font-bold text-slate-900 leading-relaxed">
                {currentFeatureDetails.headline}
              </h3>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                {currentFeatureDetails.desc}
              </p>
            </div>

            {/* In-depth key specifications / bullets */}
            <div className="rounded-2xl bg-slate-50 p-5 space-y-3.5 border border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 font-sans">
                Key Technical Advantages
              </div>
              <ul className="space-y-2.5">
                {currentFeatureDetails.bulletPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mt-0.5">
                      ✓
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Micro specifications display */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 rounded-xl px-4 py-3.5 text-xs border border-slate-100/50">
              <span className="font-semibold text-slate-500 font-mono">SPECIFICATION_DEEPLINK:</span>
              <span className="text-slate-600 font-mono bg-white px-2 py-0.5 rounded border border-slate-150 text-right">
                {currentFeatureDetails.techSpecs}
              </span>
            </div>

            {/* CTA action row inside details panel */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 font-sans">
              <div className="text-xs text-slate-400">
                Have questions about these features? Visit our comprehensive Help Portal.
              </div>
              <button
                onClick={() => setCurrentTab("support")}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 shadow-sm transition-all text-center shrink-0"
              >
                <span>Visit Help Portal</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
