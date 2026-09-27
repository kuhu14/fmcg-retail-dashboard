export function ChartTooltip({
  title,
  rows,
}: {
  title: string;
  rows: [string, string][];
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2 text-xs shadow-md"
      style={{
        background: "var(--chart-surface)",
        borderColor: "var(--card-border)",
        color: "var(--foreground)",
      }}
    >
      <div className="font-semibold mb-1">{title}</div>
      <div className="flex flex-col gap-0.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span style={{ color: "var(--chart-muted)" }}>{label}</span>
            <span className="tabular-nums font-medium">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
