import React, { useMemo, useState } from "react";
import { FilePlus2 } from "lucide-react";
import {
  CATEGORIES,
  DEPARTMENTS,
  NavPage,
  SEVERITIES,
  Ticket,
} from "../types/civic";

interface AnalyticsPageProps {
  tickets: Ticket[];
  city: string;
  onNavigate: (page: NavPage) => void;
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: "#dc2626",
  High: "#d97706",
  Medium: "#0B2545",
  Low: "#64748b",
};

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  tickets,
  city,
  onNavigate,
}) => {
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  const total = tickets.length;

  const statusBreakdown = useMemo(() => {
    const pending = tickets.filter((t) => t.status === "Pending").length;
    const inProgress = tickets.filter((t) => t.status === "In Progress").length;
    const resolved = tickets.filter((t) => t.status === "Resolved").length;
    return { pending, inProgress, resolved };
  }, [tickets]);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    CATEGORIES.forEach((c) => map.set(c, 0));
    tickets.forEach((t) => map.set(t.category, (map.get(t.category) || 0) + 1));
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [tickets]);

  const severityCounts = useMemo(() => {
    return SEVERITIES.map((sev) => ({
      name: sev,
      count: tickets.filter((t) => t.severity === sev).length,
      color: SEVERITY_COLORS[sev],
    }));
  }, [tickets]);

  const departmentCounts = useMemo(() => {
    const map = new Map<string, number>();
    DEPARTMENTS.forEach((d) => map.set(d, 0));
    tickets.forEach((t) =>
      map.set(t.department, (map.get(t.department) || 0) + 1)
    );
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [tickets]);

  // Daily trend over last 7 days + any ticket dates
  const trendData = useMemo(() => {
    const dateMap = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dateMap.set(key, 0);
    }

    tickets.forEach((t) => {
      const dayKey = t.createdAt.slice(0, 10);
      dateMap.set(dayKey, (dateMap.get(dayKey) || 0) + 1);
    });

    return Array.from(dateMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-10)
      .map(([dateKey, count]) => {
        const dt = new Date(`${dateKey}T00:00:00`);
        const label = new Intl.DateTimeFormat("en-IN", {
          day: "2-digit",
          month: "short",
        }).format(dt);
        return { dateKey, label, count };
      });
  }, [tickets]);

  if (total === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            Municipal Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Live triage metrics for {city}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="font-display text-base font-semibold text-[#0B2545]">
            No complaint data to chart yet
          </p>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            Submit a complaint via the Citizen Portal or load Bengaluru demo tickets in Settings to see live analytics.
          </p>
          <button
            type="button"
            onClick={() => onNavigate("citizen")}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] rounded-lg hover:bg-[#132E5B]"
          >
            <FilePlus2 className="w-4 h-4 text-[#FF9933]" />
            <span>Submit First Complaint</span>
          </button>
        </div>
      </div>
    );
  }

  // Donut Ring Math
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const pendingPct = statusBreakdown.pending / total;
  const inProgPct = statusBreakdown.inProgress / total;
  const resolvedPct = statusBreakdown.resolved / total;

  const pendingLen = pendingPct * circumference;
  const inProgLen = inProgPct * circumference;
  const resolvedLen = resolvedPct * circumference;

  // Trend SVG Geometry
  const chartWidth = 640;
  const chartHeight = 200;
  const padX = 34;
  const padY = 24;
  const maxTrendCount = Math.max(1, ...trendData.map((d) => d.count));

  const trendPoints = trendData.map((d, idx) => {
    const x =
      trendData.length === 1
        ? chartWidth / 2
        : padX + (idx / (trendData.length - 1)) * (chartWidth - padX * 2);
    const y =
      chartHeight -
      padY -
      (d.count / maxTrendCount) * (chartHeight - padY * 2);
    return { ...d, x, y };
  });

  const linePath = trendPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  const areaPath =
    trendPoints.length > 0
      ? `${linePath} L ${trendPoints[trendPoints.length - 1].x} ${
          chartHeight - padY
        } L ${trendPoints[0].x} ${chartHeight - padY} Z`
      : "";

  const maxCatCount = Math.max(1, ...categoryCounts.map((c) => c.count));
  const maxDeptCount = Math.max(1, ...departmentCounts.map((d) => d.count));
  const maxSevCount = Math.max(1, ...severityCounts.map((s) => s.count));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0B2545]">
            Municipal Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Live triage breakdown computed directly from {total} active records in{" "}
            {city}
          </p>
        </div>
      </div>

      {/* Row 1: Pending vs Resolved Donut + Severity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending vs In Progress vs Resolved */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-display text-base font-bold text-[#0B2545]">
            Pending vs Resolved Status Split
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live workflow distribution across all complaints
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-8">
            <div className="relative w-40 h-40 shrink-0">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="16"
                />
                {pendingLen > 0 && (
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="#FF9933"
                    strokeWidth="16"
                    strokeDasharray={`${pendingLen} ${circumference}`}
                    strokeDashoffset={0}
                  />
                )}
                {inProgLen > 0 && (
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="#0B2545"
                    strokeWidth="16"
                    strokeDasharray={`${inProgLen} ${circumference}`}
                    strokeDashoffset={-pendingLen}
                  />
                )}
                {resolvedLen > 0 && (
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="none"
                    stroke="#138808"
                    strokeWidth="16"
                    strokeDasharray={`${resolvedLen} ${circumference}`}
                    strokeDashoffset={-(pendingLen + inProgLen)}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-mono text-2xl font-bold text-[#0B2545] tabular-nums">
                  {total}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  Total Tickets
                </span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-3">
              {[
                {
                  label: "Pending",
                  count: statusBreakdown.pending,
                  color: "bg-[#FF9933]",
                },
                {
                  label: "In Progress",
                  count: statusBreakdown.inProgress,
                  color: "bg-[#0B2545]",
                },
                {
                  label: "Resolved",
                  count: statusBreakdown.resolved,
                  color: "bg-[#138808]",
                },
              ].map((item) => {
                const pct = Math.round((item.count / total) * 100);
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-slate-100 last:border-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-3 h-3 rounded-sm shrink-0 ${item.color}`}
                      />
                      <span className="font-medium text-[#0f1e36]">
                        {item.label}
                      </span>
                    </div>
                    <div className="font-mono tabular-nums text-xs text-slate-600">
                      <span className="font-semibold text-[#0B2545] text-sm mr-1.5">
                        {item.count}
                      </span>
                      ({pct}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Complaints by Severity */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-display text-base font-bold text-[#0B2545]">
            Complaints by Severity
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Risk-weighted triage levels assigned by CivicLens
          </p>

          <div className="mt-6 space-y-4">
            {severityCounts.map((sev) => {
              const widthPct = Math.round((sev.count / maxSevCount) * 100);
              const sharePct = Math.round((sev.count / total) * 100);
              return (
                <div key={sev.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0B2545]">
                      {sev.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-600">
                      {sev.count} ({sharePct}%)
                    </span>
                  </div>
                  <div className="h-3 w-full rounded bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded transition-all duration-300"
                      style={{
                        width: `${sev.count === 0 ? 0 : Math.max(4, widthPct)}%`,
                        backgroundColor: sev.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Row 2: Complaints by Category & Complaints by Department */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints by Category */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-display text-base font-bold text-[#0B2545]">
            Complaints by Category
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Distribution across the 8 municipal issue domains
          </p>

          <div className="mt-5 space-y-3">
            {categoryCounts.map((cat) => {
              const widthPct = Math.round((cat.count / maxCatCount) * 100);
              return (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-medium text-[#0f1e36] truncate">
                      {cat.name}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#0B2545] shrink-0">
                      {cat.count}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded bg-[#0B2545] transition-all duration-300"
                      style={{
                        width: `${cat.count === 0 ? 0 : Math.max(3, widthPct)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Complaints by Department */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-display text-base font-bold text-[#0B2545]">
            Complaints by Department
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active municipal routing workload per department
          </p>

          <div className="mt-5 space-y-3">
            {departmentCounts.map((dept) => {
              const widthPct = Math.round((dept.count / maxDeptCount) * 100);
              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-medium text-[#0f1e36] truncate">
                      {dept.name}
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#138808] shrink-0">
                      {dept.count}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded bg-[#138808] transition-all duration-300"
                      style={{
                        width: `${dept.count === 0 ? 0 : Math.max(3, widthPct)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Row 3: Complaint Trend */}
      <section className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-display text-base font-bold text-[#0B2545]">
              Complaint Intake Trend
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily ticket volume by submission date
            </p>
          </div>

          {hoveredDayIndex !== null && trendPoints[hoveredDayIndex] && (
            <div className="font-mono text-xs bg-[#FAF9F5] border border-slate-200 px-3 py-1.5 rounded-lg text-[#0B2545] tabular-nums">
              {trendPoints[hoveredDayIndex].label}:{" "}
              <span className="font-bold">
                {trendPoints[hoveredDayIndex].count}
              </span>{" "}
              tickets
            </div>
          )}
        </div>

        <div className="mt-5 w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full min-w-[460px] h-52"
            role="img"
            aria-label="Complaint intake trend over time"
          >
            <defs>
              <linearGradient id="civicTrendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF9933" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#FF9933" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal reference lines */}
            {[0, 0.5, 1].map((ratio) => {
              const y =
                chartHeight - padY - ratio * (chartHeight - padY * 2);
              const val = Math.round(ratio * maxTrendCount);
              return (
                <g key={ratio}>
                  <line
                    x1={padX}
                    x2={chartWidth - padX}
                    y1={y}
                    y2={y}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padX - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="#64748b"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {areaPath && <path d={areaPath} fill="url(#civicTrendFill)" />}
            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke="#0B2545"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {trendPoints.map((pt, idx) => (
              <g
                key={pt.dateKey}
                onMouseEnter={() => setHoveredDayIndex(idx)}
                onMouseLeave={() => setHoveredDayIndex(null)}
                className="cursor-pointer"
              >
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredDayIndex === idx ? 6 : 4}
                  fill={hoveredDayIndex === idx ? "#FF9933" : "#0B2545"}
                  stroke="#ffffff"
                  strokeWidth="2"
                />
                <text
                  x={pt.x}
                  y={chartHeight - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#475569"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </section>
    </div>
  );
};
