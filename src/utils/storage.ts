import { createSampleTickets } from "../data/sampleTickets";
import { CitySettings, Ticket } from "../types/civic";

const TICKETS_KEY = "civiclens_tickets_v1";
const SETTINGS_KEY = "civiclens_settings_v1";
const INIT_FLAG_KEY = "civiclens_initialized_v1";

const DEFAULT_SETTINGS: CitySettings = {
  city: "Bengaluru, Karnataka, India",
  language: "en",
};

export function loadTickets(): Ticket[] {
  try {
    const raw = window.localStorage.getItem(TICKETS_KEY);
    const initialized = window.localStorage.getItem(INIT_FLAG_KEY);

    if (!raw && !initialized) {
      const samples = createSampleTickets();
      window.localStorage.setItem(TICKETS_KEY, JSON.stringify(samples));
      window.localStorage.setItem(INIT_FLAG_KEY, "1");
      return samples;
    }

    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const nowMs = Date.now();
    return parsed.map((t) => {
      if (t?.isDemo && t?.createdAt && new Date(t.createdAt).getTime() > nowMs) {
        const pastIso = new Date(nowMs - 2 * 60 * 60 * 1000).toISOString();
        return { ...t, createdAt: pastIso, updatedAt: pastIso };
      }
      return t;
    });
  } catch (err) {
    console.error("Failed to load tickets from storage:", err);
    return [];
  }
}

export function saveTickets(tickets: Ticket[]): { ok: boolean; error?: string } {
  try {
    window.localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
    window.localStorage.setItem(INIT_FLAG_KEY, "1");
    return { ok: true };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Browser storage quota exceeded. Try removing large photo attachments.";
    return { ok: false, error: msg };
  }
}

export function loadSettings(): CitySettings {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      city: typeof parsed.city === "string" && parsed.city ? parsed.city : DEFAULT_SETTINGS.city,
      language: ["en", "kn", "hi"].includes(parsed.language)
        ? parsed.language
        : DEFAULT_SETTINGS.language,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: CitySettings): { ok: boolean; error?: string } {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return { ok: true };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to save settings.",
    };
  }
}

export function mergeDemoTickets(existing: Ticket[]): {
  tickets: Ticket[];
  addedCount: number;
} {
  const samples = createSampleTickets();
  const existingIds = new Set(existing.map((t) => t.id));
  const missingSamples = samples.filter((s) => !existingIds.has(s.id));
  const merged = [...existing, ...missingSamples];
  return {
    tickets: merged,
    addedCount: missingSamples.length,
  };
}

export function removeDemoTickets(existing: Ticket[]): {
  tickets: Ticket[];
  removedCount: number;
} {
  const kept = existing.filter((t) => !t.isDemo);
  return {
    tickets: kept,
    removedCount: existing.length - kept.length,
  };
}
