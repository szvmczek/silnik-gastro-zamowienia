import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/Card";
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
import { OrderStatusBadge, statusLabel } from "@/shared/components/OrderStatusBadge";
import { Skeleton } from "@/shared/components/ui/Skeleton";
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
    mutationFn: ({ next, version }: { next: OrderStatus; version: number }) =>
      updateOrderStatus(id, { status: next, version }),
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
        <p className="text-sm text-slate-500">Nieprawidłowy identyfikator zamówienia.</p>
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
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
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

      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-4">
          <h1 className="font-mono text-[40px] font-semibold tracking-tight text-slate-900">
            {order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.status} size="lg" />
        </div>
        <div className="text-sm text-slate-500">
          Złożone {formatPlacedRelative(order.placedAt)} ·{" "}
          {fulfillmentLabel(order.fulfillmentType)} ·{" "}
          {paymentLabel(order.paymentMethod)}
        </div>
      </div>

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
          <Card>
            <CardHeader>
              <CardTitle>Pozycje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.items.map((item, idx) => (
                <OrderItemRow key={idx} item={item} />
              ))}
              <div className="border-t border-slate-200 pt-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Suma częściowa</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-base font-semibold text-slate-900">
                  <span>Razem</span>
                  <span className="tabular-nums">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Klient</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">
                    Imię i nazwisko
                  </div>
                  <div className="text-slate-900">{order.customerName}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500">
                    Telefon
                  </div>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-primary hover:underline"
                  >
                    {order.customerPhone}
                  </a>
                </div>
                {order.customerEmail && (
                  <div className="sm:col-span-2">
                    <div className="text-xs uppercase tracking-wider text-slate-500">
                      E-mail
                    </div>
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="text-primary hover:underline"
                    >
                      {order.customerEmail}
                    </a>
                  </div>
                )}
              </div>

              {order.fulfillmentType === "DELIVERY" && order.deliveryAddress && (
                <div className="rounded-md border border-slate-100 bg-slate-50 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500">
                    Adres dostawy
                  </div>
                  <div className="mt-1 text-slate-900">
                    <DeliveryAddressLines address={order.deliveryAddress} />
                  </div>
                  <a
                    href={buildMapsHref(order.deliveryAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex text-xs font-medium text-primary hover:underline"
                  >
                    Otwórz w mapie →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Płatność</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              {paymentLabel(order.paymentMethod)}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {order.customerNotes && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Uwagi klienta
              </div>
              <p className="mt-1 whitespace-pre-line text-sm text-amber-900">
                {order.customerNotes}
              </p>
            </div>
          )}

          <DarkEtaCard
            etaMinutes={order.etaMinutes}
            etaSetAt={order.etaSetAt}
          />

          <Card>
            <CardHeader>
              <CardTitle>Historia statusów</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusHistory history={order.statusHistory} />
            </CardContent>
          </Card>
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
        onConfirm={() => {
          setCancelOpen(false);
          statusMutation.mutate({
            next: "CANCELED",
            version: order.version,
          });
        }}
      />
    </div>
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
    <div className="rounded-lg bg-slate-900 p-6 text-white">
      <div className="text-xs font-semibold uppercase tracking-wider text-white/60">
        ETA
      </div>
      {etaMinutes !== null ? (
        <>
          <div className="mt-1 font-mono text-[48px] font-semibold leading-none tracking-tight">
            {etaMinutes}{" "}
            <span className="text-2xl font-normal text-white/70">min</span>
          </div>
          {etaSetAt && (
            <div className="mt-2 text-sm text-white/60">
              ustawione {computeEtaRelativeTime(etaSetAt)}
            </div>
          )}
        </>
      ) : (
        <div className="mt-2 text-sm text-white/60">
          Brak ustawionego ETA — kliknij „Ustaw ETA" powyżej.
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
        <div className="pt-1 text-xs text-slate-500">{address.notes}</div>
      )}
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <BackLink />
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-4">
          <Skeleton className="h-10 w-48 bg-slate-200" />
          <Skeleton className="h-7 w-24 rounded-full bg-slate-200" />
        </div>
        <Skeleton className="h-4 w-72 bg-slate-200" />
      </div>
      <Skeleton className="h-20 rounded-lg bg-slate-200" />
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <Skeleton className="h-56 rounded-lg bg-slate-200" />
          <Skeleton className="h-48 rounded-lg bg-slate-200" />
          <Skeleton className="h-24 rounded-lg bg-slate-200" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-32 rounded-lg bg-slate-900/80" />
          <Skeleton className="h-48 rounded-lg bg-slate-200" />
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      to="/admin/orders"
      className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary"
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
          <span className="font-medium text-slate-900">
            {item.quantity}× {item.productName}
          </span>
          {item.variantName && (
            <span className="text-xs text-slate-500">({item.variantName})</span>
          )}
        </div>
        {item.addons.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-xs text-slate-500">
            {item.addons.map((addon, idx) => (
              <li key={idx}>
                + {addon.name}
                <span className="text-slate-400">
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
        <div className="text-xs text-slate-500">{formatCurrency(item.unitPrice)}</div>
        <div className="font-medium tabular-nums text-slate-900">
          {formatCurrency(item.lineTotal)}
        </div>
      </div>
    </div>
  );
}
