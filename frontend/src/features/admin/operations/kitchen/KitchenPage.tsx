import { useMemo, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  fetchAdminOrders,
  updateOrderEta,
  type AdminOrderListItemDto,
  type AdminOrdersQuery,
  type OrderStatus,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { useOperationalSound } from "@/features/admin/realtime/useOperationalSound";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { EtaDialog } from "@/features/admin/orders/components/EtaDialog";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { useElapsedTick } from "../shared/useElapsedTick";
import { KitchenOrderCard } from "./KitchenOrderCard";

const PAGE_SIZE = 100;
const NEW_QUERY: AdminOrdersQuery = { status: "NEW", size: PAGE_SIZE };
const CONFIRMED_QUERY: AdminOrdersQuery = { status: "CONFIRMED", size: PAGE_SIZE };
const IN_PREP_QUERY: AdminOrdersQuery = { status: "IN_PREPARATION", size: PAGE_SIZE };

interface ColumnRow {
  order: AdminOrderListItemDto;
  status: OrderStatus;
}

function sortAsc(rows: AdminOrderListItemDto[] | undefined): AdminOrderListItemDto[] {
  if (!rows) return [];
  return [...rows].sort(
    (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime(),
  );
}

function queryError(err: unknown): string | null {
  if (!err) return null;
  return extractProblem(err)?.detail ?? "Spróbuj odświeżyć stronę.";
}

export function KitchenPage() {
  useOperationalSound("kitchen");
  const queryClient = useQueryClient();
  const now = useElapsedTick();
  const settings = usePublicSettings();
  const prepMin = settings.data?.defaultPreparationMinutes ?? 18;

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

  // Bundle frame-kitchen:244-247 — Nowe column carries NEW + CONFIRMED side
  // by side, each rendered with its own status border + button. Sort ascending
  // by placedAt so oldest sits at the top.
  const newCol: ColumnRow[] = useMemo(() => {
    const merged = [
      ...sortAsc(newQuery.data?.content).map<ColumnRow>((order) => ({ order, status: "NEW" })),
      ...sortAsc(confirmedQuery.data?.content).map<ColumnRow>((order) => ({
        order,
        status: "CONFIRMED",
      })),
    ];
    return merged.sort(
      (a, b) =>
        new Date(a.order.placedAt).getTime() - new Date(b.order.placedAt).getTime(),
    );
  }, [newQuery.data, confirmedQuery.data]);

  const prepCol: ColumnRow[] = useMemo(
    () =>
      sortAsc(inPrepQuery.data?.content).map((order) => ({
        order,
        status: "IN_PREPARATION" as const,
      })),
    [inPrepQuery.data],
  );

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
  const totalInFlight = newCol.length + prepCol.length;

  return (
    <div className="flex flex-col gap-5">
      <AdminTopbar
        title="Kuchnia"
        metadata={`W toku: ${totalInFlight} zamówień · cel: ${prepMin} min`}
        liveStatus="polling"
      />

      {errorMessage && (
        <div
          className="rounded-md p-3 text-sm"
          style={{
            border: "1px solid rgb(var(--status-cancelled) / 0.3)",
            background: "rgb(var(--status-cancelled-tint))",
            color: "rgb(var(--status-cancelled))",
          }}
        >
          Nie udało się pobrać zamówień: {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <KitchenColumn
          title="Nowe"
          count={newCol.length}
          accentColor="rgb(var(--status-new))"
          isLoading={isLoading && newCol.length === 0}
        >
          {newCol.map(({ order, status }) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              status={status}
              onOpenEta={() => setEtaForOrder(order)}
            />
          ))}
        </KitchenColumn>

        <KitchenColumn
          title="W przygotowaniu"
          count={prepCol.length}
          accentColor="rgb(var(--status-prep))"
          isLoading={isLoading && prepCol.length === 0}
        >
          {prepCol.map(({ order }) => {
            const elapsed = Math.max(
              0,
              Math.floor((now - new Date(order.placedAt).getTime()) / 60_000),
            );
            return (
              <KitchenOrderCard
                key={order.id}
                order={order}
                status="IN_PREPARATION"
                urgent={elapsed >= 7}
                onOpenEta={() => setEtaForOrder(order)}
              />
            );
          })}
        </KitchenColumn>
      </div>

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

interface KitchenColumnProps {
  title: string;
  count: number;
  accentColor: string;
  isLoading: boolean;
  children: React.ReactNode;
}

function KitchenColumn({ title, count, accentColor, isLoading, children }: KitchenColumnProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        background: "rgb(var(--color-bg-section))",
        borderRadius: 12,
        border: "1px solid rgb(var(--color-border-card))",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid rgb(var(--color-border-card))",
          background: "rgb(var(--color-bg-card))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 9999,
              background: accentColor,
            }}
            aria-hidden
          />
          <h3
            style={{
              fontSize: 14,
              fontWeight: 700,
              margin: 0,
              color: "rgb(var(--color-text-primary))",
              letterSpacing: "-0.005em",
            }}
          >
            {title}
          </h3>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              fontWeight: 600,
              background: "rgb(var(--color-bg-section))",
              color: "rgb(var(--color-text-body))",
              padding: "2px 8px",
              borderRadius: 9999,
            }}
          >
            {count}
          </span>
        </div>
      </div>
      <div style={{ flex: 1, padding: 12 }}>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className="h-48 animate-pulse rounded-xl"
                style={{ background: "rgb(var(--color-bg-card))" }}
              />
            ))}
          </div>
        ) : count === 0 ? (
          <div
            style={{
              padding: "32px 12px",
              textAlign: "center",
              fontSize: 13,
              color: "rgb(var(--color-text-muted))",
            }}
          >
            Brak zamówień
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
