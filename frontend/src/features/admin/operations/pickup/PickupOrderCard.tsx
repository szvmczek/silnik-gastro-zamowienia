import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { Phone } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";
import type {
  AdminOrderListItemDto,
  OrderTrackingItemDto,
  PaymentMethod,
} from "@/shared/api/orderApi";
import { statusTheme } from "../shared/statusColors";
import { timerEscalation } from "../shared/timerColor";
import { useElapsedTick } from "../shared/useElapsedTick";

interface PickupOrderCardProps {
  order: AdminOrderListItemDto;
  onRequestRelease: () => void;
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

function paymentLabel(t: PaymentMethod): string {
  return t === "CASH_ON_DELIVERY" ? "Gotówka przy dostawie" : "Gotówka przy odbiorze";
}

function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { locale: pl, addSuffix: true });
}

export function PickupOrderCard({ order, onRequestRelease }: PickupOrderCardProps) {
  const cashOnPickup = order.paymentMethod === "CASH_ON_PICKUP";
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

      <div className="mt-2 text-[28px] font-extrabold leading-[1.15] tracking-[-0.01em] text-[rgb(var(--color-text-primary))]">
        {order.customerName}
      </div>

      <a
        href={`tel:${order.customerPhone}`}
        className="mt-2 inline-flex items-center gap-2 font-mono text-[14px] font-semibold text-[rgb(var(--color-primary))] hover:underline focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
      >
        <Phone className="h-4 w-4" aria-hidden="true" />
        {order.customerPhone}
      </a>

      <ul className="mt-4 space-y-1.5 border-t border-dashed border-[rgb(var(--color-border-subtle))] pt-3 text-[14px] text-[rgb(var(--color-text-body))]">
        {(order.items ?? []).map((item, idx) => (
          <ItemLine key={idx} item={item} />
        ))}
      </ul>

      {cashOnPickup ? (
        <div className="mt-4 rounded-md border border-[rgb(var(--status-cancelled))]/40 bg-[rgb(var(--status-cancelled-tint))] px-3 py-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[rgb(var(--status-cancelled))]">
            Pobierz gotówkę
          </div>
          <div className="font-mono text-[24px] font-bold leading-none text-[rgb(var(--status-cancelled))]">
            {formatCurrency(order.total)}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-[13px] text-[rgb(var(--color-text-muted))]">
          {paymentLabel(order.paymentMethod)} —{" "}
          <span className="font-mono font-semibold text-[rgb(var(--color-text-primary))]">
            {formatCurrency(order.total)}
          </span>
        </div>
      )}

      <div className="mt-auto pt-5">
        <Button
          type="button"
          variant="primary"
          size="xl"
          className="w-full"
          onClick={onRequestRelease}
        >
          Wydano
        </Button>
      </div>
    </article>
  );
}

function ItemLine({ item }: { item: OrderTrackingItemDto }) {
  return (
    <li className="flex items-baseline gap-2.5">
      <span className="shrink-0 font-mono text-[14px] font-bold text-[rgb(var(--color-text-primary))]">
        {item.quantity}×
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-[rgb(var(--color-text-primary))]">
          {item.productName}
          {item.variantName && (
            <span className="font-normal text-[rgb(var(--color-text-muted))]">
              {" · "}
              {item.variantName}
            </span>
          )}
        </div>
        {item.addons.length > 0 && (
          <div className="text-[12px] text-[rgb(var(--color-text-muted))]">
            + {item.addons.map((a) => a.name).join(", ")}
          </div>
        )}
      </div>
    </li>
  );
}
