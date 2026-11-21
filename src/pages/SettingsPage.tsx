import React from "react";
import {
  Cpu,
  Database,
  Download,
  Globe,
  MapPin,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  AnalysisMode,
  CitySettings,
  LanguageCode,
  SUPPORTED_CITIES,
  Ticket,
} from "../types/civic";

interface SettingsPageProps {
  settings: CitySettings;
  aiMode: AnalysisMode;
  aiModel: string | null;
  tickets: Ticket[];
  onUpdateSettings: (next: CitySettings) => void;
  onLoadDemoData: () => void;
  onClearDemoDataRequest: () => void;
  onClearAllDataRequest: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  aiMode,
  aiModel,
  tickets,
  onUpdateSettings,
  onLoadDemoData,
  onClearDemoDataRequest,
  onClearAllDataRequest,
}) => {
  const demoCount = tickets.filter((t) => t.isDemo).length;
  const citizenCount = tickets.filter((t) => !t.isDemo).length;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0B2545]">
          CivicLens Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure municipality jurisdiction, display language, and manage demonstration datasets.
        </p>
      </div>

      {/* City & Language Configuration */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-display text-base font-bold text-[#0B2545]">
          Jurisdiction & Localization
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="settings-city"
              className="flex items-center gap-1.5 text-sm font-medium text-[#0B2545] mb-1.5"
            >
              <MapPin className="w-4 h-4 text-slate-500" />
              <span>Default City / Municipality</span>
            </label>
            <select
              id="settings-city"
              value={settings.city}
              onChange={(e) =>
                onUpdateSettings({ ...settings, city: e.target.value })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
            >
              {SUPPORTED_CITIES.map((c) => (
                <option key={c.code} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Used as the ticket ID prefix and default city context for triage.
            </p>
          </div>

          <div>
            <label
              htmlFor="settings-language"
              className="flex items-center gap-1.5 text-sm font-medium text-[#0B2545] mb-1.5"
            >
              <Globe className="w-4 h-4 text-slate-500" />
              <span>Interface Language</span>
            </label>
            <select
              id="settings-language"
              value={settings.language}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  language: e.target.value as LanguageCode,
                })
              }
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-[#0B2545] focus:outline-none focus:ring-2 focus:ring-[#0B2545]/20"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Updates navigation, citizen portal, and status labels immediately.
            </p>
          </div>
        </div>
      </section>

      {/* System Runtime Indicators */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-display text-base font-bold text-[#0B2545]">
          Engine & Storage Mode
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-lg border border-slate-200 bg-[#FAF9F5] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Cpu className="w-4 h-4 text-[#0B2545]" />
              <span>AI Classification Mode</span>
            </div>
            <p className="text-sm font-bold text-[#0B2545]">
              {aiMode === "LIVE_AI"
                ? `Live Gemini AI (${aiModel || "gemini-4-hydrogen"})`
                : "DEMO MODE (Multilingual Heuristic Classifier)"}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {aiMode === "LIVE_AI"
                ? "Server-side Gemini API key detected. New complaints are triaged with live LLM analysis and photo inspection."
                : "Live Gemini API key is unavailable on the server. Complaints are classified transparently using the built-in DEMO MODE multilingual triage engine."}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-[#FAF9F5] p-4 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Database className="w-4 h-4 text-[#138808]" />
              <span>Storage Mode</span>
            </div>
            <p className="text-sm font-bold text-[#0B2545]">
              Shared Browser localStorage (Persistent)
            </p>
            <p className="text-xs text-slate-600 leading-relaxed font-mono tabular-nums">
              {tickets.length} total tickets ({citizenCount} citizen-submitted ·{" "}
              {demoCount} demo)
            </p>
          </div>
        </div>
      </section>

      {/* Demo Data & Reset Controls */}
      <section className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div>
          <h2 className="font-display text-base font-bold text-[#0B2545]">
            Sample Data Management
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Loading demo data appends missing Bengaluru sample tickets without overwriting any complaints submitted through the Citizen Portal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onLoadDemoData}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#0B2545] rounded-lg hover:bg-[#132E5B] transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4 text-[#FF9933]" />
            <span>Load Demo Data</span>
          </button>

          <button
            type="button"
            disabled={demoCount === 0}
            onClick={onClearDemoDataRequest}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#9A4E00] bg-white border border-[#FF9933]/50 rounded-lg hover:bg-[#FF9933]/10 disabled:opacity-45 transition-colors whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear Demo Data ({demoCount})</span>
          </button>

          <button
            type="button"
            disabled={tickets.length === 0}
            onClick={onClearAllDataRequest}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-45 transition-colors whitespace-nowrap shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete All Tickets ({tickets.length})</span>
          </button>
        </div>
      </section>
    </div>
  );
};
