import React from "react";
import { FilePlus2 } from "lucide-react";
import { UIStrings } from "../i18n/translations";
import { ComplaintStatus, NavPage, Ticket } from "../types/civic";
import { ComplaintTable } from "../components/ComplaintTable";

interface TicketListPageProps {
  title: string;
  subtitle: string;
  tickets: Ticket[];
  statusScope?: ComplaintStatus;
  recentTicketId?: string | null;
  strings: UIStrings;
  onNavigate: (page: NavPage) => void;
  onViewTicket: (ticket: Ticket) => void;
  onStatusChange: (ticketId: string, newStatus: ComplaintStatus) => void;
  onDeleteRequest: (ticket: Ticket) => void;
}

export const TicketListPage: React.FC<TicketListPageProps> = ({
  title,
  subtitle,
  tickets,
  statusScope,
  recentTicketId = null,
  strings,
  onNavigate,
  onViewTicket,
  onStatusChange,
  onDeleteRequest,
}) => {
  const scopedTickets = statusScope
    ? tickets.filter((t) => t.status === statusScope)
    : tickets;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-display text-2xl font-bold text-[#0B2545]">
              {title}
            </h1>
            <span className="font-mono text-sm font-semibold text-[#0B2545] bg-slate-200/70 px-2 py-0.5 rounded tabular-nums">
              {scopedTickets.length}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("citizen")}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] rounded-lg hover:bg-[#132E5B] transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <FilePlus2 className="w-4 h-4 text-[#FF9933]" />
          <span>Report Civic Issue</span>
        </button>
      </div>

      <ComplaintTable
        tickets={scopedTickets}
        strings={strings}
        recentTicketId={recentTicketId}
        hideStatusFilter={Boolean(statusScope)}
        emptyTitle={
          statusScope
            ? `No ${statusScope} complaints`
            : "No complaints registered yet"
        }
        emptyDescription={
          statusScope
            ? `There are currently no tickets with status "${statusScope}".`
            : "Submit a complaint through the Citizen Portal or load Bengaluru sample data in Settings."
        }
        onEmptyAction={() => onNavigate("citizen")}
        emptyActionLabel="Open Citizen Portal"
        onViewTicket={onViewTicket}
        onStatusChange={onStatusChange}
        onDeleteRequest={onDeleteRequest}
      />
    </div>
  );
};
