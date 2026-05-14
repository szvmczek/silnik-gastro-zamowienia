import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Store } from "lucide-react";
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
import { Kicker } from "@/shared/components/typography/Kicker";
import { PickupOrderCard } from "./PickupOrderCard";
import { SectionHeader } from "../shared/SectionHeader";
import { sectionTheme } from "../shared/statusColors";

const PAGE_SIZE = 100;

const PICKUP_QUERY: AdminOrdersQuery = {
  status: "READY",
  fulfillmentType: "PICKUP",
  size: PAGE_SIZE,
};

export function PickupPage() {
  useOperationalSound("pickup");
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<AdminOrderListItemDto | null>(null);

  const query = useQuery<SpringPage<AdminOrderListItemDto>>({
    queryKey: ["admin", "orders", "list", PICKUP_QUERY] as const,
    queryFn: () => fetchAdminOrders(PICKUP_QUERY),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const rows = useMemo(() => {
    if (!query.data) return [];
    return [...query.data.content].sort(
      (a, b) => new Date(a.placedAt).getTime() - new Date(b.placedAt).getTime(),
    );
  }, [query.data]);

  const mutation = useMutation({
    mutationFn: ({ id, version }: { id: number; version: number }) =>
      updateOrderStatus(id, { status: "DELIVERED", version }),
    onSuccess: (data: AdminOrderDto) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.setQueryData(["admin", "orders", "detail", data.id], data);
      toast.success(`${data.orderNumber} — wydane`);
      setConfirming(null);
    },
    onError: (err) => {
      const status = err instanceof AxiosError ? err.response?.status : undefined;
      if (status === 409) {
        toast.error("Ktoś inny zmienił zamówienie. Lista odświeżona.");
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
        setConfirming(null);
        return;
      }
      toast.error(extractProblem(err)?.detail ?? "Nie udało się oznaczyć jako wydane");
    },
  });

  const errorMessage = query.isError
    ? extractProblem(query.error)?.detail ?? "Spróbuj odświeżyć stronę."
    : null;

  return (
    <div className="space-y-8">
      <header>
        <Kicker className="block">Operacyjne · Wydanie</Kicker>
        <h1 className="mt-1 text-[28px] font-extrabold tracking-tight text-[rgb(var(--color-text-primary))]">
          Wydanie
          <span className="text-[rgb(var(--color-primary))]">.</span>
        </h1>
        <p className="mt-1 text-[14px] text-[rgb(var(--color-text-muted))]">
          {rows.length > 0
            ? `${rows.length} ${rows.length === 1 ? "zamówienie gotowe" : "zamówień gotowych"} do wydania.`
            : "Zamówienia gotowe do wydania pojawią się tutaj automatycznie."}
        </p>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-[rgb(var(--status-cancelled))]/30 bg-[rgb(var(--status-cancelled-tint))] p-3 text-sm text-[rgb(var(--status-cancelled))]">
          Nie udało się pobrać zamówień: {errorMessage}
        </div>
      )}

      {query.isPending && rows.length === 0 ? (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div
              key={idx}
              className="h-72 animate-pulse rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-section))]"
            />
          ))}
        </div>
      ) : rows.length === 0 ? (
        !errorMessage && (
          <EmptyState
            icon={<Store className="h-5 w-5" />}
            title="Brak zamówień do wydania"
            description="Gdy kuchnia oznaczy odbiór jako gotowy, pojawi się tutaj."
          />
        )
      ) : (
        <section>
          <SectionHeader
            title="Do wydania"
            count={rows.length}
            theme={sectionTheme("pickup-ready")}
          />
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {rows.map((row) => (
              <PickupOrderCard
                key={row.id}
                order={row}
                onRequestRelease={() => setConfirming(row)}
              />
            ))}
          </div>
        </section>
      )}

      <Dialog open={confirming !== null} onOpenChange={(open) => !open && setConfirming(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wydać zamówienie {confirming?.orderNumber}?</DialogTitle>
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
              disabled={mutation.isPending}
            >
              Anuluj
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() =>
                confirming &&
                mutation.mutate({ id: confirming.id, version: confirming.version })
              }
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Zapisywanie…" : "Tak, wydaję"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
