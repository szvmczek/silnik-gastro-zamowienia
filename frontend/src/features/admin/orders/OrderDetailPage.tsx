import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { AlertTriangle, ExternalLink } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Skeleton } from "@/shared/components/ui/Skeleton";
import { Kicker } from "@/shared/components/typography/Kicker";
import {
  fetchAdminOrderById,
  updateOrderEta,
  updateOrderStatus,
  type AdminOrderDto,
  type OrderStatus,
  type OrderTrackingAddressDto,
  type OrderTrackingItemDto,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { formatDateTime } from "@/shared/lib/formatDate";
import { OrderStatusBadge, statusLabel } from "@/shared/components/ui/OrderStatusBadge";
import { OrderStatusActions } from "./components/OrderStatusActions";
import { OrderStatusHistory } from "./components/OrderStatusHistory";
import { EtaDialog } from "./components/EtaDialog";
import { CancelOrderDialog } from "./components/CancelOrderDialog";
import { computeEtaRelativeTime } from "./lib/etaRelativeTime";

function formatCurrency(raw: string): string {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return raw;
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(n);
}

function fulfillmentLabel(t: AdminOrderDto["fulfillmentType"]): string {
  return t === "DELIVERY" ? "Dostawa" : "Odbiór";
}

function paymentLabel(t: AdminOrderDto["paymentMethod"]): string {
  return t === "CASH_ON_DELIVERY" ? "Gotówka przy dostawie" : "Gotówka przy odbiorze";
}

function formatPlacedRelative(iso: string, now: number = Date.now()): string {
  const diffMin = Math.floor((now - new Date(iso).getTime()) / 60_000);
  if (diffMin < 1) return "przed chwilą";
  if (diffMin < 60) return `${diffMin} min temu`;
  const hours = Math.floor(diffMin / 60);
  if (hours < 24) return `${hours} godz. temu`;
  return formatDateTime(iso);
}

function buildMapsHref(address: OrderTrackingAddressDto): string {
  const parts = [
    `${address.street} ${address.buildingNumber}`,
    `${address.postalCode} ${address.city}`,
  ];
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    parts.join(", ")
  )}`;
}

export function OrderDetailPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = idParam ? Number.parseInt(idParam, 10) : NaN;
  const queryClient = useQueryClient();
  const [etaOpen, setEtaOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const query = useQuery<AdminOrderDto>({
    queryKey: ["admin", "orders", "detail", id],
    queryFn: () => fetchAdminOrderById(id),
    enabled: Number.isFinite(id),
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const order = query.data;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "orders", "detail", id] });
    queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "summary"] });
  };

  const handleMutationError = (err: unknown, fallback: string) => {
    const problem = extractProblem(err);
    const status = err instanceof AxiosError ? err.response?.status : undefined;
    if (status === 409) {
      toast.error("Ktoś inny zmienił zamówienie. Odśwież widok.");
      queryClient.invalidateQueries({
        queryKey: ["admin", "orders", "detail", id],
      });
      return;
    }
    toast.error(problem?.detail ?? problem?.title ?? fallback);
  };

  const statusMutation = useMutation({
    mutationFn: ({
      next,
      version,
      reason,
    }: {
      next: OrderStatus;
      version: number;
      reason?: string;
    }) => updateOrderStatus(id, { status: next, version, reason }),
    onSuccess: (data) => {
      queryClient.setQueryData(["admin", "orders", "detail", id], data);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "summary"] });
      toast.success(`Status zmieniony na: ${statusLabel(data.status)}`);
    },
    onError: (err) => handleMutationError(err, "Nie udało się zmienić statusu"),
  });

  const etaMutation = useMutation({
    mutationFn: ({
      minutesFromNow,
      version,
    }: {
      minutesFromNow: number;
      version: number;
    }) => updateOrderEta(id, { minutesFromNow, version }),
    onSuccess: (data) => {
      queryClient.setQueryData(["admin", "orders", "detail", id], data);
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      toast.success("ETA zaktualizowane");
      setEtaOpen(false);
    },
    onError: (err) => handleMutationError(err, "Nie udało się zapisać ETA"),
  });

  const errorMessage = useMemo(() => {
    if (!query.isError) return null;
    const err = query.error;
    if (err instanceof AxiosError && err.response?.status === 404) {
      return "Nie znaleziono zamówienia.";
    }
    return extractProblem(err)?.detail ?? "Spróbuj odświeżyć stronę.";
  }, [query.isError, query.error]);

  if (!Number.isFinite(id)) {
    return (
      <div className="space-y-3">
        <BackLink />
        <p className="text-sm text-[rgb(var(--color-text-muted))]">
          Nieprawidłowy identyfikator zamówienia.
        </p>
      </div>
    );
  }

  if (query.isPending) {
    return <OrderDetailSkeleton />;
  }

  if (errorMessage || !order) {
    return (
      <div className="space-y-3">
        <BackLink />
        <div className="rounded-md border border-[rgb(var(--status-cancelled))]/30 bg-[rgb(var(--status-cancelled-tint))] p-3 text-sm text-[rgb(var(--status-cancelled))]">
          {errorMessage ?? "Nie udało się pobrać zamówienia."}
        </div>
        <div>
          <Button type="button" variant="ghost" onClick={() => invalidateAll()}>
            Odśwież
          </Button>
        </div>
      </div>
    );
  }

  const mutating = statusMutation.isPending || etaMutation.isPending;

  return (
    <div className="space-y-6">
      <BackLink />

      <header>
        <Kicker className="block">Archiwum › Wszystkie zamówienia</Kicker>
        <div className="mt-2 flex flex-wrap items-baseline gap-4">
          <h1 className="font-mono text-[56px] font-semibold leading-none tracking-[-0.01em] text-[rgb(var(--color-text-primary))]">
            {order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.status} size="lg" />
          {order.trackingToken && (
            <Link
              to={`/track/${order.trackingToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[rgb(var(--color-primary))] hover:underline focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
            >
              Otwórz tracker klienta
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          )}
        </div>
        <div className="mt-2 text-[14px] text-[rgb(var(--color-text-muted))]">
          Złożone {formatPlacedRelative(order.placedAt)} ·{" "}
          {fulfillmentLabel(order.fulfillmentType)} ·{" "}
          {paymentLabel(order.paymentMethod)}
        </div>
      </header>

      <OrderStatusActions
        currentStatus={order.status}
        fulfillmentType={order.fulfillmentType}
        onChangeStatus={(next) =>
          statusMutation.mutate({ next, version: order.version })
        }
        onOpenEta={() => setEtaOpen(true)}
        onOpenCancel={() => setCancelOpen(true)}
        isSubmitting={mutating}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <DetailCard title="Pozycje">
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <OrderItemRow key={idx} item={item} />
              ))}
              <div className="space-y-1 border-t border-[rgb(var(--color-border-subtle))] pt-3 text-sm">
                <div className="flex justify-between text-[rgb(var(--color-text-body))]">
                  <span>Suma częściowa</span>
                  <span className="font-mono tabular-nums">{formatCurrency(order.subtotal)}</span>
                </div>
                {order.fulfillmentType === "DELIVERY" && order.deliveryZoneName !== null && (
                  <div className="flex justify-between text-[rgb(var(--color-text-body))]">
                    <span>Dostawa — {order.deliveryZoneName}</span>
                    <span className="font-mono tabular-nums">{formatCurrency(order.deliveryFee)}</span>
                  </div>
                )}
                {order.fulfillmentType === "DELIVERY" && order.deliveryZoneName === null && (
                  <div className="flex justify-between text-[rgb(var(--color-text-muted))]">
                    <span>Dostawa</span>
                    <span>—</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-base">
                  <span className="font-bold text-[rgb(var(--color-text-primary))]">
                    Razem
                  </span>
                  <span className="font-mono font-semibold tabular-nums text-[rgb(var(--color-text-primary))]">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>
          </DetailCard>

          <DetailCard title="Klient">
            <div className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Kicker className="block">Imię i nazwisko</Kicker>
                  <div className="mt-1 text-[rgb(var(--color-text-primary))]">
                    {order.customerName}
                  </div>
                </div>
                <div>
                  <Kicker className="block">Telefon</Kicker>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="mt-1 inline-block font-mono text-[rgb(var(--color-primary))] hover:underline focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
                  >
                    {order.customerPhone}
                  </a>
                </div>
                {order.customerEmail && (
                  <div className="sm:col-span-2">
                    <Kicker className="block">E-mail</Kicker>
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="mt-1 inline-block text-[rgb(var(--color-primary))] hover:underline focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
                    >
                      {order.customerEmail}
                    </a>
                  </div>
                )}
              </div>

              {order.fulfillmentType === "DELIVERY" && order.deliveryAddress && (
                <div className="rounded-md border border-[rgb(var(--color-border-subtle))] bg-[rgb(var(--color-bg-section))] p-3">
                  <Kicker className="block">Adres dostawy</Kicker>
                  <div className="mt-1 text-[rgb(var(--color-text-primary))]">
                    <DeliveryAddressLines address={order.deliveryAddress} />
                  </div>
                  <a
                    href={buildMapsHref(order.deliveryAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-xs font-semibold text-[rgb(var(--color-primary))] hover:underline focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
                  >
                    Otwórz w mapie →
                  </a>
                </div>
              )}
            </div>
          </DetailCard>

          <DetailCard title="Płatność">
            <div className="text-sm text-[rgb(var(--color-text-body))]">
              {paymentLabel(order.paymentMethod)}
            </div>
          </DetailCard>
        </div>

        <div className="space-y-6">
          {order.customerNotes && (
            <div className="rounded-xl border border-[rgb(var(--status-new))]/40 border-l-4 border-l-[rgb(var(--status-new))] bg-[rgb(var(--status-new-tint))] p-4">
              <div className="flex items-start gap-2.5">
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--status-new))]"
                  aria-hidden
                />
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[rgb(var(--status-new))]">
                    Uwagi klienta
                  </div>
                  <p className="mt-1 whitespace-pre-line text-[14px] text-[rgb(var(--color-text-primary))]">
                    {order.customerNotes}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DarkEtaCard
            etaMinutes={order.etaMinutes}
            etaSetAt={order.etaSetAt}
          />

          <DetailCard title="Historia statusów">
            <OrderStatusHistory history={order.statusHistory} />
          </DetailCard>
        </div>
      </div>

      <EtaDialog
        open={etaOpen}
        onOpenChange={setEtaOpen}
        currentEtaMinutes={order.etaMinutes}
        currentEtaSetAt={order.etaSetAt}
        onSubmit={(minutesFromNow) =>
          etaMutation.mutate({ minutesFromNow, version: order.version })
        }
        isSubmitting={etaMutation.isPending}
      />

      <CancelOrderDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        orderNumber={order.orderNumber}
        isSubmitting={mutating}
        onConfirm={(reason) => {
          setCancelOpen(false);
          statusMutation.mutate({
            next: "CANCELED",
            version: order.version,
            reason,
          });
        }}
      />
    </div>
  );
}

function DetailCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-5">
      <Kicker className="mb-3 block">{title}</Kicker>
      {children}
    </section>
  );
}

