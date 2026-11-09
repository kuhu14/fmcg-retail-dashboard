"use client";

import { DEPARTMENTS, type DepartmentId } from "@/lib/departments";

export function Sidebar({
  activeId,
  onSelect,
}: {
  activeId: DepartmentId;
  onSelect: (id: DepartmentId) => void;
}) {
  return (
    <nav
      aria-label="Departments"
      className="shrink-0 border-[var(--card-border)] bg-[var(--chart-surface)] md:w-56 md:border-r md:h-screen md:sticky md:top-0 md:overflow-y-auto border-b"
    >
      <div className="px-3 py-3 md:py-4">
        <p className="hidden md:block text-[11px] font-semibold uppercase tracking-wide text-[var(--chart-muted)] px-2 mb-2">
          Departments
        </p>
        <ul className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible -mx-1 px-1">
          {DEPARTMENTS.map((dept) => {
            const active = dept.id === activeId;
            return (
              <li key={dept.id} className="shrink-0 md:shrink">
                <button
                  type="button"
                  onClick={() => onSelect(dept.id)}
                  title={dept.description}
                  className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap md:whitespace-normal ${
                    active
                      ? "bg-[var(--foreground)] text-[var(--background)] font-medium"
                      : "text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {dept.label}
                    {dept.comingSoon && (
                      <span
                        className={`text-[9px] rounded-full px-1.5 py-0.5 font-medium ${
                          active
                            ? "bg-[var(--background)]/20 text-[var(--background)]"
                            : "bg-[var(--chart-gridline)]/60 text-[var(--chart-muted)]"
                        }`}
                      >
                        soon
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
