import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import type { AdminDashboardDailyStats } from "@/shared/api/orderApi";

interface Last7DaysLineChartProps {
  data: AdminDashboardDailyStats[];
}

const AXIS_COLOR = "rgb(107 107 102)";
const GRID_COLOR = "rgb(237 233 223)";
const LINE_COLOR = "rgb(230 57 70)";

export function Last7DaysLineChart({ data }: Last7DaysLineChartProps) {
  const enriched = data.map((d) => ({
    ...d,
    label: capitalize(format(parseISO(d.date), "EEE", { locale: pl })),
  }));

  return (
    <div className="rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-5">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={enriched} margin={{ top: 8, right: 8, bottom: 8, left: -12 }}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: AXIS_COLOR }}
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
              labelFormatter={(label, payload) => {
                const date = payload?.[0]?.payload?.date;
                if (typeof date === "string") {
                  return format(parseISO(date), "d MMMM yyyy", { locale: pl });
                }
                return label as string;
              }}
              formatter={(v) => [String(v), "Zamówień"]}
            />
            <Line
              type="monotone"
              dataKey="orderCount"
              stroke={LINE_COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: LINE_COLOR }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}
