import { useCallback, useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { TRANSLATIONS } from "./i18n/translations";
import {
  AnalysisMode,
  CitySettings,
  ComplaintStatus,
  LanguageCode,
  NavPage,
  Ticket,
} from "./types/civic";
import {
  loadSettings,
  loadTickets,
  mergeDemoTickets,
  removeDemoTickets,
  saveSettings,
  saveTickets,
} from "./utils/storage";
import { Sidebar } from "./components/Sidebar";
import { ToastContainer, ToastItem } from "./components/Toast";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { TicketDetailModal } from "./components/TicketDetailModal";
import { DashboardPage } from "./pages/DashboardPage";
import { CitizenPortalPage } from "./pages/CitizenPortalPage";
import { TicketListPage } from "./pages/TicketListPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { SettingsPage } from "./pages/SettingsPage";

type ConfirmActionState =
  | { type: "delete-ticket"; ticket: Ticket }
  | { type: "clear-demo" }
  | { type: "clear-all" }
  | null;

export default function App() {
  const [tickets, setTickets] = useState<Ticket[]>(() => loadTickets());
  const ticketsRef = useRef<Ticket[]>(tickets);
  ticketsRef.current = tickets;

  const [settings, setSettings] = useState<CitySettings>(() => loadSettings());
  const [activePage, setActivePage] = useState<NavPage>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [recentTicketId, setRecentTicketId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [aiMode, setAiMode] = useState<AnalysisMode>("DEMO_MODE");
  const [aiModel, setAiModel] = useState<string | null>(null);

  const strings = TRANSLATIONS[settings.language] || TRANSLATIONS.en;

  const addToast = useCallback(
    (type: ToastItem["type"], message: string) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Check server AI health honestly on startup
  useEffect(() => {
    let active = true;
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!active || !data) return;
        setAiMode(data.aiAvailable ? "LIVE_AI" : "DEMO_MODE");
        setAiModel(data.model || null);
      })
      .catch(() => {
        if (!active) return;
        setAiMode("DEMO_MODE");
        setAiModel(null);
      });
    return () => {
      active = false;
    };
  }, []);

  // Keep shared state synced if storage changes in another tab
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "civiclens_tickets_v1") {
        const refreshed = loadTickets();
        ticketsRef.current = refreshed;
        setTickets(refreshed);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persistTickets = useCallback(
    (nextTickets: Ticket[]): { ok: boolean; error?: string } => {
      const result = saveTickets(nextTickets);
      if (result.ok) {
        ticketsRef.current = nextTickets;
        setTickets(nextTickets);
      } else {
        addToast("error", result.error || "Failed to save changes.");
      }
      return result;
    },
    [addToast]
  );

  const handleSubmitTicket = useCallback(
    (newTicket: Ticket): { ok: boolean; error?: string } => {
      const current = ticketsRef.current;
      const next = [newTicket, ...current.filter((t) => t.id !== newTicket.id)];
      const res = persistTickets(next);
      if (res.ok) {
        setRecentTicketId(newTicket.id);
      }
      return res;
    },
    [persistTickets]
  );

  const handleStatusChange = useCallback(
    (ticketId: string, newStatus: ComplaintStatus) => {
      const now = new Date().toISOString();
      const next = ticketsRef.current.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus, updatedAt: now } : t
      );
      const saved = persistTickets(next);
      if (saved.ok) {
        addToast("success", `Ticket ${ticketId} marked as ${newStatus}.`);
      }
    },
    [persistTickets, addToast]
  );

  const handleUpdateSettings = useCallback(
    (next: CitySettings) => {
      const res = saveSettings(next);
      if (res.ok) {
        setSettings(next);
        addToast("info", "Settings updated.");
      } else {
        addToast("error", res.error || "Failed to save settings.");
      }
    },
    [addToast]
  );

  const handleLanguageChange = useCallback(
    (lang: LanguageCode) => {
      const next = { ...settings, language: lang };
      const res = saveSettings(next);
      if (res.ok) {
        setSettings(next);
      }
    },
    [settings]
  );

  const handleLoadDemoData = useCallback(() => {
    const { tickets: merged, addedCount } = mergeDemoTickets(ticketsRef.current);
    if (addedCount === 0) {
      addToast("info", "All Bengaluru sample tickets are already loaded.");
      return;
    }
    const saved = persistTickets(merged);
    if (saved.ok) {
      addToast(
        "success",
        `Loaded ${addedCount} Bengaluru sample ticket${addedCount > 1 ? "s" : ""}.`
      );
    }
  }, [persistTickets, addToast]);

  const handleConfirmExecute = useCallback(() => {
    if (!confirmAction) return;
    const current = ticketsRef.current;

    if (confirmAction.type === "delete-ticket") {
      const id = confirmAction.ticket.id;
      const next = current.filter((t) => t.id !== id);
      const saved = persistTickets(next);
      if (saved.ok) {
        if (selectedTicketId === id) setSelectedTicketId(null);
        if (recentTicketId === id) setRecentTicketId(null);
        addToast("info", `Ticket ${id} deleted.`);
      }
    } else if (confirmAction.type === "clear-demo") {
      const { tickets: remaining, removedCount } = removeDemoTickets(current);
      const saved = persistTickets(remaining);
      if (saved.ok) {
        if (
          selectedTicketId &&
          !remaining.some((t) => t.id === selectedTicketId)
        ) {
          setSelectedTicketId(null);
        }
        addToast(
          "info",
          `Removed ${removedCount} demo ticket${removedCount === 1 ? "" : "s"}. Citizen complaints were preserved.`
        );
      }
    } else if (confirmAction.type === "clear-all") {
      const saved = persistTickets([]);
      if (saved.ok) {
        setSelectedTicketId(null);
        setRecentTicketId(null);
        addToast("info", "All tickets cleared from storage.");
      }
    }

    setConfirmAction(null);
  }, [
    confirmAction,
    persistTickets,
    selectedTicketId,
    recentTicketId,
    addToast,
  ]);

  const counts = {
    all: tickets.length,
    pending: tickets.filter((t) => t.status === "Pending").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter((t) => t.status === "Resolved").length,
  };

  const selectedTicket =
    selectedTicketId
      ? tickets.find((t) => t.id === selectedTicketId) || null
      : null;

  const pageLabelMap: Record<NavPage, string> = {
    dashboard: strings.nav.dashboard,
    citizen: strings.nav.citizen,
    all: strings.nav.all,
    pending: strings.nav.pending,
    "in-progress": strings.nav.inProgress,
    resolved: strings.nav.resolved,
    analytics: strings.nav.analytics,
    settings: strings.nav.settings,
  };

  return (
    <div className="min-h-screen flex bg-[#FAF9F5] text-[#0f1e36]">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        counts={counts}
        strings={strings}
        city={settings.city}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Clean 3-zone Top Header */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 rounded-lg text-[#0B2545] hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="font-display font-bold text-[#0B2545] whitespace-nowrap">
                CivicLens
              </span>
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
              <span className="font-medium text-slate-700 truncate">
                {pageLabelMap[activePage]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:inline text-xs font-medium text-slate-600 whitespace-nowrap">
              {aiMode === "LIVE_AI" ? "Gemini Live AI" : "DEMO MODE"}
            </span>
            {activePage !== "citizen" && (
              <button
                type="button"
                onClick={() => setActivePage("citizen")}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-[#0B2545] rounded-lg hover:bg-[#132E5B] transition-colors whitespace-nowrap shrink-0"
              >
                + Report Issue
              </button>
            )}
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {activePage === "dashboard" && (
            <DashboardPage
              tickets={tickets}
              strings={strings}
              city={settings.city}
              aiMode={aiMode}
              recentTicketId={recentTicketId}
              onNavigate={setActivePage}
              onViewTicket={(t) => setSelectedTicketId(t.id)}
              onStatusChange={handleStatusChange}
              onDeleteRequest={(t) =>
                setConfirmAction({ type: "delete-ticket", ticket: t })
              }
            />
          )}

          {activePage === "citizen" && (
            <CitizenPortalPage
              existingTickets={tickets}
              city={settings.city}
              language={settings.language}
              aiMode={aiMode}
              strings={strings}
              onLanguageChange={handleLanguageChange}
              onSubmitTicket={handleSubmitTicket}
              onViewTicket={(t) => setSelectedTicketId(t.id)}
              onNavigate={setActivePage}
              onNotify={addToast}
            />
          )}

          {activePage === "all" && (
            <TicketListPage
              title={strings.nav.all}
              subtitle="Complete municipal register across all departments and statuses."
              tickets={tickets}
              recentTicketId={recentTicketId}
              strings={strings}
              onNavigate={setActivePage}
              onViewTicket={(t) => setSelectedTicketId(t.id)}
              onStatusChange={handleStatusChange}
              onDeleteRequest={(t) =>
                setConfirmAction({ type: "delete-ticket", ticket: t })
              }
            />
          )}

          {activePage === "pending" && (
            <TicketListPage
              title={strings.nav.pending}
              subtitle="Newly submitted and reopened complaints awaiting officer assignment."
              tickets={tickets}
              statusScope="Pending"
              recentTicketId={recentTicketId}
              strings={strings}
              onNavigate={setActivePage}
              onViewTicket={(t) => setSelectedTicketId(t.id)}
              onStatusChange={handleStatusChange}
              onDeleteRequest={(t) =>
                setConfirmAction({ type: "delete-ticket", ticket: t })
              }
            />
          )}

          {activePage === "in-progress" && (
            <TicketListPage
              title={strings.nav.inProgress}
              subtitle="Complaints actively assigned to municipal field teams."
              tickets={tickets}
              statusScope="In Progress"
              recentTicketId={recentTicketId}
              strings={strings}
              onNavigate={setActivePage}
              onViewTicket={(t) => setSelectedTicketId(t.id)}
              onStatusChange={handleStatusChange}
              onDeleteRequest={(t) =>
                setConfirmAction({ type: "delete-ticket", ticket: t })
              }
            />
          )}

          {activePage === "resolved" && (
            <TicketListPage
              title={strings.nav.resolved}
              subtitle="Closed complaints verified as resolved by municipal officers."
              tickets={tickets}
              statusScope="Resolved"
              recentTicketId={recentTicketId}
              strings={strings}
              onNavigate={setActivePage}
              onViewTicket={(t) => setSelectedTicketId(t.id)}
              onStatusChange={handleStatusChange}
              onDeleteRequest={(t) =>
                setConfirmAction({ type: "delete-ticket", ticket: t })
              }
            />
          )}

          {activePage === "analytics" && (
            <AnalyticsPage
              tickets={tickets}
              city={settings.city}
              onNavigate={setActivePage}
            />
          )}

          {activePage === "settings" && (
            <SettingsPage
              settings={settings}
              aiMode={aiMode}
              aiModel={aiModel}
              tickets={tickets}
              onUpdateSettings={handleUpdateSettings}
              onLoadDemoData={handleLoadDemoData}
              onClearDemoDataRequest={() =>
                setConfirmAction({ type: "clear-demo" })
              }
              onClearAllDataRequest={() =>
                setConfirmAction({ type: "clear-all" })
              }
            />
          )}
        </main>
      </div>

      {/* Ticket Detail Modal */}
      <TicketDetailModal
        ticket={selectedTicket}
        strings={strings}
        onClose={() => setSelectedTicketId(null)}
        onStatusChange={handleStatusChange}
        onDeleteRequest={(t) =>
          setConfirmAction({ type: "delete-ticket", ticket: t })
        }
      />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmAction !== null}
        title={
          confirmAction?.type === "delete-ticket"
            ? `Delete Ticket ${confirmAction.ticket.id}?`
            : confirmAction?.type === "clear-demo"
            ? "Clear Demo Tickets?"
            : "Delete All Tickets?"
        }
        message={
          confirmAction?.type === "delete-ticket"
            ? `Are you sure you want to permanently delete "${confirmAction.ticket.summary}"? This action cannot be undone.`
            : confirmAction?.type === "clear-demo"
            ? "This will remove all sample demo tickets while keeping every complaint submitted through the Citizen Portal."
            : "This will permanently remove all complaints (both demo and citizen-submitted) from browser storage."
        }
        confirmLabel={
          confirmAction?.type === "delete-ticket"
            ? "Delete Ticket"
            : confirmAction?.type === "clear-demo"
            ? "Clear Demo Data"
            : "Delete All"
        }
        onConfirm={handleConfirmExecute}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
