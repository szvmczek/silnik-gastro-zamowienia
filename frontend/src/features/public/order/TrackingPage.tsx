import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, type Query } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { MapPin, Phone, RefreshCw, XCircle } from "lucide-react";
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
import {
  STATUS_LABELS,
  TrackingTimeline,
} from "./components/TrackingTimeline";

const TERMINAL_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELED"];

function timelineFor(fulfillment: FulfillmentType): OrderStatus[] {
  const base: OrderStatus[] = ["NEW", "CONFIRMED", "IN_PREPARATION", "READY"];
  return fulfillment === "DELIVERY"
    ? [...base, "OUT_FOR_DELIVERY", "DELIVERED"]
    : [...base, "DELIVERED"];
}

function formatPlacedAgo(iso: string): string {
  try {
    const then = new Date(iso).getTime();
    const minutes = Math.max(0, Math.round((Date.now() - then) / 60_000));
    if (minutes === 0) return "przed chwilą";
    if (minutes === 1) return "1 minutę temu";
    if (minutes < 5) return `${minutes} minuty temu`;
    if (minutes < 60) return `${minutes} minut temu`;
    const hours = Math.round(minutes / 60);
    return hours === 1 ? "godzinę temu" : `${hours} godz. temu`;
  } catch {
    return "";
  }
}

function formatUpdatedAgo(ms: number): string {
  const seconds = Math.max(0, Math.round(ms / 1000));
  if (seconds < 60) return `${seconds} sek. temu`;
  const minutes = Math.round(seconds / 60);
  return minutes === 1 ? "1 min temu" : `${minutes} min temu`;
}

