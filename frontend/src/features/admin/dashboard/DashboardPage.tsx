import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/auth/useAuth";
import {
  fetchDashboardStats,
  type AdminDashboardStatsDto,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { useOperationalSound } from "@/features/admin/realtime/useOperationalSound";
import { StatTile } from "./components/StatTile";
import { HourlyBarChart } from "./components/HourlyBarChart";
import { Last7DaysLineChart } from "./components/Last7DaysLineChart";
import { TopProductsList } from "./components/TopProductsList";
import { ActiveStatusTiles } from "./components/ActiveStatusTiles";

function formatCurrency(raw: string | number): string {
  const n = typeof raw === "number" ? raw : Number.parseFloat(raw);
  if (!Number.isFinite(n)) return String(raw);
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(n);
}

function computeDelta(stats: AdminDashboardStatsDto): string | undefined {
  // last7Days[6] is today (zero-fill, ascending). last7Days[5] is yesterday.
  if (stats.last7Days.length < 2) return undefined;
  const today = stats.last7Days[stats.last7Days.length - 1].orderCount;
  const yesterday = stats.last7Days[stats.last7Days.length - 2].orderCount;
  if (yesterday === 0 && today === 0) return undefined;
  const diff = today - yesterday;
  if (diff === 0) return "= wczoraj";
  if (diff > 0) return `+${diff} vs wczoraj`;
  return `${diff} vs wczoraj`;
}

function computeActiveTotal(stats: AdminDashboardStatsDto): number {
  const a = stats.activeCounts;
  return a.new + a.inPreparation + a.readyForPickup + a.readyForDelivery + a.outForDelivery;
}

export function DashboardPage() {
  useOperationalSound("manager");
  const { user } = useAuth();

  const query = useQuery<AdminDashboardStatsDto>({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const stats = query.data;
  const isLoading = query.isPending;
  const errorMessage = query.isError
    ? extractProblem(query.error)?.detail ?? "Spróbuj odświeżyć stronę."
    : null;

  const currentHour = useMemo(() => new Date().getHours(), []);
  const delta = stats ? computeDelta(stats) : undefined;
  const activeTotal = stats ? computeActiveTotal(stats) : 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">
          Witaj, {user?.displayName ?? "Administrator"}
        </h1>
        <p className="mt-1 text-[14px] text-slate-500">
          Przegląd dnia i ostatniego tygodnia. Dane odświeżają się co minutę.
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Nie udało się pobrać statystyk: {errorMessage}
        </div>
      )}

      <section>
        <div className="kicker mb-4">Dziś</div>
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          <StatTile
            label="Zamówienia dziś"
            value={stats ? String(stats.today.orderCount) : "—"}
            hint={delta}
            isLoading={isLoading}
          />
          <StatTile
            label="Sprzedaż dziś"
            value={stats ? formatCurrency(stats.today.totalRevenue) : "—"}
            isLoading={isLoading}
          />
          <StatTile
            label="Średnia wartość"
            value={stats ? formatCurrency(stats.today.averageOrderValue) : "—"}
            isLoading={isLoading}
          />
          <StatTile
            label="Aktywne zamówienia"
            value={stats ? String(activeTotal) : "—"}
            isLoading={isLoading}
          />
        </div>
      </section>

      <section>
        <div className="kicker mb-4">Zamówienia dziś według godziny</div>
        {stats ? (
          <HourlyBarChart data={stats.hourlyToday} currentHour={currentHour} />
        ) : (
          <ChartSkeleton />
        )}
      </section>

      <section>
        <div className="kicker mb-4">Ostatnie 7 dni</div>
        {stats ? <Last7DaysLineChart data={stats.last7Days} /> : <ChartSkeleton />}
      </section>

      <section>
        <div className="kicker mb-4">Top 5 produktów (30 dni)</div>
        {stats ? (
          <TopProductsList items={stats.topProducts30Days} />
        ) : (
          <div className="h-32 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
        )}
      </section>

      <section>
        <div className="kicker mb-4">Aktywne zamówienia</div>
        {stats ? (
          <ActiveStatusTiles counts={stats.activeCounts} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-24 animate-pulse rounded-lg border border-slate-200 bg-slate-50"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-[280px] animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
  );
}
