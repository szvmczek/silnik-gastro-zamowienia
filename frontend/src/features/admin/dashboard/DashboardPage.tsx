import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/auth/useAuth";
import { fetchDashboardSummary } from "@/shared/api/orderApi";
import type { AdminDashboardSummaryDto } from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { KpiTile } from "./components/KpiTile";

export function DashboardPage() {
  const { user } = useAuth();

  const query = useQuery<AdminDashboardSummaryDto>({
    queryKey: ["admin", "dashboard", "summary"],
    queryFn: fetchDashboardSummary,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const summary = query.data;
  const isLoading = query.isPending;
  const errorMessage = query.isError
    ? extractProblem(query.error)?.detail ?? "Spróbuj odświeżyć stronę."
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          Witaj, {user?.displayName ?? "Administrator"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Przegląd aktualnych zamówień. Klik w kafelek otwiera listę z
          odpowiednim filtrem.
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Nie udało się pobrać podsumowania: {errorMessage}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiTile
          to="/admin/orders?status=NEW"
          label="Nowe dziś"
          value={summary?.newToday ?? 0}
          isLoading={isLoading}
          accent="primary"
          hint="Status NEW, złożone dzisiaj"
        />
        <KpiTile
          to="/admin/orders?status=IN_PREPARATION"
          label="W przygotowaniu"
          value={summary?.inPreparation ?? 0}
          isLoading={isLoading}
          accent="amber"
          hint="CONFIRMED + IN_PREPARATION"
        />
        <KpiTile
          to="/admin/orders?status=READY"
          label="Do dostawy"
          value={summary?.awaitingFulfillment ?? 0}
          isLoading={isLoading}
          accent="sky"
          hint="READY + OUT_FOR_DELIVERY"
        />
      </div>
    </div>
  );
}
