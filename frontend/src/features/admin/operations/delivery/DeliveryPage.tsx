import { useMemo, useState } from "react";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Truck } from "lucide-react";
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
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { Button } from "@/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { DeliveryOrderCard } from "./DeliveryOrderCard";
import { SectionHeader } from "../shared/SectionHeader";
import { sectionTheme, type SectionKind } from "../shared/statusColors";

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

  const isLoading = readyQuery.isPending || outQuery.isPending;
  const isEmpty =
    !isLoading && readyRows.length === 0 && outRows.length === 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-[28px] font-semibold tracking-tight text-slate-900">
          Dostawa
        </h1>
        <p className="mt-1 text-[14px] text-slate-500">
          Zamówienia gotowe do zabrania i te w drodze. Najstarsze na górze.
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Nie udało się pobrać zamówień: {errorMessage}
        </div>
      )}

      {isEmpty && !errorMessage && (
        <EmptyState
          icon={<Truck className="h-5 w-5" />}
          title="Brak zamówień do dostarczenia"
          description="Gdy kuchnia oznaczy dostawę jako gotową, pojawi się tutaj."
        />
      )}

      <Section
        title="Do zabrania"
        sectionKind="delivery-ready"
        count={readyRows.length}
        rows={readyRows}
        isLoading={isLoading}
        primaryLabel="Wyjechało"
        onPrimary={(order) =>
          departMutation.mutate({ id: order.id, version: order.version })
        }
        primaryPending={departMutation.isPending}
      />

      <Section
        title="W dostawie"
        sectionKind="delivery-out"
        count={outRows.length}
        rows={outRows}
        isLoading={isLoading}
        primaryLabel="Dostarczone"
        onPrimary={(order) => setConfirming(order)}
        primaryPending={false}
      />

      <Dialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzić dostawę {confirming?.orderNumber}?</DialogTitle>
            <DialogDescription>
              Operacja kończy lifecycle zamówienia (status DELIVERED).
              Cofnięcie nie jest możliwe.
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

interface SectionProps {
  title: string;
  sectionKind: SectionKind;
  count: number;
  rows: AdminOrderListItemDto[];
  isLoading: boolean;
  primaryLabel: string;
  onPrimary: (order: AdminOrderListItemDto) => void;
  primaryPending: boolean;
}

function Section({
  title,
  sectionKind,
  count,
  rows,
  isLoading,
  primaryLabel,
  onPrimary,
  primaryPending,
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
              className="h-80 animate-pulse rounded-lg border border-slate-200 bg-slate-50"
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
          <DeliveryOrderCard
            key={row.id}
            order={row}
            primaryLabel={primaryLabel}
            onPrimary={() => onPrimary(row)}
            primaryPending={primaryPending}
          />
        ))}
      </div>
    </section>
  );
}

function sortAsc(
  page: SpringPage<AdminOrderListItemDto> | undefined,
): AdminOrderListItemDto[] {
  if (!page) return [];
  return [...page.content].sort(
    (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime(),
  );
}

function queryError(err: unknown): string | null {
  if (!err) return null;
  return extractProblem(err)?.detail ?? "Spróbuj odświeżyć stronę.";
}
