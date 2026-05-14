import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { Phone } from "lucide-react";
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
      className={`flex flex-col rounded-lg border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${theme.accent} ${
        timer.pulse
          ? "motion-safe:animate-urgent-pulse motion-reduce:border-red-500 motion-reduce:ring-1 motion-reduce:ring-red-200"
          : ""
      }`}
    >
      <header className="flex items-baseline justify-between gap-3">
        <div className="font-mono text-[20px] font-semibold tracking-tight text-slate-900">
          {order.orderNumber}
        </div>
        <div className={`text-xs ${timer.color}`}>{relativeTime(order.placedAt)}</div>
      </header>

      <div className="mt-3 text-[28px] font-semibold leading-tight tracking-tight text-slate-900">
        {order.customerName}
      </div>

      <a
        href={`tel:${order.customerPhone}`}
        className="mt-2 inline-flex items-center gap-2 text-[15px] font-medium text-primary hover:underline"
      >
        <Phone className="h-4 w-4" aria-hidden="true" />
        {order.customerPhone}
      </a>

      <ul className="mt-4 space-y-1.5 text-[14px] text-slate-700">
        {(order.items ?? []).map((item, idx) => (
          <ItemLine key={idx} item={item} />
        ))}
      </ul>

      {cashOnPickup ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
            Pobierz gotówkę
          </div>
          <div className="font-mono text-[24px] font-semibold leading-none">
            {formatCurrency(order.total)}
          </div>
        </div>
      ) : (
        <div className="mt-4 text-[13px] text-slate-500">
          {paymentLabel(order.paymentMethod)} — {formatCurrency(order.total)}
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
    <li>
      <div>
        <span className="font-medium text-slate-900">
          {item.quantity}× {item.productName}
        </span>
        {item.variantName && (
          <span className="text-slate-500"> {item.variantName}</span>
        )}
      </div>
      {item.addons.length > 0 && (
        <div className="ml-4 text-[13px] text-slate-500">
          + {item.addons.map((a) => a.name).join(", ")}
        </div>
      )}
    </li>
  );
}
