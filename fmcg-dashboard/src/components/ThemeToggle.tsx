"use client";

import { useThemeMode, type ThemeMode } from "@/hooks/useThemeMode";

const OPTIONS: { id: ThemeMode; label: string; title: string }[] = [
  { id: "light", label: "☀", title: "Light" },
  { id: "dark", label: "☾", title: "Dark" },
  { id: "sun", label: "◐", title: "Auto — light 6am–6pm, dark otherwise" },
];

export function ThemeToggle() {
  const { mode, setMode } = useThemeMode();

  return (
    <div
      className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--chart-surface)] p-0.5"
      suppressHydrationWarning
    >
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
  );
}
