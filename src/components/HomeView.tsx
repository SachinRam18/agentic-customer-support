import React from "react";
import { 
  Cloud, 
  ShieldCheck, 
  Users, 
  History, 
  Share2, 
  RefreshCw, 
  Zap, 
  ArrowRight, 
  Sparkles,
  CheckCircle,
  TrendingUp,
  BrainCircuit
} from "lucide-react";

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
}

export default function HomeView({ setCurrentTab }: HomeViewProps) {
  return (
    <div className="relative overflow-hidden bg-white">
      
      {/* Background Graphic Grid Decorative Element */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.blue.50),white)] opacity-70"></div>
      <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white ring-1 ring-slate-500/5 [mask-image:radial-gradient(85%_85%_at_top,white,transparent)]"></div>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8 lg:pt-24 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center animate-fade-in">
          
          {/* Main Hero Context */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/80 px-4 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-700/10 hover:bg-blue-50 transition-colors pointer-events-none">
              <Sparkles className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
              <span>Next-Generation Cloud Storage & Synchronization</span>
            </div>

            <h1 className="font-sans text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05] sm:leading-none">
              Secure Cloud Storage for <br />
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
                Individuals and Teams
              </span>
            </h1>

            <p className="max-w-2xl mx-auto lg:mx-0 text-base sm:text-lg text-slate-500 leading-relaxed font-normal">
              Store, collaborate, back up, and share your critical document volumes under enterprise AES-256 military-grade encryption. Access files from any endpoint with zero-latency synchronization.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => setCurrentTab("pricing")}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-200 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all"
              >
                <span>View Subscription Plans</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              
              <button
                onClick={() => setCurrentTab("support")}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 px-7 py-3.5 text-sm font-semibold text-blue-700 shadow-xs transition-all"
              >
                <span>Go to Help Portal</span>
              </button>
            </div>

            {/* Small Spec List */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2.5 pt-4 text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>AES-256 Rest Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Zero-Knowledge Architecture</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>24/7 Dedicated Live Support</span>
              </div>
            </div>

          </div>

          {/* Hero Visual Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-[420px] rounded-3xl bg-slate-900/5 p-2 ring-1 ring-slate-900/10 lg:max-w-none shadow-[0_20px_50px_rgba(0,0,0,0.06)] bg-white">
              <div className="rounded-2xl border border-slate-100 bg-slate-950 p-6 shadow-xs text-white">
                
                {/* Header widget */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-rose-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500"></div>
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 tracking-wide">cloudbox_client_v1.2.dmg</span>
                </div>

                {/* Storage Meter Widget */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Safe Node Quota (Professional)</span>
                      <span className="text-blue-400 font-bold font-mono">68% Used</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full w-[68%] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    </div>
                  </div>

                  {/* Virtual Files */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2 text-xs border border-slate-800">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-400" />
                        <span className="font-mono font-medium text-slate-200">payroll_q2_encrypted.pdf</span>
                      </div>
                      <span className="text-slate-500 font-mono">42.8 MB</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2 text-xs border border-slate-800">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="font-mono font-medium text-slate-200">team_shared_resources/</span>
                      </div>
                      <span className="text-slate-500 font-mono">18 Files</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-slate-900 p-2 text-xs border border-slate-800">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 text-indigo-400" />
                        <span className="font-mono font-medium text-slate-200">system_config_daemon.ini</span>
                      </div>
                      <span className="text-emerald-400 font-mono font-semibold">Synced</span>
                    </div>
                  </div>

                  {/* Connected Widget */}
                  <div className="flex items-center justify-between bg-emerald-950/40 p-3 rounded-lg border border-emerald-900/40 mt-1">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0 animate-pulse" />
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">Continuous Sync Process Active</div>
                        <div className="text-[11px] text-slate-300 font-normal">Your local folders are secured. Check the help portal for self-service actions.</div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Trust & Introduction section */}
      <section className="bg-slate-50 border-y border-slate-100 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Trusted by fast-growing modern enterprises and security-first engineering companies
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale opacity-65">
            <div className="text-lg font-bold font-sans text-slate-700 tracking-tight flex items-center gap-1">
              <Cloud className="h-5 w-5 text-blue-600 shrink-0" /> StorageHQ
            </div>
            <div className="text-lg font-extrabold font-sans text-slate-700 tracking-tight flex items-center gap-1">
              <Zap className="h-5 w-5 text-indigo-600 shrink-0" /> VoltSync
            </div>
            <div className="text-lg font-semibold font-sans text-slate-700 tracking-tight flex items-center gap-1">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" /> ArmorVault
            </div>
            <div className="text-lg font-bold font-sans text-slate-700 tracking-tight flex items-center gap-1">
              <Cloud className="h-5 w-5 text-indigo-600 shrink-0" /> CloudBase
            </div>
          </div>
        </div>
      </section>

      {/* Services/Core Features Grid Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-sans">Core Offerings</h2>
          <p className="font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Everything your team needs to secure critical assets
          </p>
          <p className="max-w-2xl mx-auto text-slate-500 text-sm sm:text-base leading-relaxed">
            Discover our high-capacity subscription services styled specifically to host your mission-critical file workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service 1 */}
          <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 transition-all duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Cloud className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-sans text-lg font-bold text-slate-900">Personal Cloud Storage</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Simple high-speed directories for your digital files. Safely upload snapshots, archives, media, and folders with robust access rules.
              </p>
            </div>
          </div>

          {/* Service 2 */}
          <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 transition-all duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-sans text-lg font-bold text-slate-900">Team Collaboration</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Construct virtual folder workspaces with custom member credentials. Co-edit and synchronize resources live with absolute visual safety.
              </p>
            </div>
          </div>

          {/* Service 3 */}
          <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 transition-all duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-sans text-lg font-bold text-slate-900">Automated Backup</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Run background desktop backup scripts periodically. Schedule incremental image sync operations without overloading CPU threads.
              </p>
            </div>
          </div>

          {/* Service 4 */}
          <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 transition-all duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Share2 className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-sans text-lg font-bold text-slate-900">Secure File Sharing</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Generate secure sharing URLs with configurable passwords, expiry timestamps, and cryptographic download hashes.
              </p>
            </div>
          </div>

          {/* Service 5 */}
          <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 transition-all duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <History className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-sans text-lg font-bold text-slate-900">Version History Tracking</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Revert document structures back in time. Retrieve old variants easily across standard periods of up to 365 days.
              </p>
            </div>
          </div>

          {/* Solution 6 */}
          <div className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-md hover:shadow-slate-100 transition-all duration-300">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-sans text-lg font-bold text-slate-900">Cross-Platform sync</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Native integrations for macOS, Windows, Linux, Android, and iOS. Automatic offline file caching guarantees structural continuity.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Redirect Action */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setCurrentTab("features")}
            className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer group"
          >
            <span>Learn more about CloudBox file mechanics</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Benefits section */}
      <section className="bg-slate-50 py-20 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Uncompromising Security</span>
              </div>
              <h2 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                True Zero-Knowledge architecture built directly on client devices
              </h2>
              <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
                Unlike traditional storage providers where employees hold secondary deciphering master tokens, CloudBox isolates raw encryption blocks. Cryptographic password hashing occurs before data packet transmission, shielding folders against bad actors, legal audits, and internal breaches.
              </p>
              
              <ul className="space-y-3 pt-2">
                {[
                  "No clear-text files touch external cloud centers",
                  "Double-encapsulated file transfer tunnels (TLS 1.3)",
                  "Isolated customer-held key storage directories",
                  "Automated session termination on secondary devices",
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Dashboard Visualizer for Customer Service suitability */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-md shadow-slate-100/50 space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-2">
                  <Cloud className="h-5 w-5 text-blue-600" />
                  <span className="font-sans text-sm font-bold text-slate-950">Active Sync Locations & Status</span>
                </div>
                <span className="rounded-md bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 uppercase tracking-wide">All Nodes Active</span>
              </div>

              {/* Simulation steps visualized */}
              <div className="space-y-4 text-xs">
                <div>
                  <div className="font-semibold text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">1. GLOBAL REDUNDANCY LAYER</div>
                  <div className="rounded-lg bg-slate-50 p-3 text-slate-600 border border-slate-100">
                    Your files are simultaneously partitioned and securely replicated across three multi-region hubs for fail-safe retrieval.
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">2. SYSTEM SYNCHRONIZATION ENDPOINTS</div>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div className="bg-slate-50/50 p-2 rounded border border-slate-100 flex items-center justify-between">
                      <span className="font-mono">macOS Client:</span>
                      <span className="text-emerald-600 font-bold font-mono">ONLINE</span>
                    </div>
                    <div className="bg-slate-50/50 p-2 rounded border border-slate-100 flex items-center justify-between">
                      <span className="font-mono">Windows App:</span>
                      <span className="text-emerald-600 font-bold font-mono">ONLINE</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-slate-400 mb-1.5 uppercase tracking-wider text-[10px]">3. FILE TRANSFER SPEED RATINGS</div>
                  <div className="rounded-lg bg-blue-50/50 p-2 text-slate-700 font-medium border border-blue-100/30">
                    ⚡ Express Sync: Streamed 1.2 GB in 8.4 seconds (Approx. 142 MB/s burst speeds).
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentTab("support")}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-3 tracking-tight shadow-sm transition-all"
              >
                <span>Need Customer Assistance? Visit Open Support</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* Customer Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 font-sans">Social Proof</h2>
          <p className="font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Trusted by modern teams worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              quote: "CloudBox simplified our entire asset backup flow. File restoration cycles that historically took hours now complete in seconds. Truly zero knowledge.",
              author: "Marcus Vance",
              role: "Head of Infrastructure, StorageHQ",
              img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80"
            },
            {
              quote: "Our data compliance officers absolute prioritize CloudBox. The AES-256 local key generator and strict zero employee-access rules make compliance auditing extremely clean.",
              author: "Helena Rostova",
              role: "Chief Compliance Officer, ArmorVault Ltd",
              img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80"
            },
            {
              quote: "The multi-user folder synchronization is perfect. We coordinate design iterations across six time zones with zero folder lock collisions or slow loading delays. CloudBox is our team's structural back-office backbone.",
              author: "David Kim",
              role: "Director of Product, CreativeStudio Inc",
              img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=120&h=120&q=80"
            }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col justify-between p-6 rounded-2xl border border-slate-100 bg-white shadow-xs">
              <p className="text-slate-500 text-sm leading-relaxed italic mb-6">
                "{item.quote}"
              </p>
              <div className="flex items-center gap-3 border-t border-slate-50 pt-4">
                <img src={item.img} alt={item.author} className="h-10 w-10 rounded-full bg-slate-100" referrerPolicy="no-referrer" />
                <div>
                  <div className="text-sm font-bold text-slate-900">{item.author}</div>
                  <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">{item.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview Section CTA */}
      <section className="bg-slate-900 text-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-sans text-2xl sm:text-3.5xl font-extrabold tracking-tight">
            Ready to secure your cloud environments?
          </h2>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            Choose from Starter, Professional, or Enterprise tiers. Toggle billing schedules easily and unlock priority zero-delay support channels.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setCurrentTab("pricing")}
              className="rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 hover:scale-[1.01] transition-all"
            >
              Configure Subscription Plan (From ₹199)
            </button>
            <button
              onClick={() => setCurrentTab("policies")}
              className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 px-8 py-3.5 text-sm font-semibold text-slate-200 transition-all"
            >
              Review Compliance Documents
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