function DarkEtaCard({
  etaMinutes,
  etaSetAt,
}: {
  etaMinutes: number | null;
  etaSetAt: string | null;
}) {
  return (
    <div className="rounded-xl bg-[rgb(var(--color-bg-dark))] p-6 text-[rgb(var(--color-text-on-dark))]">
      <Kicker className="block text-[rgb(var(--color-text-on-dark))]/60">
        ETA
      </Kicker>
      {etaMinutes !== null ? (
        <>
          <div className="mt-2 font-mono text-[48px] font-semibold leading-none tracking-[-0.01em]">
            {etaMinutes}
            <span className="ml-2 text-[22px] font-normal text-[rgb(var(--color-text-on-dark))]/70">
              min
            </span>
          </div>
          {etaSetAt && (
            <div className="mt-3 text-[13px] text-[rgb(var(--color-text-on-dark))]/60">
              ustawione {computeEtaRelativeTime(etaSetAt)}
            </div>
          )}
        </>
      ) : (
        <div className="mt-3 text-[14px] text-[rgb(var(--color-text-on-dark))]/60">
          Brak ustawionego ETA — kliknij „Zmień ETA" powyżej.
        </div>
      )}
    </div>
  );
}

function DeliveryAddressLines({ address }: { address: OrderTrackingAddressDto }) {
  return (
    <div className="space-y-0.5 text-sm">
      <div>
        {address.street} {address.buildingNumber}
        {address.apartmentNumber && `/${address.apartmentNumber}`}
      </div>
      <div>
        {address.postalCode} {address.city}
      </div>
      {address.notes && (
        <div className="pt-1 text-xs text-[rgb(var(--color-text-muted))]">
          {address.notes}
        </div>
      )}
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <BackLink />
      <div className="space-y-2">
        <Skeleton className="h-3 w-48 bg-[rgb(var(--color-border-card))]" />
        <div className="flex flex-wrap items-baseline gap-4">
          <Skeleton className="h-14 w-48 bg-[rgb(var(--color-border-card))]" />
          <Skeleton className="h-7 w-24 rounded-full bg-[rgb(var(--color-border-card))]" />
        </div>
        <Skeleton className="h-4 w-72 bg-[rgb(var(--color-border-card))]" />
      </div>
      <Skeleton className="h-24 rounded-xl bg-[rgb(var(--color-border-card))]" />
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Skeleton className="h-56 rounded-xl bg-[rgb(var(--color-border-card))]" />
          <Skeleton className="h-48 rounded-xl bg-[rgb(var(--color-border-card))]" />
          <Skeleton className="h-24 rounded-xl bg-[rgb(var(--color-border-card))]" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-xl bg-[rgb(var(--color-bg-dark))]/80" />
          <Skeleton className="h-48 rounded-xl bg-[rgb(var(--color-border-card))]" />
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/orders"
      className="inline-flex items-center text-sm font-medium text-[rgb(var(--color-text-muted))] transition-colors hover:text-[rgb(var(--color-primary))]"
    >
      ← Wróć do listy
    </Link>
  );
}

function OrderItemRow({ item }: { item: OrderTrackingItemDto }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-medium text-[rgb(var(--color-text-primary))]">
            <span className="font-mono">{item.quantity}×</span> {item.productName}
          </span>
          {item.variantName && (
            <span className="text-xs text-[rgb(var(--color-text-muted))]">
              ({item.variantName})
            </span>
          )}
        </div>
        {item.addons.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-xs text-[rgb(var(--color-text-muted))]">
            {item.addons.map((addon, idx) => (
              <li key={idx}>
                + {addon.name}
                <span className="text-[rgb(var(--color-text-faint))]">
                  {" · "}
                  {addon.groupName}
                  {" · "}
                  {formatCurrency(addon.unitPrice)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="whitespace-nowrap text-right">
        <div className="text-xs text-[rgb(var(--color-text-muted))]">
          {formatCurrency(item.unitPrice)}
        </div>
        <div className="font-mono font-semibold tabular-nums text-[rgb(var(--color-text-primary))]">
          {formatCurrency(item.lineTotal)}
        </div>
      </div>
    </div>
  );
}
