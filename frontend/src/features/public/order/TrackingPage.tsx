import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, type Query } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { CheckCircle2, Circle, Clock, MapPin, XCircle } from "lucide-react";
import {
  fetchOrderByToken,
  type FulfillmentType,
  type OrderStatus,
  type OrderTrackingDto,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { Button } from "@/shared/components/ui/Button";

const TERMINAL_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELED"];

const STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Nowe",
  CONFIRMED: "Potwierdzone",
  IN_PREPARATION: "W przygotowaniu",
  READY: "Gotowe",
  OUT_FOR_DELIVERY: "W dostawie",
  DELIVERED: "Zrealizowane",
  CANCELED: "Anulowane",
};

const STATUS_BADGE: Record<OrderStatus, string> = {
  NEW: "bg-slate-100 text-slate-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PREPARATION: "bg-amber-100 text-amber-800",
  READY: "bg-violet-100 text-violet-700",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELED: "bg-rose-100 text-rose-700",
};

function timelineFor(fulfillment: FulfillmentType): OrderStatus[] {
  const base: OrderStatus[] = ["NEW", "CONFIRMED", "IN_PREPARATION", "READY"];
  return fulfillment === "DELIVERY"
    ? [...base, "OUT_FOR_DELIVERY", "DELIVERED"]
    : [...base, "DELIVERED"];
}

function formatPlacedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function TrackingPage() {
  const { token } = useParams<{ token: string }>();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  const query = useQuery<OrderTrackingDto>({
    queryKey: ["order", "track", token],
    queryFn: () => fetchOrderByToken(token!),
    enabled: !!token,
    refetchInterval: (q: Query<OrderTrackingDto>) => {
      const status = q.state.data?.status;
      if (status && TERMINAL_STATUSES.includes(status)) return false;
      return 15_000;
    },
    refetchIntervalInBackground: false,
    retry: (failureCount, error) => {
      if (error instanceof AxiosError && error.response?.status === 404) return false;
      return failureCount < 2;
    },
  });

  const order = query.data;
  const timeline = useMemo<OrderStatus[]>(
    () => (order ? timelineFor(order.fulfillmentType) : []),
    [order]
  );
  const currentIndex = useMemo(() => {
    if (!order) return -1;
    return timeline.indexOf(order.status);
  }, [order, timeline]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            {settings?.name ?? "Restauracja"}
          </Link>
          <Link to="/menu" className="text-sm font-medium text-slate-600 hover:text-primary">
            Menu
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">
        {query.isLoading ? <TrackingSkeleton /> : null}

        {query.isError ? <TrackingError error={query.error} /> : null}

        {order ? (
          <div className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Numer zamówienia
                  </p>
                  <p className="font-mono text-xl font-bold text-slate-900">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Złożone: {formatPlacedAt(order.placedAt)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[order.status]}`}
                >
                  {STATUS_LABELS[order.status]}
                </span>
              </div>

              {order.etaMinutes !== null ? (
                <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-slate-100 px-3 py-2 text-sm">
                  <Clock className="h-4 w-4 text-slate-600" />
                  <span className="font-medium">
                    Szacowany czas: {order.etaMinutes} min
                  </span>
                </div>
              ) : null}
            </section>

            {order.status === "CANCELED" ? (
              <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-900">
                <p className="font-semibold">Zamówienie zostało anulowane.</p>
                <p className="mt-1">
                  Skontaktuj się z restauracją, jeśli masz pytania.
                </p>
              </section>
            ) : (
              <StatusTimeline timeline={timeline} currentIndex={currentIndex} />
            )}

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {order.fulfillmentType === "DELIVERY" ? "Dostawa" : "Odbiór osobisty"}
              </h2>
              {order.fulfillmentType === "DELIVERY" && order.deliveryAddress ? (
                <div className="mt-3 flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div className="text-sm text-slate-700">
                    <p>
                      {order.deliveryAddress.street} {order.deliveryAddress.buildingNumber}
                      {order.deliveryAddress.apartmentNumber
                        ? ` / ${order.deliveryAddress.apartmentNumber}`
                        : ""}
                    </p>
                    <p>
                      {order.deliveryAddress.postalCode} {order.deliveryAddress.city}
                    </p>
                    {order.deliveryAddress.notes ? (
                      <p className="mt-1 text-xs text-slate-500">
                        {order.deliveryAddress.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-700">
                  Odbiór w lokalu — informację o gotowości zobaczysz tutaj.
                </p>
              )}
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Pozycje
              </h2>
              <ul className="mt-3 divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <li key={idx} className="py-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {item.productName}
                          {item.variantName ? (
                            <span className="font-normal text-slate-500">
                              {" "}
                              · {item.variantName}
                            </span>
                          ) : null}
                        </p>
                        {item.addons.length > 0 ? (
                          <ul className="mt-1 space-y-0.5 text-xs text-slate-500">
                            {item.addons.map((a, addonIdx) => (
                              <li key={addonIdx}>+ {a.name}</li>
                            ))}
                          </ul>
                        ) : null}
                        <p className="mt-1 text-xs text-slate-500">
                          {item.quantity} × {formatPrice(item.unitPrice, currency)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">
                        {formatPrice(item.lineTotal, currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-sm font-medium text-slate-700">Razem</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatPrice(order.total, currency)}
                </span>
              </div>
            </section>

            {query.isFetching && !query.isLoading ? (
              <p className="text-center text-xs text-slate-400">Aktualizowanie…</p>
            ) : null}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function TrackingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-32 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-48 animate-pulse rounded-lg bg-slate-200" />
    </div>
  );
}

function TrackingError({ error }: { error: unknown }) {
  const status = error instanceof AxiosError ? error.response?.status : undefined;
  const problem = extractProblem(error);

  if (status === 404) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <XCircle className="mx-auto mb-3 h-10 w-10 text-slate-400" />
        <h2 className="text-lg font-semibold text-slate-900">
          Nie znaleziono zamówienia
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Link mógł wygasnąć lub jest nieprawidłowy. Sprawdź adres lub złóż nowe
          zamówienie.
        </p>
        <Link to="/menu" className="mt-5 inline-block">
          <Button variant="primary">Przejdź do menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
      <p className="font-semibold">Nie udało się załadować zamówienia.</p>
      <p className="mt-1">
        {problem?.detail ?? problem?.title ?? "Sprawdź połączenie i spróbuj odświeżyć stronę."}
      </p>
    </div>
  );
}

interface TimelineProps {
  timeline: OrderStatus[];
  currentIndex: number;
}

function StatusTimeline({ timeline, currentIndex }: TimelineProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Postęp realizacji
      </h2>
      <ol className="space-y-4">
        {timeline.map((status, idx) => {
          const done = idx < currentIndex;
          const current = idx === currentIndex;
          return (
            <li key={status} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                {done ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                ) : current ? (
                  <span className="flex h-5 w-5 items-center justify-center">
                    <span className="h-3 w-3 animate-pulse rounded-full bg-primary" />
                  </span>
                ) : (
                  <Circle className="h-5 w-5 text-slate-300" />
                )}
                {idx < timeline.length - 1 ? (
                  <div
                    className={`mt-1 h-6 w-px ${done ? "bg-emerald-300" : "bg-slate-200"}`}
                  />
                ) : null}
              </div>
              <div className="-mt-0.5">
                <p
                  className={`text-sm ${
                    current
                      ? "font-semibold text-slate-900"
                      : done
                        ? "text-slate-700"
                        : "text-slate-400"
                  }`}
                >
                  {STATUS_LABELS[status]}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
