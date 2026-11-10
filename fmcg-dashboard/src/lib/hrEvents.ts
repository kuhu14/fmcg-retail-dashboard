export type CompanyEventType = "Public holiday" | "Company holiday" | "Optional holiday";

export interface CompanyEvent {
  id: string;
  date: string; // "YYYY-MM-DD"
  name: string;
  type: CompanyEventType;
  custom?: boolean;
}

const STORAGE_KEY = "fmcg-hr-custom-events";
const CHANGE_EVENT = "fmcg-hr-events-changed";

function notifyChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGE_EVENT));
}

// Every useHrEvents() instance (Overview's tile, the HR calendar, etc.) keeps
// its own copy of this state -- subscribing here is what keeps them in sync
// with each other within the same tab (a "storage" event alone wouldn't fire
// in the tab that made the change).
export function onEventsChanged(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

// Built-in company calendar for 2026. HR-added events (see loadCustomEvents)
// are layered on top of this at render time, never written back into it.
const DEFAULT_EVENTS: CompanyEvent[] = [
  { id: "default-2026-01-01", date: "2026-01-01", name: "New Year's Day", type: "Public holiday" },
  { id: "default-2026-01-26", date: "2026-01-26", name: "Republic Day", type: "Public holiday" },
  { id: "default-2026-03-04", date: "2026-03-04", name: "Holi", type: "Public holiday" },
  { id: "default-2026-03-20", date: "2026-03-20", name: "Eid al-Fitr", type: "Optional holiday" },
  { id: "default-2026-04-03", date: "2026-04-03", name: "Good Friday", type: "Optional holiday" },
  { id: "default-2026-05-01", date: "2026-05-01", name: "May Day", type: "Public holiday" },
  { id: "default-2026-08-15", date: "2026-08-15", name: "Independence Day", type: "Public holiday" },
  { id: "default-2026-08-28", date: "2026-08-28", name: "Raksha Bandhan", type: "Company holiday" },
  { id: "default-2026-10-02", date: "2026-10-02", name: "Gandhi Jayanti", type: "Public holiday" },
  { id: "default-2026-10-20", date: "2026-10-20", name: "Dussehra", type: "Public holiday" },
  { id: "default-2026-11-08", date: "2026-11-08", name: "Diwali", type: "Public holiday" },
  { id: "default-2026-12-25", date: "2026-12-25", name: "Christmas Day", type: "Public holiday" },
];

function loadCustomEvents(): CompanyEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCustomEvents(events: CompanyEvent[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) -- the event just
    // won't persist across reloads; the UI already reflects it this session.
  }
}

export function getAllEvents(): CompanyEvent[] {
  const combined = [...DEFAULT_EVENTS, ...loadCustomEvents()];
  return combined.sort((a, b) => a.date.localeCompare(b.date));
}

export function addCustomEvent(input: { date: string; name: string; type: CompanyEventType }): CompanyEvent {
  const event: CompanyEvent = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: input.date,
    name: input.name,
    type: input.type,
    custom: true,
  };
  const existing = loadCustomEvents();
  saveCustomEvents([...existing, event]);
  notifyChanged();
  return event;
}

export function removeCustomEvent(id: string): void {
  saveCustomEvents(loadCustomEvents().filter((e) => e.id !== id));
  notifyChanged();
}

function toLocalDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function getNextEvent(events: CompanyEvent[], from: Date = new Date()): CompanyEvent | null {
  if (events.length === 0) return null;
  const todayIso = from.toISOString().slice(0, 10);
  const upcoming = events.filter((e) => e.date >= todayIso).sort((a, b) => a.date.localeCompare(b.date));
  return upcoming[0] ?? [...events].sort((a, b) => a.date.localeCompare(b.date))[0];
}

export function daysUntil(dateIso: string, from: Date = new Date()): number {
  const target = toLocalDate(dateIso);
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const diffMs = target.getTime() - start.getTime();
  return Math.round(diffMs / 86400000);
}

export function formatEventDate(dateIso: string): string {
  return toLocalDate(dateIso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
