// Minimal hand-drawn line icons (no icon library dependency), one per KPI
// concept so each tile is recognizable at a glance, not just by its label.
import type { SVGProps } from "react";

function Base(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  );
}

export function RevenueIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="2.5" y="5.5" width="15" height="9" rx="1.8" />
      <circle cx="10" cy="10" r="2.2" />
      <path d="M5 10h.01M15 10h.01" />
    </Base>
  );
}

export function CostIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M3 6.5a1.5 1.5 0 0 1 1.5-1.5h9.5a2 2 0 0 1 2 2v7a1.5 1.5 0 0 1-1.5 1.5H4.5A1.5 1.5 0 0 1 3 14z" />
      <path d="M13.5 10.2h3" />
      <path d="M3 7l9-2.2" />
    </Base>
  );
}

export function MarginIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="6" cy="6.5" r="2" />
      <circle cx="14" cy="13.5" r="2" />
      <path d="M14.5 5.5 5.5 14.5" />
    </Base>
  );
}

export function OrderValueIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M4 5h2l1.5 8.2a1.5 1.5 0 0 0 1.5 1.3h5a1.5 1.5 0 0 0 1.47-1.2L16.5 8H7" />
      <circle cx="9" cy="17" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14" cy="17" r="0.9" fill="currentColor" stroke="none" />
    </Base>
  );
}

export function OrdersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M5 7 6.3 3.6h7.4L15 7" />
      <path d="M4.2 7h11.6l-.9 8.3a1.5 1.5 0 0 1-1.5 1.3H6.6a1.5 1.5 0 0 1-1.5-1.3z" />
    </Base>
  );
}

export function UnitsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M10 3.2 16.5 7 10 10.8 3.5 7z" />
      <path d="M3.5 7v6.5L10 17.3l6.5-3.8V7" />
      <path d="M10 10.8v6.5" />
    </Base>
  );
}

export function LoyaltyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M10 16.2 4.3 10.7a3.1 3.1 0 0 1 0-4.5 3.3 3.3 0 0 1 4.6 0L10 7.3l1.1-1.1a3.3 3.3 0 0 1 4.6 0 3.1 3.1 0 0 1 0 4.5z" />
    </Base>
  );
}

export function NonLoyaltyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="10" cy="6.5" r="2.6" />
      <path d="M4 16.5c0-3 2.7-5 6-5s6 2 6 5" />
    </Base>
  );
}

export function StockoutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M10 3.3 17.3 16H2.7z" />
      <path d="M10 8.3v3.6M10 13.8h.01" />
    </Base>
  );
}

export function CriticalStockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <path d="M6.6 2.8h6.8l4.1 6.3-4.1 8.1H6.6l-4.1-8.1z" />
      <path d="M10 6.5v3.6M10 12.4h.01" />
    </Base>
  );
}

export function OverstockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <rect x="3" y="3.5" width="14" height="3" rx="0.8" />
      <rect x="3" y="8.5" width="14" height="3" rx="0.8" />
      <rect x="3" y="13.5" width="14" height="3" rx="0.8" />
    </Base>
  );
}

export function LeadTimeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="10" cy="10.5" r="6.8" />
      <path d="M10 6.5v4l2.8 2" />
      <path d="M7.5 2.2h5" />
    </Base>
  );
}

export function AgeMissingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Base {...props}>
      <circle cx="10" cy="6.3" r="2.6" />
      <path d="M4 16.5c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M14.3 2.3 16.8 4.8M16.8 2.3 14.3 4.8" />
    </Base>
  );
}
