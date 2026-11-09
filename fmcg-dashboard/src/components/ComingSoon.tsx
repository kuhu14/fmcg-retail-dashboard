import { Card } from "./Card";

export function ComingSoon({ label, description }: { label: string; description: string }) {
  return (
    <Card title={`${label} — coming soon`} subtitle={description}>
      <p className="text-xs text-[var(--chart-muted)] leading-relaxed">
        This dataset doesn&apos;t include that data yet, so there&apos;s nothing real to show here.
        Once that data source exists, this view will get its own KPIs and drill-down, same as the
        other departments.
      </p>
    </Card>
  );
}
