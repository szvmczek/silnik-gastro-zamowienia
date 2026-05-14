import { format, formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Navigation, Phone } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";
import type {
  AdminOrderListItemDto,
  OrderTrackingAddressDto,
  OrderTrackingItemDto,
} from "@/shared/api/orderApi";
import { statusTheme } from "../shared/statusColors";
import { timerEscalation } from "../shared/timerColor";
import { useElapsedTick } from "../shared/useElapsedTick";

interface DeliveryOrderCardProps {
  order: AdminOrderListItemDto;
  primaryLabel: string;
  onPrimary: () => void;
  primaryPending: boolean;
}

function formatCurrency(raw: string): string {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return raw;
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(n);
}

function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { locale: pl, addSuffix: true });
}

function formatEta(etaMinutes: number, etaSetAt: string | null): string {
  // Graceful degradation for legacy rows from before etaSetAt was tracked.
  if (!etaSetAt) return `${etaMinutes} min`;
  const target = new Date(new Date(etaSetAt).getTime() + etaMinutes * 60_000);
  return format(target, "HH:mm");
}

function buildMapsHref(address: OrderTrackingAddressDto): string {
  const apartment = address.apartmentNumber?.trim();
  const houseNumber = apartment
    ? `${address.buildingNumber}/${apartment}`
    : address.buildingNumber;
  const fullAddress = `ul. ${address.street} ${houseNumber}, ${address.postalCode} ${address.city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
}

export function DeliveryOrderCard({
  order,
  primaryLabel,
  onPrimary,
  primaryPending,
}: DeliveryOrderCardProps) {
  const addr = order.deliveryAddress;
  const cashOnDelivery = order.paymentMethod === "CASH_ON_DELIVERY";
  const theme = statusTheme(order.status);
  const now = useElapsedTick();
  const timer = timerEscalation(order.placedAt, now);

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-[rgb(var(--color-border-card))] border-l-4 bg-[rgb(var(--color-bg-card))] p-5",
        theme.accent,
        timer.pulse &&
          "motion-safe:animate-urgent-pulse motion-reduce:border-[rgb(var(--status-cancelled))] motion-reduce:ring-1 motion-reduce:ring-[rgb(var(--status-cancelled))]/30"
      )}
    >
      <header className="flex items-baseline justify-between gap-3">
        <div className="font-mono text-[16px] font-semibold tracking-tight text-[rgb(var(--color-text-muted))]">
          {order.orderNumber}
        </div>
        <div className={cn("text-[12px]", timer.color)}>
          {relativeTime(order.placedAt)}
        </div>
      </header>

      {addr ? (
        <div className="mt-2 text-[20px] font-extrabold leading-[1.2] tracking-[-0.005em] text-[rgb(var(--color-text-primary))]">
          <div>
            {addr.street} {addr.buildingNumber}
            {addr.apartmentNumber && `/${addr.apartmentNumber}`}
          </div>
          <div className="text-[rgb(var(--color-text-body))]">
            {addr.postalCode} {addr.city}
          </div>
        </div>
      ) : (
        <div className="mt-3 text-[14px] text-[rgb(var(--status-cancelled))]">
          Brak adresu — zamówienie wygląda na pomyłkę.
        </div>
      )}

      {addr?.notes && (
        <div className="mt-3 rounded-md border border-[rgb(var(--status-new))]/40 border-l-4 border-l-[rgb(var(--status-new))] bg-[rgb(var(--status-new-tint))] p-3 text-[13px] text-[rgb(var(--color-text-primary))]">
          <strong className="font-semibold">Notka adresu:</strong>{" "}
          <span className="whitespace-pre-line">{addr.notes}</span>
        </div>
      )}

      <div className="mt-3 flex items-baseline justify-between gap-3 text-[14px]">
        <div className="min-w-0 flex-1 font-medium text-[rgb(var(--color-text-primary))]">
          {order.customerName}
        </div>
        <a
          href={`tel:${order.customerPhone}`}
          className="inline-flex shrink-0 items-center gap-1.5 font-mono text-[13px] font-semibold text-[rgb(var(--color-primary))] hover:underline focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {order.customerPhone}
        </a>
      </div>

      {cashOnDelivery && (
        <div className="mt-3 rounded-md border border-[rgb(var(--status-cancelled))]/40 bg-[rgb(var(--status-cancelled-tint))] px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[rgb(var(--status-cancelled))]">
            Pobierz gotówkę
          </div>
          <div className="font-mono text-[24px] font-bold leading-none text-[rgb(var(--status-cancelled))]">
            {formatCurrency(order.total)}
          </div>
        </div>
      )}

      <ul className="mt-3 space-y-0.5 border-t border-dashed border-[rgb(var(--color-border-subtle))] pt-3 text-[12px] text-[rgb(var(--color-text-body))]">
        {(order.items ?? []).map((item, idx) => (
          <CompactItemLine key={idx} item={item} />
        ))}
      </ul>

      {order.etaMinutes !== null && (
        <div className="mt-3 text-[13px] text-[rgb(var(--color-text-muted))]">
          ETA:{" "}
          <span className="font-mono font-semibold text-[rgb(var(--color-text-primary))]">
            {formatEta(order.etaMinutes, order.etaSetAt)}
          </span>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2 pt-5">
        <Button
          type="button"
          variant="primary"
          size="xl"
          className="w-full"
          onClick={onPrimary}
          disabled={primaryPending}
        >
          {primaryPending ? "Zapisywanie…" : primaryLabel}
        </Button>
        <div className="grid grid-cols-3 gap-2">
          {addr ? (
            <a
              href={buildMapsHref(addr)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] px-3 py-2 text-[13px] font-semibold text-[rgb(var(--status-out))] transition-colors hover:bg-[rgb(var(--status-out-tint))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Nawiguj
            </a>
          ) : (
            <span aria-hidden />
          )}
          <a
            href={`tel:${order.customerPhone}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] px-3 py-2 text-[13px] font-semibold text-[rgb(var(--color-text-body))] transition-colors hover:bg-[rgb(var(--color-bg-section))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          >
            <Phone className="h-4 w-4" aria-hidden="true" />
            Zadzwoń
          </a>
          <Link
            to={`/admin/orders/${order.id}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] px-3 py-2 text-[13px] font-semibold text-[rgb(var(--color-text-body))] transition-colors hover:bg-[rgb(var(--color-bg-section))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          >
            Szczegóły →
          </Link>
        </div>
      </div>
    </article>
  );
}

function CompactItemLine({ item }: { item: OrderTrackingItemDto }) {
  return (
    <li>
      <span className="font-mono font-bold text-[rgb(var(--color-text-primary))]">
        {item.quantity}×
      </span>{" "}
      {item.productName}
      {item.variantName && (
        <span className="text-[rgb(var(--color-text-muted))]">
          {" · "}
          {item.variantName}
        </span>
      )}
    </li>
  );
}
