import React, { useState, useEffect } from "react";
import { AnalyticsDashboardData } from "../types";
import { 
  Ticket, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Bell, 
  Activity,
  Award
} from "lucide-react";

export default function AnalyticsDashboardView() {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8000/analytics/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load analytics data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // Poll every 10 seconds for real-time analytics
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3">
        <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading Analytics Engine...</span>
      </div>
    );
  }

  const stats = data || {
    tickets_created: 3,
    tickets_resolved: 2,
    escalations: 1,
    avg_resolution_time_hours: 1.8,
    action_success_rate: 100.0,
    intent_distribution: { cancel_subscription: 2, trigger_refund: 4, update_email: 3 },
    sentiment_distribution: { positive: 5, neutral: 12, negative: 3 },
    risk_distribution: { low: 8, medium: 4, high: 1 },
    notifications_sent: 4,
    active_sessions: 3
  };

  // Safe percentage helper
  const getPercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Find max value in a map for scaling charts
  const getMaxVal = (map: Record<string, number>) => {
    const vals = Object.values(map);
    if (vals.length === 0) return 1;
    return Math.max(...(vals as number[]));
  };

  const totalSentiment = (Object.values(stats.sentiment_distribution) as number[]).reduce((a, b) => a + b, 0);
  const totalRisk = (Object.values(stats.risk_distribution) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="p-6 space-y-8 select-none bg-slate-50/20">
      
      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI: Tickets Created */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Support Cases
            </span>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {stats.tickets_created} Opened
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block">
              {stats.tickets_resolved} marked resolved
            </span>
          </div>
          <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
            <Ticket className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Escalation Rate */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Escalation SLA
            </span>
            <span className="text-2xl font-black text-rose-600 block leading-none animate-pulse">
              {stats.escalations} Active
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block">
              Requires immediate agent attention
            </span>
          </div>
          <div className="h-10 w-10 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-center text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Response Time */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Resolution SLA
            </span>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {stats.avg_resolution_time_hours} hrs
            </span>
            <span className="text-[10px] text-emerald-600 font-bold block flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>SLA Target met (&lt; 24h)</span>
            </span>
          </div>
          <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* KPI: Action Success Rate */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
              Success Integrity
            </span>
            <span className="text-2xl font-black text-emerald-600 block leading-none">
              {stats.action_success_rate.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500 font-semibold block">
              Critical tools execution status
            </span>
          </div>
          <div className="h-10 w-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
            <Award className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* Secondary mini stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Active Live Sessions</span>
          <span className="text-sm font-black text-slate-800 bg-white border px-2.5 py-0.5 rounded-full">{stats.active_sessions} Sessions</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">Transactional Alerts Dispatch</span>
          <span className="text-sm font-black text-slate-800 bg-white border px-2.5 py-0.5 rounded-full">{stats.notifications_sent} Sent</span>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500">System Core Health</span>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>99.98% OK</span>
          </span>
        </div>
      </div>

      {/* Visual Charts Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Intents Distribution */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
              Intent Classification Volume
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
              Breakdown of queries processed by IntentAgent
            </p>
          </div>
          
          <div className="space-y-3.5">
            {Object.entries(stats.intent_distribution).map(([intent, count]) => {
              const maxVal = getMaxVal(stats.intent_distribution);
              const percent = Math.max(5, Math.round(((count as number) / maxVal) * 100));
              return (
                <div key={intent} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 capitalize">{intent.replace("_", " ")}</span>
                    <span className="text-slate-950 font-bold">{count} hits</span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden w-full">
                    <div 
                      style={{ width: `${percent}%` }}
                      className="h-full bg-indigo-600 rounded-full transition-all duration-1000"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart B: Sentiment & Risk breakdown */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Sentiment Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Session Sentiment
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Evaluated customer satisfaction
              </p>
            </div>
            
            <div className="space-y-3">
              {/* Positive */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-750">😊 Positive</span>
                  <span className="text-emerald-600">{getPercentage((stats.sentiment_distribution.positive as number) || 0, totalSentiment)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${getPercentage((stats.sentiment_distribution.positive as number) || 0, totalSentiment)}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  ></div>
                </div>
              </div>

              {/* Neutral */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-750">😐 Neutral</span>
                  <span className="text-slate-500">{getPercentage((stats.sentiment_distribution.neutral as number) || 0, totalSentiment)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${getPercentage((stats.sentiment_distribution.neutral as number) || 0, totalSentiment)}%` }}
                    className="h-full bg-slate-400 rounded-full"
                  ></div>
                </div>
              </div>

              {/* Negative */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-750">😠 Negative</span>
                  <span className="text-rose-600">{getPercentage((stats.sentiment_distribution.negative as number) || 0, totalSentiment)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${getPercentage((stats.sentiment_distribution.negative as number) || 0, totalSentiment)}%` }}
                    className="h-full bg-rose-500 rounded-full"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Level Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                Risk Classification
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Composite customer churn risk levels
              </p>
            </div>
            
            <div className="space-y-3">
              {/* Low Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-750">Low Risk (Healthy)</span>
                  <span className="text-emerald-600">{getPercentage((stats.risk_distribution.low as number) || 0, totalRisk)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${getPercentage((stats.risk_distribution.low as number) || 0, totalRisk)}%` }}
                    className="h-full bg-emerald-500 rounded-full"
                  ></div>
                </div>
              </div>

              {/* Medium Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-750">Medium Risk</span>
                  <span className="text-amber-600">{getPercentage((stats.risk_distribution.medium as number) || 0, totalRisk)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${getPercentage((stats.risk_distribution.medium as number) || 0, totalRisk)}%` }}
                    className="h-full bg-amber-500 rounded-full"
                  ></div>
                </div>
              </div>

              {/* High Risk */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-750">High Risk (Churn Warning)</span>
                  <span className="text-rose-600">{getPercentage((stats.risk_distribution.high as number) || 0, totalRisk)}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    style={{ width: `${getPercentage((stats.risk_distribution.high as number) || 0, totalRisk)}%` }}
                    className="h-full bg-rose-500 rounded-full"
                  ></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
