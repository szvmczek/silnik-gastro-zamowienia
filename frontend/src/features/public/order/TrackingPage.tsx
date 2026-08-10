import { Link, useParams } from "react-router-dom";
import { useQuery, type Query } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  fetchOrderByToken,
  type OrderStatus,
  type OrderTrackingDto,
} from "@/shared/api/orderApi";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { formatPhoneDisplay } from "@/shared/lib/formatPhone";
import { formatShortOrderNumber } from "@/shared/lib/orderNumber";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { PiecHeader } from "@/features/public/shared/PiecHeader";
import { TrackingTimeline } from "./components/TrackingTimeline";
import { CashChangeNote } from "./components/CashChangeNote";
import { currentStepIndex, trackingSteps } from "./lib/trackingSteps";
import { etaClockTime } from "./lib/eta";

const TERMINAL_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELED"];
const POLL_INTERVAL_MS = 15_000;

export function TrackingPage() {
  const { token } = useParams<{ token: string }>();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["order", "track", token],
    queryFn: () => fetchOrderByToken(token as string),
    enabled: Boolean(token),
    // Polling zatrzymuje się na stanach terminalnych — dostarczone albo
    // anulowane zamówienie już się nie zmieni.
    refetchInterval: (query: Query<OrderTrackingDto>) =>
      query.state.data && TERMINAL_STATUSES.includes(query.state.data.status)
        ? false
        : POLL_INTERVAL_MS,
  });

  if (isPending) {
    return (
      <>
        <PiecHeader size="narrow" />
        <PiecShell size="narrow" className="py-16 text-sm text-piec-ink/55">
          Sprawdzamy status zamówienia…
        </PiecShell>
      </>
    );
  }

  if (isError || !data) {
    const notFound = error instanceof AxiosError && error.response?.status === 404;
    return (
      <>
        <PiecHeader size="narrow" />
        <PiecShell size="narrow" className="py-16">
          <h1 className="font-display text-[32px] tracking-[1px]">
            {notFound ? "Nie znaleźliśmy zamówienia" : "Coś poszło nie tak"}
          </h1>
          <p className="mt-2 text-sm leading-[1.6] text-piec-ink/60">
            {notFound
              ? "Link może być nieaktualny albo niepełny. Zadzwoń — znajdziemy zamówienie po numerze."
              : "Nie udało się pobrać statusu. Odśwież stronę za chwilę."}
          </p>
          {settings?.phone ? (
            <a
              href={`tel:${settings.phone}`}
              className="mt-3 flex min-h-[44px] items-center font-bold text-primary"
            >
              Zadzwoń: {formatPhoneDisplay(settings.phone)}
            </a>
          ) : null}
        </PiecShell>
      </>
    );
  }

  const isDelivery = data.fulfillmentType === "DELIVERY";
  const isCanceled = data.status === "CANCELED";
  const shortNumber = formatShortOrderNumber(data.orderNumber);
  const clockEta = etaClockTime(data.etaMinutes, data.etaSetAt);
  const stepIndex = currentStepIndex(data.status, data.fulfillmentType);
  const steps = trackingSteps(data.fulfillmentType);
  const currentStepName = stepIndex >= 0 ? steps[stepIndex].label : null;
  const isFinished = data.status === "DELIVERED";

  const address = data.deliveryAddress;
  const addressLine = address
    ? [
        [address.street, address.buildingNumber].filter(Boolean).join(" ") +
          (address.apartmentNumber ? ` m. ${address.apartmentNumber}` : ""),
        [address.postalCode, address.city].filter(Boolean).join(" "),
      ]
        .filter(Boolean)
        .join(", ")
    : null;

  return (
    <>
      <PiecHeader size="narrow" />

      <PiecShell size="narrow" className="pb-14 pt-5">
        <h1 className="font-display text-[clamp(28px,7vw,36px)] tracking-[1.5px]">
          Zamówienie nr {shortNumber}
        </h1>
        <p className="mt-0.5 text-sm text-piec-ink/60">
          {isDelivery ? `Dostawa: ${addressLine ?? "—"}` : "Odbiór osobisty w lokalu"}
        </p>

        {isCanceled ? (
          <section className="mt-4 rounded-2xl border border-piec-warn/40 bg-piec-warn/[0.08] p-4">
            <h2 className="text-[15px] font-bold text-piec-warnSoft">Zamówienie anulowane</h2>
            <p className="mt-1 text-[13.5px] leading-[1.6] text-piec-warnSoft">
              Jeśli to pomyłka, zadzwoń — złożymy je jeszcze raz.
            </p>
            {settings?.phone ? (
              <a
                href={`tel:${settings.phone}`}
                className="mt-1.5 flex min-h-[44px] items-center font-bold text-primary"
              >
                Zadzwoń: {formatPhoneDisplay(settings.phone)}
              </a>
            ) : null}
          </section>
        ) : (
          <>
            <section className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-piec-ink/10 bg-piec-surface2 p-4">
              <div>
                <p className="text-[11.5px] font-bold uppercase tracking-[2px] text-piec-ink/55">
                  {isFinished ? "Smacznego" : isDelivery ? "Będzie u Ciebie" : "Do odbioru"}
                </p>
                <p className="mt-0.5 font-display text-4xl tracking-[1px] text-primary">
                  {isFinished ? "✓" : (clockEta ?? "ustalamy…")}
                </p>
              </div>
              {currentStepName ? (
                <span className="whitespace-nowrap rounded-full border-[1.5px] border-primary px-3.5 py-2 text-[13px] font-bold tracking-[0.5px] text-primary">
                  {currentStepName}
                </span>
              ) : null}
            </section>

            <TrackingTimeline status={data.status} fulfillmentType={data.fulfillmentType} />
          </>
        )}

        <section className="rounded-2xl border border-piec-ink/10 bg-piec-surface2 px-4 py-3.5">
          <h2 className="mb-1.5 text-[11.5px] font-bold uppercase tracking-[2px] text-piec-ink/55">
            W zamówieniu
          </h2>
          {data.items.map((item, index) => (
            <div key={index} className="border-b border-piec-ink/[0.06] py-2">
              <div className="flex justify-between gap-2.5 text-[14.5px] font-semibold">
                <span>
                  {item.productName}
                  {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                </span>
                <span className="whitespace-nowrap">
                  {formatPrice(item.lineTotal, currency)}
                </span>
              </div>
              {item.variantName ? (
                <p className="text-[13px] leading-[1.45] text-piec-ink/60">{item.variantName}</p>
              ) : null}
              {item.addons.length > 0 ? (
                <p className="text-[13px] leading-[1.45] text-piec-ink/50">
                  {item.addons.map((a) => a.name.toLowerCase()).join(", ")}
                </p>
              ) : null}
            </div>
          ))}

          <div className="flex justify-between gap-2.5 pb-0.5 pt-2 text-sm text-piec-ink/70">
            <span>Pozycje</span>
            <span className="whitespace-nowrap">{formatPrice(data.subtotal, currency)}</span>
          </div>
          {isDelivery ? (
            <div className="flex justify-between gap-2.5 py-0.5 text-sm text-piec-ink/70">
              <span>{data.deliveryZoneName ? `Dostawa — ${data.deliveryZoneName}` : "Dostawa"}</span>
              <span className="whitespace-nowrap">
                {Number(data.deliveryFee) > 0 ? formatPrice(data.deliveryFee, currency) : "gratis"}
              </span>
            </div>
          ) : null}
          <div className="mt-2 flex justify-between border-t border-piec-ink/10 pt-2.5">
            <span className="text-[14.5px] font-bold">Razem, gotówką</span>
            <span className="font-display text-[22px] tracking-[0.5px] text-primary">
              {formatPrice(data.total, currency)}
            </span>
          </div>
          {/* D-03 — potwierdzenie tego, co klient wybrał przy zamówieniu. */}
          <CashChangeNote cashChangeFrom={data.cashChangeFrom} total={data.total} currency={currency} />
        </section>

        {settings?.phone ? (
          <p className="mt-3.5 text-sm leading-[1.7] text-piec-ink/65">
            Coś nie gra? Zadzwoń:{" "}
            <a href={`tel:${settings.phone}`} className="font-bold text-primary">
              {formatPhoneDisplay(settings.phone)}
            </a>{" "}
            — wystarczy podać numer {shortNumber}.
          </p>
        ) : null}

        {TERMINAL_STATUSES.includes(data.status) ? (
          <Link
            to="/menu"
            className="mt-3 flex min-h-[44px] items-center font-semibold text-primary"
          >
            Zamów ponownie →
          </Link>
        ) : null}
      </PiecShell>
    </>
  );
}
