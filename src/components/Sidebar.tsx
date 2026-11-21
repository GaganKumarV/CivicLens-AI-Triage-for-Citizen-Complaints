import React from "react";
import {
  BarChart3,
  CheckCircle2,
  Clock,
  FilePlus2,
  LayoutDashboard,
  ListChecks,
  Settings,
  Wrench,
  X,
} from "lucide-react";
import { UIStrings } from "../i18n/translations";
import { NavPage } from "../types/civic";
import { AshokaEmblem } from "./AshokaEmblem";

interface SidebarProps {
  activePage: NavPage;
  onNavigate: (page: NavPage) => void;
  counts: {
    all: number;
    pending: number;
    inProgress: number;
    resolved: number;
  };
  strings: UIStrings;
  city: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  counts,
  strings,
  city,
  mobileOpen,
  onCloseMobile,
}) => {
  const navItems: Array<{
    id: NavPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    section: "primary" | "queues" | "system";
  }> = [
    {
      id: "dashboard",
      label: strings.nav.dashboard,
      icon: LayoutDashboard,
      section: "primary",
    },
    {
      id: "citizen",
      label: strings.nav.citizen,
      icon: FilePlus2,
      section: "primary",
    },
    {
      id: "all",
      label: strings.nav.all,
      icon: ListChecks,
      count: counts.all,
      section: "queues",
    },
    {
      id: "pending",
      label: strings.nav.pending,
      icon: Clock,
      count: counts.pending,
      section: "queues",
    },
    {
      id: "in-progress",
      label: strings.nav.inProgress,
      icon: Wrench,
      count: counts.inProgress,
      section: "queues",
    },
    {
      id: "resolved",
      label: strings.nav.resolved,
      icon: CheckCircle2,
      count: counts.resolved,
      section: "queues",
    },
    {
      id: "analytics",
      label: strings.nav.analytics,
      icon: BarChart3,
      section: "system",
    },
    {
      id: "settings",
      label: strings.nav.settings,
      icon: Settings,
      section: "system",
    },
  ];

  const handleSelect = (page: NavPage) => {
    onNavigate(page);
    onCloseMobile();
  };

  const renderGroup = (section: "primary" | "queues" | "system", heading: string) => {
    const items = navItems.filter((item) => item.section === section);
    return (
      <div className="mb-5">
        <p className="px-3 mb-1.5 text-xs font-medium text-slate-400">
          {heading}
        </p>
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap ${
                    active
                      ? "bg-white/12 text-white"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        active ? "text-[#FF9933]" : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {typeof item.count === "number" && (
                    <span
                      className={`font-mono tabular-nums text-xs ${
                        active ? "text-[#FF9933] font-semibold" : "text-slate-400"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const sidebarBody = (
    <div className="flex flex-col h-full bg-[#0B2545] text-white w-64 shrink-0">
      {/* Subtle Indian Tricolour top edge */}
      <div className="h-1 w-full flex shrink-0" aria-hidden="true">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Brand header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#FF9933] shrink-0">
            <AshokaEmblem className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-base tracking-tight text-white truncate">
              CivicLens
            </p>
            <p className="text-xs text-slate-300 truncate">
              {city.split(",")[0]} Municipal Desk
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav aria-label="Primary navigation" className="flex-1 overflow-y-auto px-3 py-5">
        {renderGroup("primary", "Workspace")}
        {renderGroup("queues", "Ticket Queues")}
        {renderGroup("system", "Insights & Config")}
      </nav>

      {/* Quiet footer */}
      <div className="px-5 py-4 border-t border-white/10 text-xs text-slate-400">
        <p className="truncate font-medium text-slate-300">{city}</p>
        <p className="mt-0.5 text-slate-400">EN · ಕನ್ನಡ · हिन्दी</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block shrink-0">{sidebarBody}</aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#0B2545]/50 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 flex h-full">{sidebarBody}</div>
        </div>
      )}
    </>
  );
};
