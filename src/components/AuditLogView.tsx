import React, { useState, useEffect } from "react";
import { AuditLogEntry } from "../types";
import { 
  ClipboardCheck, 
  Search, 
  Copy, 
  Check, 
  Filter, 
  Database,
  ShieldCheck,
  AlertOctagon,
  HelpCircle
} from "lucide-react";

export default function AuditLogView() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8000/audit/logs");
      if (res.ok) {
        const json = await res.json();
        setLogs(json);
      }
    } catch (e) {
      console.error("Failed to load audit logs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(JSON.stringify(logs, null, 2));
    alert("Full audit logs copied to clipboard!");
  };

  const handleCopyRow = (log: AuditLogEntry, idx: number) => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopiedId(idx);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLogs = logs.filter(log => {
    const matchCust = filterCustomer ? log.customer_id.toLowerCase().includes(filterCustomer.toLowerCase()) : true;
    const matchAct = filterAction ? log.action.toLowerCase().includes(filterAction.toLowerCase()) : true;
    return matchCust && matchAct;
  });

  return (
    <div className="p-6 space-y-6 font-sans select-none">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
            <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
            <span>Enterprise Security Audit Trail</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Trace system operations, agent reasoning, and multi-agent tool execution logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 px-3.5 shadow-xs transition-colors cursor-pointer"
          >
            Refresh Logs
          </button>
          
          <button
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 px-3.5 shadow-sm transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-2xl shrink-0">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Filter className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            placeholder="Filter by Customer ID..."
            className="w-full pl-9 pr-3 py-2 border border-slate-250 bg-white rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-750 font-medium"
          />
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Filter className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            placeholder="Filter by Action (e.g. trigger_refund, chat_message)..."
            className="w-full pl-9 pr-3 py-2 border border-slate-250 bg-white rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-slate-750 font-medium"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <div className="h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Loading Audit Logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-center">
            <Database className="h-8 w-8 text-slate-350 mb-2 stroke-[1.5]" />
            <span className="text-xs font-bold uppercase tracking-wider">No Audited Log Records Found</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-150">
                <tr>
                  <th className="py-3.5 px-5">Timestamp</th>
                  <th className="py-3.5 px-5">Customer ID</th>
                  <th className="py-3.5 px-5">Action</th>
                  <th className="py-3.5 px-5">Parameters</th>
                  <th className="py-3.5 px-5">Result</th>
                  <th className="py-3.5 px-5">Agent Reasoning</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-650">
                {filteredLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/20 transition-all">
                    <td className="py-4 px-5 whitespace-nowrap text-slate-400 font-bold">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap font-mono font-bold text-slate-900">
                      {log.customer_id}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <details className="text-[10px] cursor-pointer">
                        <summary className="hover:text-indigo-600 font-semibold select-none">View Params</summary>
                        <pre className="mt-1 bg-slate-50 border p-1.5 rounded font-mono text-[9px] max-w-[200px] overflow-x-auto">
                          {JSON.stringify(log.params)}
                        </pre>
                      </details>
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                        log.result === "success" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : log.result === "security_blocked" 
                            ? "bg-rose-50 text-rose-700 border-rose-100 animate-pulse" 
                            : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {log.result}
                      </span>
                    </td>
                    <td className="py-4 px-5 max-w-xs truncate font-semibold" title={log.agent_reasoning}>
                      {log.agent_reasoning}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleCopyRow(log, idx)}
                        className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-all"
                        title="Copy entry as JSON"
                      >
                        {copiedId === idx ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