function toTelHref(phone: string | undefined | null): string {
  if (!phone) return "";
  return `tel:${phone.replace(/\s+/g, "")}`;
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

  const isCanceled = order?.status === "CANCELED";
  const phoneHref = toTelHref(settings?.phone);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-10">
          <Link to="/" className="text-[15px] font-semibold">
            {settings?.name ?? "Restauracja"}
          </Link>
          <Link
            to="/menu"
            className="text-[13px] font-medium text-slate-600 hover:text-slate-900"
          >
            Menu
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6 md:px-10 md:pt-12">
        {query.isLoading ? <TrackingSkeleton /> : null}

        {query.isError ? <TrackingError error={query.error} /> : null}

        {order ? (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
                  Zamówienie
                </div>
                <h1 className="mt-1 font-mono text-[28px] font-semibold leading-none tracking-tight text-slate-900 sm:text-[32px] md:text-[44px]">
                  {order.orderNumber}
                </h1>
                <div className="mt-2 text-[13px] text-slate-500 md:text-[14px]">
                  Złożone {formatPlacedAgo(order.placedAt)} ·{" "}
                  {order.fulfillmentType === "DELIVERY"
                    ? order.deliveryAddress
                      ? `Dostawa do ${order.deliveryAddress.street} ${order.deliveryAddress.buildingNumber}`
                      : "Dostawa"
                    : "Odbiór osobisty w lokalu"}
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
                <RefreshCw
                  className={`h-3.5 w-3.5 ${query.isFetching ? "animate-spin text-emerald-500" : "text-emerald-500"}`}
                />
                <span>
                  {query.isFetching
                    ? "Aktualizuję…"
                    : query.dataUpdatedAt
                      ? `Aktualizacja ${formatUpdatedAgo(Date.now() - query.dataUpdatedAt)}`
                      : "Aktualne"}
                </span>
              </div>
            </div>

            {isCanceled ? (
              <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
                  <div>
                    <p className="text-[15px] font-semibold">
                      Zamówienie zostało anulowane
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed">
                      Skontaktuj się z restauracją, jeśli masz pytania.
                      {settings?.phone ? (
                        <>
                          {" "}Telefon:{" "}
                          <a
                            href={phoneHref}
                            className="font-medium text-rose-700 underline underline-offset-2"
                          >
                            {settings.phone}
                          </a>
                          .
                        </>
                      ) : null}
                    </p>
                  </div>
                </div>
              </section>
            ) : (
              <TrackingTimeline timeline={timeline} currentIndex={currentIndex} />
            )}

            {!isCanceled ? (
              <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
                <EtaCard
                  etaMinutes={order.etaMinutes}
                  fulfillmentType={order.fulfillmentType}
                  status={order.status}
                />
                <SupportCard phone={settings?.phone} phoneHref={phoneHref} />
              </div>
            ) : null}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-slate-900">
                  {order.fulfillmentType === "DELIVERY" ? "Dostawa" : "Odbiór"}
                </h2>
                <span className="text-[12px] font-medium text-slate-500">
                  Status: {STATUS_LABELS[order.status]}
                </span>
              </div>
              {order.fulfillmentType === "DELIVERY" && order.deliveryAddress ? (
                <div className="mt-3 flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <div className="text-[13px] text-slate-700">
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
                      <p className="mt-1 text-[12px] text-slate-500">
                        {order.deliveryAddress.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-[13px] text-slate-700">
                  Odbiór w lokalu — poinformujemy, gdy zamówienie będzie gotowe.
                </p>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-slate-900">
                  Szczegóły zamówienia
                </h2>
                <span className="text-[12px] text-slate-500">
                  {order.items.length}{" "}
                  {order.items.length === 1 ? "pozycja" : "pozycji"}
                </span>
              </div>
              <ul className="mt-3 divide-y divide-slate-100">
                {order.items.map((item, idx) => (
                  <li key={idx} className="py-3 text-[13px]">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          <span className="text-slate-500">{item.quantity}× </span>
                          {item.productName}
                          {item.variantName ? (
                            <span className="font-normal text-slate-500">
                              {" "}
                              · {item.variantName}
                            </span>
                          ) : null}
                        </p>
                        {item.addons.length > 0 ? (
                          <p className="mt-0.5 text-[11px] text-slate-500">
                            {item.addons.map((a) => `+${a.name}`).join(" · ")}
                          </p>
                        ) : null}
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {item.quantity} × {formatPrice(item.unitPrice, currency)}
                        </p>
                      </div>
                      <span className="shrink-0 font-semibold text-slate-900">
                        {formatPrice(item.lineTotal, currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-[14px] font-semibold text-slate-700">Razem</span>
                <span className="text-[20px] font-semibold text-slate-900">
                  {formatPrice(order.total, currency)}
                </span>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}

interface EtaCardProps {
  etaMinutes: number | null;
  fulfillmentType: FulfillmentType;
  status: OrderStatus;
}

function EtaCard({ etaMinutes, fulfillmentType, status }: EtaCardProps) {
  const destination = fulfillmentType === "DELIVERY" ? "do dostawy" : "do odbioru";
  const isPending = etaMinutes == null;
  const isReady = status === "READY" || status === "OUT_FOR_DELIVERY";

  return (
    <section className="rounded-2xl bg-slate-900 p-6 text-white md:p-8">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/50">
        Szacowany czas {destination}
      </div>
      {isPending ? (
        <>
          <div className="mt-3 font-mono text-[32px] font-semibold leading-none tracking-tight text-white md:text-[44px]">
            ustalamy…
          </div>
          <div className="mt-3 text-[13px] text-white/70">
            Restauracja wyznaczy czas w ciągu kilku minut. Ta strona odświeża się
            automatycznie co 15 sekund.
          </div>
        </>
      ) : (
        <>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="font-mono text-[44px] font-semibold leading-none tracking-tight md:text-[64px]">
              ~{etaMinutes}
            </div>
            <div className="text-[14px] text-white/70">minut {destination}</div>
          </div>
          {isReady ? (
            <div className="mt-4 text-[13px] text-white/70">
              Zamówienie jest gotowe — {fulfillmentType === "DELIVERY" ? "kurier już w drodze." : "możesz je odebrać w lokalu."}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

interface SupportCardProps {
  phone: string | null | undefined;
  phoneHref: string;
}

function SupportCard({ phone, phoneHref }: SupportCardProps) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
      <div className="text-[14px] font-semibold text-slate-900">
        Masz pytanie do restauracji?
      </div>
      <div className="mt-1 text-[13px] text-slate-500">
        Chętnie odpowiemy — zadzwoń jeśli coś jest niejasne lub chcesz zmienić
        szczegóły zamówienia.
      </div>
      <div className="mt-auto pt-5">
        {phone ? (
          <a href={phoneHref} className="block">
            <Button variant="outline" size="lg" className="w-full">
              <Phone className="h-4 w-4" />
              {phone}
            </Button>
          </a>
        ) : (
          <Button variant="outline" size="lg" className="w-full" disabled>
            <Phone className="h-4 w-4" />
            Telefon niedostępny
          </Button>
        )}
      </div>
    </section>
  );
}

function TrackingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-20 animate-pulse rounded-lg bg-slate-200" />
      <div className="h-40 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
      </div>
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
