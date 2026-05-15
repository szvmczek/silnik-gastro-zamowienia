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

const AXIS_COLOR = "rgb(107 107 102)";
const GRID_COLOR = "rgb(237 233 223)";
const BAR_ACTIVE = "rgb(230 57 70)";
const BAR_NEUTRAL = "rgb(212 208 194)";

export function HourlyBarChart({ data, currentHour }: HourlyBarChartProps) {
  const filtered = data.filter((d) => d.hour >= FIRST_HOUR && d.hour <= LAST_HOUR);

  return (
    <div className="rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-5">
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={filtered} margin={{ top: 8, right: 8, bottom: 8, left: -12 }}>
            <XAxis
              dataKey="hour"
              tickFormatter={(h: number) => `${h}:00`}
              tick={{ fontSize: 11, fill: AXIS_COLOR }}
              tickLine={false}
              axisLine={{ stroke: GRID_COLOR }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: AXIS_COLOR }}
              tickLine={false}
              axisLine={{ stroke: GRID_COLOR }}
            />
            <Tooltip
              cursor={{ fill: "rgba(212,208,194,0.18)" }}
              labelFormatter={(h) => `${h}:00`}
              formatter={(v) => [String(v), "Zamówień"]}
            />
            <Bar dataKey="orderCount" radius={[4, 4, 0, 0]}>
              {filtered.map((entry) => (
                <Cell
                  key={entry.hour}
                  fill={entry.hour === currentHour ? BAR_ACTIVE : BAR_NEUTRAL}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
