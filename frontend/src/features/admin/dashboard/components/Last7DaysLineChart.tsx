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

export function Last7DaysLineChart({ data }: Last7DaysLineChartProps) {
  const enriched = data.map((d) => ({
    ...d,
    label: capitalize(format(parseISO(d.date), "EEE", { locale: pl })),
  }));

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={enriched} margin={{ top: 8, right: 8, bottom: 8, left: -12 }}>
            <CartesianGrid stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#64748b" }}
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
              stroke="rgb(var(--primary))"
              strokeWidth={2}
              dot={{ r: 3, fill: "rgb(var(--primary))" }}
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
