"use client";

import { useState } from "react";
import { Card } from "./Card";
import { useHrEvents } from "@/hooks/useHrEvents";
import { formatEventDate, type CompanyEvent, type CompanyEventType } from "@/lib/hrEvents";

const TYPE_STYLE: Record<CompanyEventType, string> = {
  "Public holiday": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Company holiday": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "Optional holiday": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const EVENT_TYPES: CompanyEventType[] = ["Company holiday", "Public holiday", "Optional holiday"];

function quarterOf(dateIso: string): number {
  const month = Number(dateIso.slice(5, 7));
  return Math.floor((month - 1) / 3) + 1;
}

export function HrCalendar() {
  const { events, addEvent, removeEvent } = useHrEvents();
  const [date, setDate] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<CompanyEventType>("Company holiday");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !name.trim()) return;
    addEvent({ date, name: name.trim(), type });
    setDate("");
    setName("");
    setType("Company holiday");
  }

  const byQuarter: Record<number, CompanyEvent[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const e of events) byQuarter[quarterOf(e.date)].push(e);

  return (
    <div className="flex flex-col gap-4">
      <Card title="Add a company event" subtitle="Visible to anyone viewing this calendar on this browser">
        <form onSubmit={submit} className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--chart-muted)]">Date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="text-xs rounded-md border border-[var(--card-border)] bg-[var(--background)] px-2 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1 flex-1 min-w-[160px]">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--chart-muted)]">Event name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Team offsite"
              required
              className="text-xs rounded-md border border-[var(--card-border)] bg-[var(--background)] px-2 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--chart-muted)]">Type</span>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CompanyEventType)}
              className="text-xs rounded-md border border-[var(--card-border)] bg-[var(--background)] px-2 py-1.5 text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {EVENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="text-xs font-medium rounded-md bg-[var(--foreground)] text-[var(--background)] px-4 py-2"
          >
            Add event
          </button>
        </form>
      </Card>

      <Card title="Company calendar — 2026" subtitle="Holidays plus any events added above">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((q) => (
            <div key={q} className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--chart-muted)]">
                Q{q}
              </span>
              <ul className="flex flex-col gap-2">
                {byQuarter[q].map((e) => (
                  <li
                    key={e.id}
                    className="flex flex-col gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-medium text-[var(--foreground)]">{e.name}</span>
                      {e.custom && (
                        <button
                          type="button"
                          onClick={() => removeEvent(e.id)}
                          aria-label={`Remove ${e.name}`}
                          className="text-[var(--chart-muted)] hover:text-red-500 leading-none text-sm"
                        >
                          ×
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--chart-muted)]">{formatEventDate(e.date)}</span>
                      <span className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 whitespace-nowrap ${TYPE_STYLE[e.type]}`}>
                        {e.type}
                      </span>
                    </div>
                  </li>
                ))}
                {byQuarter[q].length === 0 && (
                  <li className="text-[11px] text-[var(--chart-muted)]">No events</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
