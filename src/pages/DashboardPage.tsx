import React from "react";
import {
  AlertOctagon,
  BarChart3,
  CheckCircle2,
  Clock,
  FilePlus2,
  Layers,
  Wrench,
} from "lucide-react";
import { UIStrings } from "../i18n/translations";
import { AnalysisMode, ComplaintStatus, NavPage, Ticket } from "../types/civic";
import { AshokaEmblem } from "../components/AshokaEmblem";
import { ComplaintTable } from "../components/ComplaintTable";

interface DashboardPageProps {
  tickets: Ticket[];
  strings: UIStrings;
  city: string;
  aiMode: AnalysisMode;
  recentTicketId?: string | null;
  onNavigate: (page: NavPage) => void;
  onViewTicket: (ticket: Ticket) => void;
  onStatusChange: (ticketId: string, newStatus: ComplaintStatus) => void;
  onDeleteRequest: (ticket: Ticket) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  tickets,
  strings,
  city,
  aiMode,
  recentTicketId = null,
  onNavigate,
  onViewTicket,
  onStatusChange,
  onDeleteRequest,
}) => {
  const totalCount = tickets.length;
  const criticalCount = tickets.filter(
    (t) => t.severity === "Critical" && t.status !== "Resolved"
  ).length;
  const criticalTotalCount = tickets.filter(
    (t) => t.severity === "Critical"
  ).length;
  const pendingCount = tickets.filter((t) => t.status === "Pending").length;
  const inProgressCount = tickets.filter(
    (t) => t.status === "In Progress"
  ).length;
  const resolvedCount = tickets.filter((t) => t.status === "Resolved").length;

  const statCards: Array<{
    label: string;
    value: number;
    subtext: string;
    icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    iconColor: string;
    onClick?: () => void;
  }> = [
    {
      label: strings.stats.total,
      value: totalCount,
      subtext: "All registered tickets",
      icon: Layers,
      iconBg: "bg-[#0B2545]/8",
      iconColor: "text-[#0B2545]",
      onClick: () => onNavigate("all"),
    },
    {
      label: strings.stats.critical,
      value: criticalTotalCount,
      subtext: `${criticalCount} active critical`,
      icon: AlertOctagon,
      iconBg: "bg-red-50",
      iconColor: "text-red-700",
      onClick: () => onNavigate("all"),
    },
    {
      label: strings.stats.pending,
      value: pendingCount,
      subtext: "Awaiting officer action",
      icon: Clock,
      iconBg: "bg-[#FF9933]/15",
      iconColor: "text-[#9A4E00]",
      onClick: () => onNavigate("pending"),
    },
    {
      label: strings.stats.inProgress,
      value: inProgressCount,
      subtext: "Field team dispatched",
      icon: Wrench,
      iconBg: "bg-[#0B2545]/8",
      iconColor: "text-[#0B2545]",
      onClick: () => onNavigate("in-progress"),
    },
    {
      label: strings.stats.resolved,
      value: resolvedCount,
      subtext:
        totalCount > 0
          ? `${Math.round((resolvedCount / totalCount) * 100)}% closure rate`
          : "0% closure rate",
      icon: CheckCircle2,
      iconBg: "bg-[#138808]/12",
      iconColor: "text-[#138808]",
      onClick: () => onNavigate("resolved"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Command Header */}
      <section className="rounded-xl bg-[#0B2545] text-white p-6 relative overflow-hidden">
        <div
          className="absolute right-6 top-1/2 -translate-y-1/2 text-white/6 pointer-events-none hidden sm:block"
          aria-hidden="true"
        >
          <AshokaEmblem className="w-40 h-40" spin />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-[#FF9933] mb-1">
              {city} ·{" "}
              {aiMode === "LIVE_AI"
                ? "Gemini Live AI Triage Active"
                : "DEMO MODE Classification Active"}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Municipal Command Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-slate-300 leading-relaxed">
              Prioritized civic grievance queue sorted from Critical to Low severity. Every ticket routes directly to its municipal department.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate("analytics")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 transition-colors whitespace-nowrap shrink-0"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{strings.nav.analytics}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("citizen")}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0B2545] bg-[#FF9933] rounded-lg hover:bg-[#f08b24] transition-colors whitespace-nowrap shrink-0"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>File Citizen Complaint</span>
            </button>
          </div>
        </div>
      </section>

      {/* Real Calculated KPI Strip */}
      <section aria-label="Complaint statistics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.label}
                type="button"
                onClick={card.onClick}
                className="text-left bg-white rounded-xl border border-slate-200 p-4 hover:border-[#0B2545]/35 transition-colors flex flex-col justify-between gap-3"
              >
                <div className="flex items-center justify-between gap-2 w-full">
                  <span className="text-xs font-semibold text-slate-600">
                    {card.label}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${card.iconBg} ${card.iconColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                </div>

                <div>
                  <p className="font-mono text-2xl font-bold text-[#0B2545] tabular-nums">
                    {card.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">{card.subtext}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Officer Triage Queue Table */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-lg font-bold text-[#0B2545]">
              Priority Triage Queue
            </h2>
            <p className="text-xs text-slate-500">
              Default ordering: Critical → High → Medium → Low severity
            </p>
          </div>
        </div>

        <ComplaintTable
          tickets={tickets}
          strings={strings}
          recentTicketId={recentTicketId}
          onViewTicket={onViewTicket}
          onStatusChange={onStatusChange}
          onDeleteRequest={onDeleteRequest}
          onEmptyAction={() => onNavigate("citizen")}
          emptyActionLabel="Submit First Complaint"
        />
      </section>
    </div>
  );
};
