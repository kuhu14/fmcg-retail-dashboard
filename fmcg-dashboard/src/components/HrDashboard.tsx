"use client";

import { useState } from "react";
import { HrCalendar } from "./HrCalendar";
import { HiringAssistant } from "./HiringAssistant";

type HrTab = "calendar" | "assistant";

const TABS: { id: HrTab; label: string }[] = [
  { id: "calendar", label: "Calendar" },
  { id: "assistant", label: "Hiring Assistant" },
];

export function HrDashboard() {
  const [tab, setTab] = useState<HrTab>("calendar");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-nowrap items-center gap-0.5 rounded-lg border border-[var(--card-border)] bg-[var(--chart-surface)] p-0.5 w-fit">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={active}
              className={`px-3 h-8 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "calendar" ? <HrCalendar /> : <HiringAssistant />}
    </div>
  );
}
