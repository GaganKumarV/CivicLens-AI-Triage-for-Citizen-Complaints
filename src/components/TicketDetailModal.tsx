import React from "react";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Globe,
  MapPin,
  RotateCcw,
  Trash2,
  User,
  Wrench,
  X,
} from "lucide-react";
import { UIStrings } from "../i18n/translations";
import { ComplaintStatus, Ticket } from "../types/civic";
import { SeverityIndicator, StatusIndicator } from "./TicketBadge";

interface TicketDetailModalProps {
  ticket: Ticket | null;
  strings: UIStrings;
  onClose: () => void;
  onStatusChange: (ticketId: string, newStatus: ComplaintStatus) => void;
  onDeleteRequest: (ticket: Ticket) => void;
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  strings,
  onClose,
  onStatusChange,
  onDeleteRequest,
}) => {
  if (!ticket) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-detail-title"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-[#0B2545]/50 backdrop-blur-[1px]"
    >
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-[#FAF9F5]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-1.5">
              <span className="font-mono font-semibold text-[#0B2545] tabular-nums">
                {ticket.id}
              </span>
              <span aria-hidden="true">·</span>
              <span>{ticket.analysisMode === "LIVE_AI" ? "Gemini Live AI" : "DEMO MODE"}</span>
              {ticket.isDemo && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium text-amber-800">Sample Demo Ticket</span>
                </>
              )}
            </div>
            <h2
              id="ticket-detail-title"
              className="font-display text-lg font-bold text-[#0B2545] leading-snug"
            >
              {ticket.summary}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close ticket details"
            className="p-2 rounded-lg text-slate-500 hover:text-[#0B2545] hover:bg-slate-200/60 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status & Severity Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex flex-wrap items-center gap-2.5">
              <StatusIndicator
                status={ticket.status}
                label={strings.statuses[ticket.status]}
              />
              <SeverityIndicator severity={ticket.severity} />
            </div>
            <span className="text-xs font-medium text-slate-600">
              {ticket.category}
            </span>
          </div>

          {/* Severity Reasoning */}
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-semibold text-[#0B2545] mb-1">
              Triage Severity Rationale
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              {ticket.severityReason}
            </p>
          </div>

          {/* Full Description */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1.5">
              Citizen Description
            </p>
            <p className="text-sm text-[#0f1e36] leading-relaxed whitespace-pre-wrap">
              {ticket.description}
            </p>
          </div>

          {/* Photo Attachment if present */}
          {ticket.photoDataUrl && (
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">
                Attached Photo Evidence
              </p>
              <div className="rounded-lg border border-slate-200 overflow-hidden bg-slate-100">
                <img
                  src={ticket.photoDataUrl}
                  alt={`Evidence for ${ticket.id}`}
                  referrerPolicy="no-referrer"
                  className="w-full max-h-72 object-contain"
                />
              </div>
            </div>
          )}

          {/* Structured Metadata Grid */}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-sm">
            <div className="flex items-start gap-2.5">
              <Building2 className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-slate-500">Assigned Department</dt>
                <dd className="font-medium text-[#0B2545]">{ticket.department}</dd>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-slate-500">Location</dt>
                <dd className="font-medium text-[#0B2545]">{ticket.location}</dd>
                {ticket.coordinates && (
                  <dd className="font-mono text-xs text-slate-500 tabular-nums mt-0.5">
                    GPS: {ticket.coordinates.lat.toFixed(5)},{" "}
                    {ticket.coordinates.lng.toFixed(5)}
                  </dd>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-slate-500">Reported By</dt>
                <dd className="font-medium text-[#0B2545]">
                  {ticket.citizenName || "Anonymous Citizen"}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-slate-500">Detected Language</dt>
                <dd className="font-medium text-[#0B2545]">
                  {ticket.detectedLanguage}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-slate-500">Submitted On</dt>
                <dd className="font-mono text-xs font-medium text-[#0B2545] tabular-nums">
                  {formatDateTime(ticket.createdAt)}
                </dd>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <dt className="text-xs text-slate-500">Last Updated</dt>
                <dd className="font-mono text-xs font-medium text-[#0B2545] tabular-nums">
                  {formatDateTime(ticket.updatedAt)}
                </dd>
              </div>
            </div>
          </dl>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={() => onDeleteRequest(ticket)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>{strings.actions.delete}</span>
          </button>

          <div className="flex flex-wrap items-center gap-2.5">
            {ticket.status === "Pending" && (
              <button
                type="button"
                onClick={() => onStatusChange(ticket.id, "In Progress")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#0B2545] rounded-lg hover:bg-[#132E5B] transition-colors whitespace-nowrap shrink-0"
              >
                <Wrench className="w-4 h-4" />
                <span>{strings.actions.markInProgress}</span>
              </button>
            )}

            {ticket.status !== "Resolved" && (
              <button
                type="button"
                onClick={() => onStatusChange(ticket.id, "Resolved")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#138808] rounded-lg hover:bg-[#0f6e06] transition-colors whitespace-nowrap shrink-0"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{strings.actions.markResolved}</span>
              </button>
            )}

            {ticket.status !== "Pending" && (
              <button
                type="button"
                onClick={() => onStatusChange(ticket.id, "Pending")}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#9A4E00] bg-white border border-[#FF9933]/50 rounded-lg hover:bg-[#FF9933]/10 transition-colors whitespace-nowrap shrink-0"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{strings.actions.reopen}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
