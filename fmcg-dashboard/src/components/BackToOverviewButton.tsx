export function BackToOverviewButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title="Back to Overview"
      className="flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--chart-surface)] px-3 h-9 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--chart-gridline)]/40 transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4 shrink-0"
        aria-hidden="true"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      Overview
    </button>
  );
}
