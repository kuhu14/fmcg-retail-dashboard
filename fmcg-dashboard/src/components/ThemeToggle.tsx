"use client";

import { useThemeMode, type ThemeMode } from "@/hooks/useThemeMode";

const OPTIONS: { id: ThemeMode; label: string; title: string }[] = [
  { id: "light", label: "☀", title: "Light" },
  { id: "dark", label: "☾", title: "Dark" },
  { id: "sun", label: "◐", title: "Auto — light at sunrise, dark at sunset (your location)" },
];

export function ThemeToggle() {
  const { mode, setMode, sunStatus } = useThemeMode();

  return (
    <div className="flex flex-col items-end gap-1" suppressHydrationWarning>
      <div className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--chart-surface)] p-0.5" suppressHydrationWarning>
        {OPTIONS.map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              title={opt.title}
              aria-label={opt.title}
              aria-pressed={active}
              onClick={() => setMode(opt.id)}
              className={`w-8 h-7 rounded-md text-sm leading-none transition-colors ${
                active
                  ? "bg-[var(--foreground)] text-[var(--background)]"
                  : "text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {mode === "sun" && sunStatus === "denied" && (
        <span className="text-[10px] text-[var(--chart-muted)]">Location blocked — using device theme</span>
      )}
      {mode === "sun" && sunStatus === "unsupported" && (
        <span className="text-[10px] text-[var(--chart-muted)]">Location unavailable — using device theme</span>
      )}
    </div>
  );
}
