import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminDashboardHourlyStats } from "@/shared/api/orderApi";

interface HourlyBarChartProps {
  data: AdminDashboardHourlyStats[];
  currentHour: number;
}

// Show full 24h: zero-count hours render as height 0 and stay invisible,
// while the current-hour highlight always finds a matching bar regardless
// of whether the venue operates during day or night hours.
const FIRST_HOUR = 0;
const LAST_HOUR = 23;

export function HourlyBarChart({ data, currentHour }: HourlyBarChartProps) {
  const filtered = data.filter((d) => d.hour >= FIRST_HOUR && d.hour <= LAST_HOUR);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filtered} margin={{ top: 8, right: 8, bottom: 8, left: -12 }}>
            <XAxis
              dataKey="hour"
              tickFormatter={(h: number) => `${h}:00`}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(148,163,184,0.1)" }}
              labelFormatter={(h) => `${h}:00`}
              formatter={(v) => [String(v), "Zamówień"]}
            />
            <Bar dataKey="orderCount" radius={[4, 4, 0, 0]}>
              {filtered.map((entry) => (
                <Cell
                  key={entry.hour}
                  fill={entry.hour === currentHour ? "rgb(var(--primary))" : "#cbd5e1"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
