import type { ReactNode } from "react";

export function Card({
  title,
  subtitle,
  children,
  className = "",
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-[var(--card-border)] bg-[var(--chart-surface)] p-4 shadow-sm ${className}`}
    >
      {title && (
        <div className="mb-3">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--chart-muted)] mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
