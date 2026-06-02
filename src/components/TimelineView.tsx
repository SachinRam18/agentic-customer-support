import React, { useEffect, useRef } from "react";
import { TimelineEvent } from "../types";
import { 
  Play, 
  Search, 
  Wrench, 
  Ticket, 
  AlertOctagon, 
  CheckCircle2, 
  HelpCircle, 
  Bell, 
  Lock, 
  ThumbsUp, 
  Sparkles,
  MessageSquare
} from "lucide-react";

interface TimelineViewProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

export default function TimelineView({ events, isLoading = false }: TimelineViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [events]);

  const getEventConfig = (type: string) => {
    switch (type) {
      case "chat_started":
        return {
          color: "bg-blue-500",
          icon: <Play className="h-3.5 w-3.5 text-white" />,
          label: "Session Started"
        };
      case "intent_detected":
        return {
          color: "bg-purple-500",
          icon: <Search className="h-3.5 w-3.5 text-white" />,
          label: "Intent Classified"
        };
      case "rag_retrieval":
        return {
          color: "bg-cyan-500",
          icon: <Sparkles className="h-3.5 w-3.5 text-white" />,
          label: "RAG Retrieval"
        };
      case "tool_called":
        return {
          color: "bg-amber-500",
          icon: <Wrench className="h-3.5 w-3.5 text-white" />,
          label: "Action Executed"
        };
      case "confirmation_requested":
        return {
          color: "bg-yellow-500",
          icon: <Lock className="h-3.5 w-3.5 text-white" />,
          label: "Confirmation Gate"
        };
      case "confirmation_received":
        return {
          color: "bg-emerald-500",
          icon: <ThumbsUp className="h-3.5 w-3.5 text-white" />,
          label: "Gate Cleared"
        };
      case "ticket_generated":
        return {
          color: "bg-orange-500",
          icon: <Ticket className="h-3.5 w-3.5 text-white" />,
          label: "Ticket Created"
        };
      case "escalation_triggered":
        return {
          color: "bg-rose-600 animate-pulse",
          icon: <AlertOctagon className="h-3.5 w-3.5 text-white" />,
          label: "Escalated"
        };
      case "resolution_completed":
        return {
          color: "bg-emerald-600",
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-white" />,
          label: "Resolved"
        };
      case "sentiment_alert":
        return {
          color: "bg-red-500",
          icon: <AlertOctagon className="h-3.5 w-3.5 text-white" />,
          label: "Sentiment Alert"
        };
      case "notification_sent":
        return {
          color: "bg-indigo-500",
          icon: <Bell className="h-3.5 w-3.5 text-white" />,
          label: "Notification Sent"
        };
      default:
        return {
          color: "bg-slate-400",
          icon: <MessageSquare className="h-3.5 w-3.5 text-white" />,
          label: type.replace("_", " ")
        };
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch (e) {
      return isoString;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-48 space-y-2">
        <div className="h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs text-slate-400 font-semibold">Loading timeline...</span>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-center px-4">
        <HelpCircle className="h-8 w-8 text-slate-350 mb-2 stroke-[1.5]" />
        <span className="text-xs text-slate-400 font-semibold">No timeline events recorded yet.</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-6 max-h-full space-y-6"
    >
      <div className="relative border-l border-slate-200 ml-4.5 space-y-6">
        {events.map((event, index) => {
          const config = getEventConfig(event.event_type);
          return (
            <div key={index} className="relative pl-6 select-none group">
              {/* Event Dot */}
              <div 
                className={`absolute -left-4 top-1 h-8 w-8 rounded-full border-4 border-white ${config.color} flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-105`}
              >
                {config.icon}
              </div>

              {/* Event Content Card */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 hover:border-slate-300 transition-all hover:bg-slate-100/50">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wide">
                    {config.label}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
                
                <p className="text-xs text-slate-650 leading-relaxed font-medium">
                  {event.description}
                </p>

                {/* Event Metadata (collapsible/expandable if large, showing raw details otherwise) */}
                {event.metadata && Object.keys(event.metadata).length > 0 && (
                  <div className="mt-2 text-[10px] bg-white border border-slate-150 rounded p-1.5 font-mono text-slate-500 overflow-x-auto whitespace-pre-wrap max-w-full">
                    {JSON.stringify(event.metadata, null, 2)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
