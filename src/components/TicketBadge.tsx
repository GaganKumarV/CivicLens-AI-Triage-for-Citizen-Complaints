import React from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowDown,
  CheckCircle2,
  Clock,
  Minus,
  Wrench,
} from "lucide-react";
import { ComplaintSeverity, ComplaintStatus } from "../types/civic";

export const SeverityIndicator: React.FC<{ severity: ComplaintSeverity }> = ({
  severity,
}) => {
  const config: Record<
    ComplaintSeverity,
    {
      icon: React.ComponentType<{ className?: string }>;
      text: string;
      bg: string;
      border: string;
    }
  > = {
    Critical: {
      icon: AlertOctagon,
      text: "text-red-800",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    High: {
      icon: AlertTriangle,
      text: "text-amber-800",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    Medium: {
      icon: Minus,
      text: "text-[#0B2545]",
      bg: "bg-slate-100",
      border: "border-slate-200",
    },
    Low: {
      icon: ArrowDown,
      text: "text-slate-600",
      bg: "bg-slate-50",
      border: "border-slate-200",
    },
  };

  const c = config[severity];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border whitespace-nowrap shrink-0 ${c.bg} ${c.text} ${c.border}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{severity}</span>
    </span>
  );
};

export const StatusIndicator: React.FC<{
  status: ComplaintStatus;
  label?: string;
}> = ({ status, label }) => {
  const config: Record<
    ComplaintStatus,
    {
      icon: React.ComponentType<{ className?: string }>;
      text: string;
      bg: string;
      border: string;
    }
  > = {
    Pending: {
      icon: Clock,
      text: "text-[#9A4E00]",
      bg: "bg-[#FF9933]/12",
      border: "border-[#FF9933]/35",
    },
    "In Progress": {
      icon: Wrench,
      text: "text-[#0B2545]",
      bg: "bg-[#0B2545]/8",
      border: "border-[#0B2545]/25",
    },
    Resolved: {
      icon: CheckCircle2,
      text: "text-[#138808]",
      bg: "bg-[#138808]/10",
      border: "border-[#138808]/30",
    },
  };

  const c = config[status];
  const Icon = c.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold border whitespace-nowrap shrink-0 ${c.bg} ${c.text} ${c.border}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{label || status}</span>
    </span>
  );
};
