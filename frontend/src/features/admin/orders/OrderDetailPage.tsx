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
import { OrderStatusBadge, statusLabel } from "./components/OrderStatusBadge";
import { OrderStatusActions } from "./components/OrderStatusActions";
import { OrderStatusHistory } from "./components/OrderStatusHistory";
import { EtaDialog } from "./components/EtaDialog";

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

export function OrderDetailPage() {
  const { id: idParam } = useParams<{ id: string }>();
  const id = idParam ? Number.parseInt(idParam, 10) : NaN;
  const queryClient = useQueryClient();
  const [etaOpen, setEtaOpen] = useState(false);

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

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">
          {order.orderNumber}
        </h1>
        <OrderStatusBadge status={order.status} />
        <span className="text-sm text-slate-500">
          {formatDateTime(order.placedAt)}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
        <span>
          <span className="text-slate-500">Rodzaj: </span>
          {fulfillmentLabel(order.fulfillmentType)}
        </span>
        <span>
          <span className="text-slate-500">Płatność: </span>
          {paymentLabel(order.paymentMethod)}
        </span>
        {order.etaMinutes !== null && (
          <span>
            <span className="text-slate-500">ETA: </span>
            ok. {order.etaMinutes} min
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Klient</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
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
              <div>
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
            {order.customerNotes && (
              <div>
                <div className="text-xs uppercase tracking-wider text-slate-500">
                  Uwagi
                </div>
                <p className="whitespace-pre-line text-slate-700">
                  {order.customerNotes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {order.fulfillmentType === "DELIVERY" && order.deliveryAddress && (
          <Card>
            <CardHeader>
              <CardTitle>Adres dostawy</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-700">
              <AddressBlock address={order.deliveryAddress} />
            </CardContent>
          </Card>
        )}

        <Card className="lg:col-span-2">
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
                <span className="tabular-nums">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="mt-1 flex justify-between text-base font-semibold text-slate-900">
                <span>Razem</span>
                <span className="tabular-nums">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status i ETA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-slate-600">
              <span className="text-slate-500">Obecny status: </span>
              {statusLabel(order.status)}
            </div>
            <div className="text-sm text-slate-600">
              <span className="text-slate-500">ETA: </span>
              {order.etaMinutes !== null ? `ok. ${order.etaMinutes} min` : "nie ustawione"}
            </div>
            <OrderStatusActions
              currentStatus={order.status}
              fulfillmentType={order.fulfillmentType}
              onChangeStatus={(next) =>
                statusMutation.mutate({ next, version: order.version })
              }
              isSubmitting={mutating}
            />
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setEtaOpen(true)}
                disabled={mutating}
              >
                Ustaw ETA
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historia statusów</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusHistory history={order.statusHistory} />
          </CardContent>
        </Card>
      </div>

      <EtaDialog
        open={etaOpen}
        onOpenChange={setEtaOpen}
        currentEtaMinutes={order.etaMinutes}
        onSubmit={(minutesFromNow) =>
          etaMutation.mutate({ minutesFromNow, version: order.version })
        }
        isSubmitting={etaMutation.isPending}
      />
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <BackLink />
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-56 animate-pulse rounded-lg bg-slate-200 lg:col-span-2" />
        <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
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

function AddressBlock({ address }: { address: OrderTrackingAddressDto }) {
  return (
    <div className="space-y-1">
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
