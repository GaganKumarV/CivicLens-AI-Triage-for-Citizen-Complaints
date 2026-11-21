import React, { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FilterX,
  RotateCcw,
  Search,
  Trash2,
  Wrench,
} from "lucide-react";
import { UIStrings } from "../i18n/translations";
import {
  CATEGORIES,
  ComplaintStatus,
  DEPARTMENTS,
  SEVERITIES,
  SEVERITY_RANK,
  STATUSES,
  Ticket,
} from "../types/civic";
import { SeverityIndicator, StatusIndicator } from "./TicketBadge";

type SortOption = "priority" | "newest" | "oldest";

interface ComplaintTableProps {
  tickets: Ticket[];
  strings: UIStrings;
  recentTicketId?: string | null;
  hideStatusFilter?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onEmptyAction?: () => void;
  emptyActionLabel?: string;
  onViewTicket: (ticket: Ticket) => void;
  onStatusChange: (ticketId: string, newStatus: ComplaintStatus) => void;
  onDeleteRequest: (ticket: Ticket) => void;
}

const PAGE_SIZE = 25;

function formatShortDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({
  tickets,
  strings,
  recentTicketId = null,
  hideStatusFilter = false,
  emptyTitle = "No complaints match your view",
  emptyDescription = "Try clearing your active filters or submit a new citizen complaint.",
  onEmptyAction,
  emptyActionLabel = "Report New Issue",
  onViewTicket,
  onStatusChange,
  onDeleteRequest,
}) => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [page, setPage] = useState(1);

  const hasActiveFilters =
    search.trim() !== "" ||
    categoryFilter !== "all" ||
    severityFilter !== "all" ||
    departmentFilter !== "all" ||
    (!hideStatusFilter && statusFilter !== "all") ||
    sortBy !== "priority";

  const clearAllFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setSeverityFilter("all");
    setDepartmentFilter("all");
    setStatusFilter("all");
    setSortBy("priority");
    setPage(1);
  };

  const filteredAndSorted = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = tickets.filter((t) => {
      if (categoryFilter !== "all" && t.category !== categoryFilter) return false;
      if (severityFilter !== "all" && t.severity !== severityFilter) return false;
      if (departmentFilter !== "all" && t.department !== departmentFilter)
        return false;
      if (!hideStatusFilter && statusFilter !== "all" && t.status !== statusFilter)
        return false;

      if (q) {
        const hay =
          `${t.id} ${t.summary} ${t.description} ${t.location} ${t.category} ${t.department} ${t.citizenName}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "priority") {
        const rankA = SEVERITY_RANK[a.severity] ?? 0;
        const rankB = SEVERITY_RANK[b.severity] ?? 0;
        const diff = rankB - rankA;
        if (diff !== 0) return diff;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  }, [
    tickets,
    search,
    categoryFilter,
    severityFilter,
    departmentFilter,
    statusFilter,
    hideStatusFilter,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedTickets = filteredAndSorted.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const recentTicket = recentTicketId
    ? filteredAndSorted.find((t) => t.id === recentTicketId) || null
    : null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Newly Submitted Ticket Quick-Jump Callout */}
      {recentTicket && (
        <div className="px-4 py-3 bg-[#138808]/8 border-b border-[#138808]/20 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <span className="font-semibold text-[#138808]">Just Submitted:</span>
            <span className="font-mono font-bold text-[#0B2545] tabular-nums">
              {recentTicket.id}
            </span>
            <span className="text-slate-400" aria-hidden="true">·</span>
            <span className="font-medium text-[#0f1e36] truncate max-w-md">
              {recentTicket.summary}
            </span>
            <span className="text-slate-400" aria-hidden="true">·</span>
            <span className="text-slate-600">{recentTicket.location}</span>
          </div>
          <button
            type="button"
            onClick={() => onViewTicket(recentTicket)}
            className="px-2.5 py-1 font-semibold text-[#0B2545] bg-white border border-slate-300 rounded-md hover:bg-slate-50 shrink-0"
          >
            {strings.actions.viewDetails}
          </button>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-[#FAF9F5]/70 space-y-3">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder={strings.actions.searchPlaceholder}
              aria-label="Search complaints"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-[#0B2545] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20 focus:border-[#0B2545]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as SortOption);
                setPage(1);
              }}
              aria-label="Sort complaints"
              className="px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
            >
              <option value="priority">Sort: Critical → Low</option>
              <option value="newest">Sort: Date (Newest)</option>
              <option value="oldest">Sort: Date (Oldest)</option>
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-[#0B2545] bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
              >
                <FilterX className="w-4 h-4" />
                <span>{strings.actions.clearFilters}</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by category"
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by severity"
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
          >
            <option value="all">All Severities</option>
            {SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => {
              setDepartmentFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by department"
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
          >
            <option value="all">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {!hideStatusFilter && (
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
            >
              <option value="all">All Statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {strings.statuses[st]}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSorted.length === 0 ? (
        <div className="px-6 py-14 text-center">
          <p className="font-display text-base font-semibold text-[#0B2545]">
            {emptyTitle}
          </p>
          <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
            {emptyDescription}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm font-medium text-[#0B2545] bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                {strings.actions.clearFilters}
              </button>
            )}
            {onEmptyAction && (
              <button
                type="button"
                onClick={onEmptyAction}
                className="px-4 py-2 text-sm font-medium text-white bg-[#0B2545] rounded-lg hover:bg-[#132E5B]"
              >
                {emptyActionLabel}
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600">
                  <th className="py-3 px-4 whitespace-nowrap">Ticket ID</th>
                  <th className="py-3 px-4">Complaint Summary</th>
                  <th className="py-3 px-4 whitespace-nowrap">Category</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4 whitespace-nowrap">Severity</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 whitespace-nowrap">Date</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedTickets.map((ticket) => {
                  const isRecent = recentTicketId === ticket.id;
                  return (
                  <tr
                    key={ticket.id}
                    className={`transition-colors ${
                      isRecent
                        ? "bg-[#138808]/6 hover:bg-[#138808]/10"
                        : "hover:bg-[#FAF9F5]"
                    }`}
                  >
                    <td className="py-3 px-4 align-top whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onViewTicket(ticket)}
                          className="font-mono text-xs font-semibold text-[#0B2545] hover:underline tabular-nums text-left"
                        >
                          {ticket.id}
                        </button>
                        {isRecent && (
                          <span className="text-[10px] font-semibold text-[#138808]">
                            New
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {ticket.isDemo ? "Demo" : ticket.analysisMode === "LIVE_AI" ? "Live AI" : "Demo Mode"}
                      </div>
                    </td>

                    <td className="py-3 px-4 align-top max-w-xs">
                      <button
                        type="button"
                        onClick={() => onViewTicket(ticket)}
                        className="text-left font-medium text-[#0f1e36] hover:text-[#0B2545] line-clamp-2 leading-snug"
                      >
                        {ticket.summary}
                      </button>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {ticket.detectedLanguage}
                      </div>
                    </td>

                    <td className="py-3 px-4 align-top text-xs text-slate-700 whitespace-nowrap">
                      {ticket.category}
                    </td>

                    <td className="py-3 px-4 align-top text-xs text-slate-700 max-w-[180px]">
                      <span className="line-clamp-2">{ticket.location}</span>
                    </td>

                    <td className="py-3 px-4 align-top whitespace-nowrap">
                      <SeverityIndicator severity={ticket.severity} />
                    </td>

                    <td className="py-3 px-4 align-top text-xs text-slate-700 max-w-[170px]">
                      <span className="line-clamp-2">{ticket.department}</span>
                    </td>

                    <td className="py-3 px-4 align-top font-mono text-xs text-slate-600 whitespace-nowrap tabular-nums">
                      {formatShortDate(ticket.createdAt)}
                    </td>

                    <td className="py-3 px-4 align-top whitespace-nowrap">
                      <StatusIndicator
                        status={ticket.status}
                        label={strings.statuses[ticket.status]}
                      />
                    </td>

                    <td className="py-3 px-4 align-top whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onViewTicket(ticket)}
                          title={strings.actions.viewDetails}
                          aria-label={`View details for ${ticket.id}`}
                          className="p-1.5 rounded-md text-slate-600 hover:text-[#0B2545] hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {ticket.status === "Pending" && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(ticket.id, "In Progress")}
                            title={strings.actions.markInProgress}
                            aria-label={`Mark ${ticket.id} In Progress`}
                            className="p-1.5 rounded-md text-[#0B2545] hover:bg-[#0B2545]/10 transition-colors"
                          >
                            <Wrench className="w-4 h-4" />
                          </button>
                        )}

                        {ticket.status !== "Resolved" && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(ticket.id, "Resolved")}
                            title={strings.actions.markResolved}
                            aria-label={`Mark ${ticket.id} Resolved`}
                            className="p-1.5 rounded-md text-[#138808] hover:bg-[#138808]/10 transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {ticket.status !== "Pending" && (
                          <button
                            type="button"
                            onClick={() => onStatusChange(ticket.id, "Pending")}
                            title={strings.actions.reopen}
                            aria-label={`Reopen ${ticket.id}`}
                            className="p-1.5 rounded-md text-[#9A4E00] hover:bg-[#FF9933]/15 transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteRequest(ticket)}
                          title={strings.actions.delete}
                          aria-label={`Delete ${ticket.id}`}
                          className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Card List */}
          <div className="md:hidden divide-y divide-slate-200">
            {paginatedTickets.map((ticket) => (
              <div key={ticket.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <button
                      type="button"
                      onClick={() => onViewTicket(ticket)}
                      className="font-mono text-xs font-semibold text-[#0B2545] tabular-nums"
                    >
                      {ticket.id}
                    </button>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {formatShortDate(ticket.createdAt)} · {ticket.category}
                    </div>
                  </div>
                  <SeverityIndicator severity={ticket.severity} />
                </div>

                <button
                  type="button"
                  onClick={() => onViewTicket(ticket)}
                  className="text-left block w-full"
                >
                  <p className="text-sm font-semibold text-[#0f1e36] leading-snug">
                    {ticket.summary}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {ticket.location} · {ticket.department}
                  </p>
                </button>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <StatusIndicator
                    status={ticket.status}
                    label={strings.statuses[ticket.status]}
                  />

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onViewTicket(ticket)}
                      className="px-2.5 py-1.5 text-xs font-medium text-[#0B2545] bg-slate-100 rounded-md"
                    >
                      Details
                    </button>
                    {ticket.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => onStatusChange(ticket.id, "In Progress")}
                        className="px-2.5 py-1.5 text-xs font-medium text-white bg-[#0B2545] rounded-md"
                      >
                        In Progress
                      </button>
                    )}
                    {ticket.status !== "Resolved" && (
                      <button
                        type="button"
                        onClick={() => onStatusChange(ticket.id, "Resolved")}
                        className="px-2.5 py-1.5 text-xs font-medium text-white bg-[#138808] rounded-md"
                      >
                        Resolve
                      </button>
                    )}
                    {ticket.status !== "Pending" && (
                      <button
                        type="button"
                        onClick={() => onStatusChange(ticket.id, "Pending")}
                        className="px-2.5 py-1.5 text-xs font-medium text-[#9A4E00] border border-[#FF9933]/40 rounded-md"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination & Count Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50/70 text-xs text-slate-600">
            <p className="font-mono tabular-nums">
              Showing {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, filteredAndSorted.length)} of{" "}
              {filteredAndSorted.length} complaints
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-label="Previous page"
                  className="p-1.5 rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-100"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono tabular-nums">
                  {safePage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-label="Next page"
                  className="p-1.5 rounded-md border border-slate-300 bg-white text-slate-700 disabled:opacity-40 hover:bg-slate-100"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
