import { useMemo, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import {
  fetchAdminOrders,
  updateOrderStatus,
  type AdminOrderDto,
  type AdminOrderListItemDto,
  type AdminOrdersQuery,
  type SpringPage,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { useOperationalSound } from "@/features/admin/realtime/useOperationalSound";
import { Button } from "@/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { DeliveryRow } from "./DeliveryOrderCard";

const PAGE_SIZE = 100;

const READY_DELIVERY_QUERY: AdminOrdersQuery = {
  status: "READY",
  fulfillmentType: "DELIVERY",
  size: PAGE_SIZE,
};
const OUT_FOR_DELIVERY_QUERY: AdminOrdersQuery = {
  status: "OUT_FOR_DELIVERY",
  size: PAGE_SIZE,
};

function sortAsc(page: SpringPage<AdminOrderListItemDto> | undefined): AdminOrderListItemDto[] {
  if (!page) return [];
  return [...page.content].sort(
    (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime(),
  );
}

function queryError(err: unknown): string | null {
  if (!err) return null;
  return extractProblem(err)?.detail ?? "Spróbuj odświeżyć stronę.";
}

export function DeliveryPage() {
  useOperationalSound("delivery");
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<AdminOrderListItemDto | null>(null);

  const [readyQuery, outQuery] = useQueries({
    queries: [
      {
        queryKey: ["admin", "orders", "list", READY_DELIVERY_QUERY] as const,
        queryFn: () => fetchAdminOrders(READY_DELIVERY_QUERY),
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
      },
      {
        queryKey: ["admin", "orders", "list", OUT_FOR_DELIVERY_QUERY] as const,
        queryFn: () => fetchAdminOrders(OUT_FOR_DELIVERY_QUERY),
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
      },
    ],
  });

  const readyRows = useMemo(() => sortAsc(readyQuery.data), [readyQuery.data]);
  const outRows = useMemo(() => sortAsc(outQuery.data), [outQuery.data]);

  const errorMessage = queryError(readyQuery.error) ?? queryError(outQuery.error);

  function handleMutationError(err: unknown, fallback: string) {
    const status = err instanceof AxiosError ? err.response?.status : undefined;
    if (status === 409) {
      toast.error("Ktoś inny zmienił zamówienie. Lista odświeżona.");
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      setConfirming(null);
      return;
    }
    toast.error(extractProblem(err)?.detail ?? fallback);
  }

  const departMutation = useMutation({
    mutationFn: ({ id, version }: { id: number; version: number }) =>
      updateOrderStatus(id, { status: "OUT_FOR_DELIVERY", version }),
    onSuccess: (data: AdminOrderDto) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.setQueryData(["admin", "orders", "detail", data.id], data);
      toast.success(`${data.orderNumber} — wyjechało`);
    },
    onError: (err) => handleMutationError(err, "Nie udało się oznaczyć jako wyjechało"),
  });

  const deliverMutation = useMutation({
    mutationFn: ({ id, version }: { id: number; version: number }) =>
      updateOrderStatus(id, { status: "DELIVERED", version }),
    onSuccess: (data: AdminOrderDto) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.setQueryData(["admin", "orders", "detail", data.id], data);
      toast.success(`${data.orderNumber} — dostarczone`);
      setConfirming(null);
    },
    onError: (err) => handleMutationError(err, "Nie udało się potwierdzić dostawy"),
  });

  const isLoading = readyQuery.isPending || outQuery.isPending;
  const toCollectCount = readyRows.length;
  const inTransitCount = outRows.length;

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-0.5 text-[12px] text-[rgb(var(--color-text-muted))]">
            Operacyjne
          </div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="m-0 text-[22px] font-bold leading-[1.2] tracking-[-0.01em] text-[rgb(var(--color-text-primary))]">
              Dostawa
            </h1>
            <span className="text-[13px] text-[rgb(var(--color-text-muted))]">
              {toCollectCount} do zabrania · {inTransitCount} w drodze
            </span>
          </div>
        </div>
      </header>

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
        <DeliveryColumn
          title="Do zabrania"
          count={toCollectCount}
          dotColor="rgb(var(--status-ready))"
          isLoading={isLoading && readyRows.length === 0}
          empty={readyRows.length === 0 ? "Brak zamówień gotowych do dostarczenia." : null}
        >
          {readyRows.map((row, idx) => (
            <DeliveryRow
              key={row.id}
              order={row}
              variant="to-collect"
              isLast={idx === readyRows.length - 1}
              primaryPending={departMutation.isPending}
              onPrimary={() =>
                departMutation.mutate({ id: row.id, version: row.version })
              }
            />
          ))}
        </DeliveryColumn>

        <DeliveryColumn
          title="W drodze"
          count={inTransitCount}
          dotColor="rgb(var(--status-out))"
          isLoading={isLoading && outRows.length === 0}
          empty={outRows.length === 0 ? "Żadne zamówienie nie jest aktualnie w drodze." : null}
        >
          {outRows.map((row, idx) => (
            <DeliveryRow
              key={row.id}
              order={row}
              variant="in-transit"
              isLast={idx === outRows.length - 1}
              primaryPending={false}
              onPrimary={() => setConfirming(row)}
            />
          ))}
        </DeliveryColumn>
      </div>

      <Dialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzić dostawę {confirming?.orderNumber}?</DialogTitle>
            <DialogDescription>
              Operacja kończy lifecycle zamówienia (status DELIVERED). Cofnięcie nie jest możliwe.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirming(null)}
              disabled={deliverMutation.isPending}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() =>
                confirming &&
                deliverMutation.mutate({ id: confirming.id, version: confirming.version })
              }
              disabled={deliverMutation.isPending}
            >
              {deliverMutation.isPending ? "Zapisywanie…" : "Tak, dostarczone"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface DeliveryColumnProps {
  title: string;
  count: number;
  dotColor: string;
  isLoading: boolean;
  empty: string | null;
  children: React.ReactNode;
}

function DeliveryColumn({
  title,
  count,
  dotColor,
  isLoading,
  empty,
  children,
}: DeliveryColumnProps) {
  return (
    <div
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
        borderRadius: 10,
        padding: 20,
      }}
    >
      <h3
        className="m-0 flex items-center gap-2"
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: "rgb(var(--color-text-primary))",
          marginBottom: 14,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: 9999,
            background: dotColor,
          }}
          aria-hidden
        />
        {title} ({count})
      </h3>
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="h-40 animate-pulse rounded-md"
              style={{ background: "rgb(var(--color-bg-section))" }}
            />
          ))}
        </div>
      ) : count === 0 && empty ? (
        <div
          style={{
            padding: "32px 8px",
            textAlign: "center",
            fontSize: 13,
            color: "rgb(var(--color-text-muted))",
          }}
        >
          {empty}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
