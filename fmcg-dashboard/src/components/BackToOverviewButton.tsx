import { DepartmentIcon } from "./DepartmentIcon";

export function BackToOverviewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Back to Overview"
      className="flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--chart-surface)] px-3 h-9 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40 transition-colors"
    >
      <DepartmentIcon id="overview" className="w-4 h-4 shrink-0" />
      Overview
    </button>
  );
}
