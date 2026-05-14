import { useMemo, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { ChefHat } from "lucide-react";
import {
  fetchAdminOrders,
  updateOrderEta,
  type AdminOrderListItemDto,
  type AdminOrdersQuery,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { useOperationalSound } from "@/features/admin/realtime/useOperationalSound";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Kicker } from "@/shared/components/typography/Kicker";
import { EtaDialog } from "@/features/admin/orders/components/EtaDialog";
import { KitchenOrderCard } from "./KitchenOrderCard";
import { SectionHeader } from "../shared/SectionHeader";
import { sectionTheme, type SectionKind } from "../shared/statusColors";

const PAGE_SIZE = 100;

const NEW_QUERY: AdminOrdersQuery = { status: "NEW", size: PAGE_SIZE };
const CONFIRMED_QUERY: AdminOrdersQuery = { status: "CONFIRMED", size: PAGE_SIZE };
const IN_PREP_QUERY: AdminOrdersQuery = { status: "IN_PREPARATION", size: PAGE_SIZE };

export function KitchenPage() {
  useOperationalSound("kitchen");
  const queryClient = useQueryClient();

  // SSE invalidates ["admin","orders","list"] (prefix match), refreshing
  // these queries and the OrdersListPage table.
  // CONFIRMED merged into "NOWE" section: orders confirmed via /admin/orders
  // back-office flow must stay visible to the kitchen (AD-023).
  const [newQuery, confirmedQuery, inPrepQuery] = useQueries({
    queries: [
      {
        queryKey: ["admin", "orders", "list", NEW_QUERY] as const,
        queryFn: () => fetchAdminOrders(NEW_QUERY),
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
      },
      {
        queryKey: ["admin", "orders", "list", CONFIRMED_QUERY] as const,
        queryFn: () => fetchAdminOrders(CONFIRMED_QUERY),
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
      },
      {
        queryKey: ["admin", "orders", "list", IN_PREP_QUERY] as const,
        queryFn: () => fetchAdminOrders(IN_PREP_QUERY),
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
      },
    ],
  });

  const [etaForOrder, setEtaForOrder] = useState<AdminOrderListItemDto | null>(null);

  const newRows = useMemo(
    () => sortAsc([...(newQuery.data?.content ?? []), ...(confirmedQuery.data?.content ?? [])]),
    [newQuery.data, confirmedQuery.data],
  );
  const inPrepRows = useMemo(() => sortAsc(inPrepQuery.data?.content), [inPrepQuery.data]);

  const errorMessage =
    queryError(newQuery.error) ??
    queryError(confirmedQuery.error) ??
    queryError(inPrepQuery.error);

  const etaMutation = useMutation({
    mutationFn: ({
      id,
      version,
      minutesFromNow,
    }: {
      id: number;
      version: number;
      minutesFromNow: number;
    }) => updateOrderEta(id, { minutesFromNow, version }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.setQueryData(["admin", "orders", "detail", data.id], data);
      toast.success("ETA zaktualizowane");
      setEtaForOrder(null);
    },
    onError: (err) => {
      const status = err instanceof AxiosError ? err.response?.status : undefined;
      if (status === 409) {
        toast.error("Ktoś inny zmienił zamówienie. Lista odświeżona.");
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
        return;
      }
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zapisać ETA");
    },
  });

  const isLoading =
    newQuery.isPending || confirmedQuery.isPending || inPrepQuery.isPending;
  const isEmpty =
    !isLoading && newRows.length === 0 && inPrepRows.length === 0;

  const totalInFlight = newRows.length + inPrepRows.length;

  return (
    <div className="space-y-8">
      <header>
        <Kicker className="block">Operacyjne · Kuchnia</Kicker>
        <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-[rgb(var(--color-text-primary))]">
          Kuchnia
          <span className="text-[rgb(var(--color-primary))]">.</span>
        </h1>
        <p className="mt-1 text-[14px] text-[rgb(var(--color-text-muted))]">
          {totalInFlight > 0
            ? `W toku: ${totalInFlight} zamówień. Najstarsze na górze.`
            : "Czekamy na nowe zamówienia. Najstarsze na górze."}
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-[rgb(var(--status-cancelled))]/30 bg-[rgb(var(--status-cancelled-tint))] p-3 text-sm text-[rgb(var(--status-cancelled))]">
          Nie udało się pobrać zamówień: {errorMessage}
        </div>
      )}

      {isEmpty && !errorMessage && (
        <EmptyState
          icon={<ChefHat className="h-5 w-5" />}
          title="Brak zamówień"
          description="Czekamy na pierwsze."
        />
      )}

      <Section
        title="Nowe"
        sectionKind="kitchen-new"
        count={newRows.length}
        rows={newRows}
        isLoading={isLoading}
        onOpenEta={setEtaForOrder}
      />

      <Section
        title="W przygotowaniu"
        sectionKind="kitchen-prep"
        count={inPrepRows.length}
        rows={inPrepRows}
        isLoading={isLoading}
        onOpenEta={setEtaForOrder}
      />

      <EtaDialog
        open={etaForOrder !== null}
        onOpenChange={(open) => !open && setEtaForOrder(null)}
        currentEtaMinutes={etaForOrder?.etaMinutes ?? null}
        currentEtaSetAt={etaForOrder?.etaSetAt ?? null}
        onSubmit={(minutesFromNow) => {
          if (!etaForOrder) return;
          etaMutation.mutate({
            id: etaForOrder.id,
            version: etaForOrder.version,
            minutesFromNow,
          });
        }}
        isSubmitting={etaMutation.isPending}
      />
    </div>
  );
}

interface SectionProps {
  title: string;
  sectionKind: SectionKind;
  count: number;
  rows: AdminOrderListItemDto[];
  isLoading: boolean;
  onOpenEta: (order: AdminOrderListItemDto) => void;
}

function Section({
  title,
  sectionKind,
  count,
  rows,
  isLoading,
  onOpenEta,
}: SectionProps) {
  const theme = sectionTheme(sectionKind);
  if (isLoading && rows.length === 0) {
    return (
      <section>
        <SectionHeader title={title} count={null} theme={theme} />
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="h-72 animate-pulse rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-section))]"
            />
          ))}
        </div>
      </section>
    );
  }

  if (rows.length === 0) return null;

  return (
    <section>
      <SectionHeader title={title} count={count} theme={theme} />
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {rows.map((row) => (
          <KitchenOrderCard
            key={row.id}
            order={row}
            onOpenEta={() => onOpenEta(row)}
          />
        ))}
      </div>
    </section>
  );
}

function sortAsc(
  rows: AdminOrderListItemDto[] | undefined,
): AdminOrderListItemDto[] {
  if (!rows) return [];
  return [...rows].sort(
    (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime(),
  );
}

function queryError(err: unknown): string | null {
  if (!err) return null;
  return extractProblem(err)?.detail ?? "Spróbuj odświeżyć stronę.";
}
