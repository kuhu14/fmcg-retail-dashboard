import { Card } from "./Card";

interface Holiday {
  date: string;
  name: string;
  type: "Public holiday" | "Company holiday" | "Optional holiday";
}

const HOLIDAYS_2026: Holiday[] = [
  { date: "Jan 1", name: "New Year's Day", type: "Public holiday" },
  { date: "Jan 26", name: "Republic Day", type: "Public holiday" },
  { date: "Mar 4", name: "Holi", type: "Public holiday" },
  { date: "Mar 20", name: "Eid al-Fitr", type: "Optional holiday" },
  { date: "Apr 3", name: "Good Friday", type: "Optional holiday" },
  { date: "May 1", name: "May Day", type: "Public holiday" },
  { date: "Aug 15", name: "Independence Day", type: "Public holiday" },
  { date: "Aug 28", name: "Raksha Bandhan", type: "Company holiday" },
  { date: "Oct 2", name: "Gandhi Jayanti", type: "Public holiday" },
  { date: "Oct 20", name: "Dussehra", type: "Public holiday" },
  { date: "Nov 8", name: "Diwali", type: "Public holiday" },
  { date: "Dec 25", name: "Christmas Day", type: "Public holiday" },
];

const TYPE_STYLE: Record<Holiday["type"], string> = {
  "Public holiday": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "Company holiday": "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  "Optional holiday": "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function quarterOf(date: string): number {
  const month = date.split(" ")[0];
  const order = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return Math.floor(order.indexOf(month) / 3) + 1;
}

export function HrCalendar() {
  const byQuarter: Record<number, Holiday[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const h of HOLIDAYS_2026) byQuarter[quarterOf(h.date)].push(h);

  return (
    <div className="flex flex-col gap-4">
      <Card title="Company holiday calendar — 2026" subtitle="Static reference list; not tied to live data">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((q) => (
            <div key={q} className="flex flex-col gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[var(--chart-muted)]">
                Q{q}
              </span>
              <ul className="flex flex-col gap-2">
                {byQuarter[q].map((h) => (
                  <li
                    key={h.date}
                    className="flex flex-col gap-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2"
                  >
                    <span className="text-xs font-medium text-[var(--foreground)]">{h.name}</span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[var(--chart-muted)]">{h.date}, 2026</span>
                      <span className={`text-[10px] font-medium rounded-full px-1.5 py-0.5 whitespace-nowrap ${TYPE_STYLE[h.type]}`}>
                        {h.type}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
