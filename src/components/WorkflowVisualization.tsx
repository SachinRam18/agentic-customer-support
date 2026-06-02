import React, { useState, useEffect } from "react";
import { AgentWorkflowNode } from "../types";
import { 
  GitBranch, 
  Search, 
  HelpCircle, 
  Settings, 
  ShieldAlert, 
  Database,
  Lock,
  Play,
  RotateCw
} from "lucide-react";

export default function WorkflowVisualization() {
  const [nodes, setNodes] = useState<AgentWorkflowNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWorkflow = async () => {
    try {
      const res = await fetch("http://localhost:8000/agents/workflow");
      if (res.ok) {
        const json = await res.json();
        setNodes(json);
      }
    } catch (e) {
      console.warn("Failed to fetch agent workflow nodes", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflow();
    // Poll workflow structure
    const interval = setInterval(fetchWorkflow, 5000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading || nodes.length === 0) {
    // Default placeholder nodes if loading or backend is not responding
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-3 font-sans">
        <div className="h-8 w-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Syncing Multi-Agent State Graph...</span>
      </div>
    );
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case "intent": return <Search className="h-5 w-5" />;
      case "rag": return <Database className="h-5 w-5" />;
      case "escalation": return <ShieldAlert className="h-5 w-5" />;
      case "confirmation": return <Lock className="h-5 w-5" />;
      case "audit": return <HelpCircle className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getNodeColor = (status: string) => {
    if (status === "active") return {
      border: "border-blue-500 shadow-blue-100",
      bg: "bg-blue-50 text-blue-600",
      text: "text-blue-900",
      dot: "bg-blue-500 animate-ping"
    };
    if (status === "completed") return {
      border: "border-emerald-500 shadow-emerald-50",
      bg: "bg-emerald-50 text-emerald-600",
      text: "text-emerald-900",
      dot: "bg-emerald-500"
    };
    return {
      border: "border-slate-200 shadow-transparent",
      bg: "bg-slate-50 text-slate-400",
      text: "text-slate-500",
      dot: "bg-slate-300"
    };
  };

  return (
    <div className="p-6 space-y-6 font-sans select-none bg-slate-50/15">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
            <GitBranch className="h-4.5 w-4.5 text-indigo-600 rotate-90" />
            <span>Multi-Agent LangGraph Pipeline</span>
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
            Visual orchestrator graph tracing request routing and node execution statuses.
          </p>
        </div>
        
        <button
          onClick={fetchWorkflow}
          className="flex items-center justify-center gap-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-650 font-bold text-xs py-1.5 px-3 rounded-xl cursor-pointer active:scale-95 transition-all"
        >
          <RotateCw className="h-3 w-3" />
          <span>Refresh Graph</span>
        </button>
      </div>

      {/* Modern Visual Flowchart Graph */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xs relative flex flex-col items-center justify-center min-h-[480px] overflow-x-auto">
        
        {/* Connection arrows / visual line overlays */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="arrow-active" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
              <marker id="arrow-completed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
              </marker>
              <marker id="arrow-idle" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
              </marker>
            </defs>
            
            {/* Connection Lines between nodes */}
            {/* Intent -> RAG */}
            <path d="M 190 85 H 330" fill="none" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-completed)" />
            {/* RAG -> Orchestrator */}
            <path d="M 450 85 H 590" fill="none" stroke="#10b981" strokeWidth="2.5" markerEnd="url(#arrow-completed)" />
            
            {/* Orchestrator split down to Confirmation, Escalation, Support */}
            <path d="M 650 115 V 195 H 250 V 225" fill="none" stroke="#cbd5e1" strokeWidth="2.5" markerEnd="url(#arrow-idle)" />
            <path d="M 650 115 V 225" fill="none" stroke="#cbd5e1" strokeWidth="2.5" markerEnd="url(#arrow-idle)" />
            <path d="M 650 115 V 195 H 770 V 225" fill="none" stroke="#cbd5e1" strokeWidth="2.5" markerEnd="url(#arrow-idle)" />
            
            {/* Confirmation -> Tool Execution */}
            <path d="M 250 295 V 365" fill="none" stroke="#cbd5e1" strokeWidth="2.5" markerEnd="url(#arrow-idle)" />
            
            {/* Tool -> Audit */}
            <path d="M 250 435 V 455 H 510" fill="none" stroke="#cbd5e1" strokeWidth="2.5" markerEnd="url(#arrow-idle)" />
            
            {/* Escalation -> Audit */}
            <path d="M 510 295 V 455" fill="none" stroke="#cbd5e1" strokeWidth="2.5" markerEnd="url(#arrow-idle)" />
            
            {/* Support -> Audit */}
            <path d="M 770 295 V 455 H 510" fill="none" stroke="#cbd5e1" strokeWidth="2.5" markerEnd="url(#arrow-idle)" />
          </svg>
        </div>

        {/* Dynamic Nodes Grid Layout */}
        <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-y-16 gap-x-12 z-10">
          
          {/* Row 1: Setup Pipeline */}
          {/* Node 1: Intent classifier */}
          {nodes.find(n => n.id === "intent") && (() => {
            const node = nodes.find(n => n.id === "intent")!;
            const style = getNodeColor(node.status);
            return (
              <div className={`bg-white border-2 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 ${style.border}`}>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  {getNodeIcon(node.agent_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-wide truncate ${style.text}`}>{node.label}</h4>
                  <span className="text-[10px] font-bold text-slate-450 block mt-1 font-mono">Agent Node: Classified</span>
                </div>
                <span className={`h-2 w-2 rounded-full ${style.dot}`}></span>
              </div>
            );
          })()}

          {/* Node 2: RAG retrieval */}
          {nodes.find(n => n.id === "rag") && (() => {
            const node = nodes.find(n => n.id === "rag")!;
            const style = getNodeColor(node.status);
            return (
              <div className={`bg-white border-2 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 ${style.border}`}>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  {getNodeIcon(node.agent_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-wide truncate ${style.text}`}>{node.label}</h4>
                  <span className="text-[10px] font-bold text-slate-450 block mt-1 font-mono">Policy indexing match</span>
                </div>
                <span className={`h-2 w-2 rounded-full ${style.dot}`}></span>
              </div>
            );
          })()}

          {/* Node 3: Orchestrator Router */}
          {nodes.find(n => n.id === "orchestrator") && (() => {
            const node = nodes.find(n => n.id === "orchestrator")!;
            const style = getNodeColor(node.status);
            return (
              <div className={`bg-white border-2 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 ${style.border}`}>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  <GitBranch className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-wide truncate ${style.text}`}>{node.label}</h4>
                  <span className="text-[10px] font-bold text-slate-450 block mt-1 font-mono">Agent routing gate</span>
                </div>
                <span className={`h-2 w-2 rounded-full ${style.dot}`}></span>
              </div>
            );
          })()}

          {/* Row 2: Sub Agents Split */}
          {/* Node 4: Confirmation Guard */}
          {nodes.find(n => n.id === "confirmation") && (() => {
            const node = nodes.find(n => n.id === "confirmation")!;
            const style = getNodeColor(node.status);
            return (
              <div className={`bg-white border-2 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 ${style.border}`}>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  {getNodeIcon(node.agent_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-wide truncate ${style.text}`}>{node.label}</h4>
                  <span className="text-[10px] font-bold text-slate-450 block mt-1 font-mono">Approval Verification</span>
                </div>
                <span className={`h-2 w-2 rounded-full ${style.dot}`}></span>
              </div>
            );
          })()}

          {/* Node 5: Escalation specialist */}
          {nodes.find(n => n.id === "escalation") && (() => {
            const node = nodes.find(n => n.id === "escalation")!;
            const style = getNodeColor(node.status);
            return (
              <div className={`bg-white border-2 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 ${style.border}`}>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  {getNodeIcon(node.agent_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-wide truncate ${style.text}`}>{node.label}</h4>
                  <span className="text-[10px] font-bold text-slate-450 block mt-1 font-mono">Escalate ticket queue</span>
                </div>
                <span className={`h-2 w-2 rounded-full ${style.dot}`}></span>
              </div>
            );
          })()}

          {/* Node 6: Support core */}
          {nodes.find(n => n.id === "support") && (() => {
            const node = nodes.find(n => n.id === "support")!;
            const style = getNodeColor(node.status);
            return (
              <div className={`bg-white border-2 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 ${style.border}`}>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  {getNodeIcon(node.agent_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-wide truncate ${style.text}`}>{node.label}</h4>
                  <span className="text-[10px] font-bold text-slate-450 block mt-1 font-mono">Fulfill request response</span>
                </div>
                <span className={`h-2 w-2 rounded-full ${style.dot}`}></span>
              </div>
            );
          })()}

          {/* Row 3: Final execution & Audit logs */}
          {/* Node 7: Tool execution */}
          {nodes.find(n => n.id === "tool_execution") && (() => {
            const node = nodes.find(n => n.id === "tool_execution")!;
            const style = getNodeColor(node.status);
            return (
              <div className={`bg-white border-2 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 ${style.border}`}>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  <Play className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-wide truncate ${style.text}`}>{node.label}</h4>
                  <span className="text-[10px] font-bold text-slate-450 block mt-1 font-mono">Cancel/Refund operations</span>
                </div>
                <span className={`h-2 w-2 rounded-full ${style.dot}`}></span>
              </div>
            );
          })()}

          {/* Node 8: Audit Logging */}
          {nodes.find(n => n.id === "audit") && (() => {
            const node = nodes.find(n => n.id === "audit")!;
            const style = getNodeColor(node.status);
            return (
              <div className={`bg-white border-2 rounded-2xl p-4 shadow-sm flex items-center gap-3.5 ${style.border}`}>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${style.bg}`}>
                  <GitBranch className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-black uppercase tracking-wide truncate ${style.text}`}>{node.label}</h4>
                  <span className="text-[10px] font-bold text-slate-450 block mt-1 font-mono">Securing execution trail</span>
                </div>
                <span className={`h-2 w-2 rounded-full ${style.dot}`}></span>
              </div>
            );
          })()}

          {/* Empty spacer just to keep bento visual alignment */}
          <div></div>

        </div>

      </div>

    </div>
  );
}
