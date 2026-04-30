import { format, formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { Navigation, Phone } from "lucide-react";
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
      className={`flex flex-col rounded-lg border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${theme.border} ${
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

      {addr ? (
        <div className="mt-3 text-[20px] font-semibold leading-tight tracking-tight text-slate-900">
          <div>
            {addr.street} {addr.buildingNumber}
            {addr.apartmentNumber && `/${addr.apartmentNumber}`}
          </div>
          <div>
            {addr.postalCode} {addr.city}
          </div>
        </div>
      ) : (
        <div className="mt-3 text-[14px] text-rose-700">
          Brak adresu — zamówienie wygląda na pomyłkę.
        </div>
      )}

      {addr?.notes && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-[14px] text-amber-900">
          <span aria-hidden="true">📝 </span>
          <span className="whitespace-pre-line">{addr.notes}</span>
        </div>
      )}

      <div className="mt-4 flex items-baseline justify-between gap-3 text-[14px]">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-slate-900">{order.customerName}</div>
        </div>
        <a
          href={`tel:${order.customerPhone}`}
          className="inline-flex shrink-0 items-center gap-1.5 font-medium text-primary hover:underline"
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
          {order.customerPhone}
        </a>
      </div>

      {cashOnDelivery && (
        <div className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-rose-800">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-600">
            Pobierz gotówkę
          </div>
          <div className="font-mono text-[24px] font-semibold leading-none">
            {formatCurrency(order.total)}
          </div>
        </div>
      )}

      <ul className="mt-3 space-y-0.5 text-[13px] text-slate-600">
        {(order.items ?? []).map((item, idx) => (
          <CompactItemLine key={idx} item={item} />
        ))}
      </ul>

      {order.etaMinutes !== null && (
        <div className="mt-3 text-[13px] text-slate-500">
          ETA:{" "}
          <span className="text-slate-900">
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
        {addr && (
          <div className="flex gap-2">
            <a
              href={buildMapsHref(addr)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Navigation className="h-4 w-4" aria-hidden="true" />
              Nawiguj
            </a>
            <a
              href={`tel:${order.customerPhone}`}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-[13px] font-medium text-slate-700 hover:bg-slate-50"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Zadzwoń
            </a>
          </div>
        )}
      </div>
    </article>
  );
}

function CompactItemLine({ item }: { item: OrderTrackingItemDto }) {
  return (
    <li>
      {item.quantity}× {item.productName}
      {item.variantName && <span className="text-slate-500"> {item.variantName}</span>}
    </li>
  );
}
