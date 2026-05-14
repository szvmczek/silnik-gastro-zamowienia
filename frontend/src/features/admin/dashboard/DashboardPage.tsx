import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/auth/useAuth";
import {
  fetchDashboardStats,
  type AdminDashboardStatsDto,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { useOperationalSound } from "@/features/admin/realtime/useOperationalSound";
import { Kicker } from "@/shared/components/typography/Kicker";
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

interface OrderDelta {
  label: string;
  positive: boolean;
}

function computeDelta(stats: AdminDashboardStatsDto): OrderDelta | undefined {
  // last7Days[6] is today (zero-fill, ascending). last7Days[5] is yesterday.
  if (stats.last7Days.length < 2) return undefined;
  const today = stats.last7Days[stats.last7Days.length - 1].orderCount;
  const yesterday = stats.last7Days[stats.last7Days.length - 2].orderCount;
  if (yesterday === 0 && today === 0) return undefined;
  const diff = today - yesterday;
  if (diff === 0) return undefined;
  return {
    label: `${Math.abs(diff)} vs wczoraj`,
    positive: diff > 0,
  };
}

function computeActiveTotal(stats: AdminDashboardStatsDto): number {
  const a = stats.activeCounts;
  return a.new + a.inPreparation + a.readyForPickup + a.readyForDelivery + a.outForDelivery;
}

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function formatTodayLabel(): string {
  const raw = dateFormatter.format(new Date());
  return raw.charAt(0).toUpperCase() + raw.slice(1);
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

  // Recomputed every render. The 60s refetch on dashboard/stats triggers
  // a re-render, which is sufficient cadence for the hourly highlight.
  const currentHour = new Date().getHours();
  const delta = stats ? computeDelta(stats) : undefined;
  const activeTotal = stats ? computeActiveTotal(stats) : 0;
  const today = formatTodayLabel();

  return (
    <div className="space-y-10">
      <header>
        <Kicker className="block">Pulpit · {today}</Kicker>
        <h1 className="mt-1 text-[40px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[rgb(var(--color-text-primary))]">
          Witaj, {user?.displayName ?? "Administratorze"}
          <span className="text-[rgb(var(--color-primary))]">.</span>
        </h1>
        <p className="mt-2 text-[14px] text-[rgb(var(--color-text-muted))]">
          Przegląd dnia i ostatniego tygodnia. Dane odświeżają się co minutę.
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-[rgb(var(--status-cancelled))/0.3] bg-[rgb(var(--status-cancelled-tint))] p-3 text-sm text-[rgb(var(--status-cancelled))]">
          Nie udało się pobrać statystyk: {errorMessage}
        </div>
      )}

      <section>
        <Kicker className="mb-4 block">Dziś</Kicker>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          <StatTile
            label="Zamówienia dziś"
            value={stats ? String(stats.today.orderCount) : "—"}
            delta={delta?.label}
            deltaPositive={delta?.positive}
            hint={delta ? undefined : "Wczoraj brak danych do porównania"}
            isLoading={isLoading}
          />
          <StatTile
            label="Sprzedaż dziś"
            value={stats ? formatCurrency(stats.today.totalRevenue) : "—"}
            hint={
              stats
                ? `${stats.today.deliveryCount} dostawy · ${stats.today.pickupCount} odbiory`
                : undefined
            }
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
            hint={
              stats && stats.today.canceledCount > 0
                ? `${stats.today.canceledCount} anulowanych dziś`
                : undefined
            }
            isLoading={isLoading}
          />
        </div>
      </section>

      <section>
        <Kicker className="mb-4 block">Aktualnie w systemie</Kicker>
        {stats ? (
          <ActiveStatusTiles counts={stats.activeCounts} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="h-24 animate-pulse rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-section))]"
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <Kicker className="mb-4 block">Zamówienia dziś według godziny</Kicker>
        {stats ? (
          <HourlyBarChart data={stats.hourlyToday} currentHour={currentHour} />
        ) : (
          <ChartSkeleton />
        )}
      </section>

      <section>
        <Kicker className="mb-4 block">Ostatnie 7 dni</Kicker>
        {stats ? <Last7DaysLineChart data={stats.last7Days} /> : <ChartSkeleton />}
      </section>

      <section>
        <Kicker className="mb-4 block">Top 5 produktów (30 dni)</Kicker>
        {stats ? (
          <TopProductsList items={stats.topProducts30Days} />
        ) : (
          <div className="h-32 animate-pulse rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-section))]" />
        )}
      </section>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-[280px] animate-pulse rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-section))]" />
  );
}
