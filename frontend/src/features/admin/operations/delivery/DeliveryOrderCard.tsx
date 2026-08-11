import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import type {
  AdminOrderListItemDto,
  OrderTrackingAddressDto,
  OrderTrackingItemDto,
} from "@/shared/api/orderApi";
import { useElapsedTick } from "../shared/useElapsedTick";
import { orderItemAddonLines } from "../shared/orderItemMeta";
import { cashChangeText } from "@/shared/lib/cashChange";

function zl(raw: string | number): string {
  const n = typeof raw === "number" ? raw : Number.parseFloat(raw);
  if (!Number.isFinite(n)) return String(raw);
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

function fullAddress(addr: OrderTrackingAddressDto | null): string {
  if (!addr) return "—";
  return `${addr.street} ${addr.buildingNumber}${addr.apartmentNumber ? `/${addr.apartmentNumber}` : ""}`;
}

function navUrl(addr: OrderTrackingAddressDto | null): string {
  if (!addr) return "#";
  const q = [
    addr.street,
    addr.buildingNumber,
    addr.apartmentNumber,
    addr.postalCode,
    addr.city,
  ]
    .filter(Boolean)
    .join(" ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

function elapsedMin(iso: string, nowMs: number): number {
  return Math.max(0, Math.floor((nowMs - new Date(iso).getTime()) / 60_000));
}

interface ItemListProps {
  items: OrderTrackingItemDto[];
  compact?: boolean;
}

export function DeliveryItemList({ items, compact = false }: ItemListProps) {
  return (
    <div
      style={{
        marginTop: compact ? 8 : 10,
        paddingTop: compact ? 8 : 10,
        borderTop: "1px dashed rgb(var(--color-border-subtle))",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      {items.map((it, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            gap: 8,
            fontSize: 12,
            color: "rgb(var(--color-text-body))",
            lineHeight: 1.4,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "rgb(var(--color-text-primary))",
            }}
          >
            {it.quantity}×
          </span>
          <span style={{ fontWeight: 500 }}>
            {it.productName}
            {it.variantName && (
              <span style={{ color: "rgb(var(--color-text-muted))" }}>
                {" · "}
                {it.variantName}
              </span>
            )}
            {orderItemAddonLines(it).map((line) => (
              <span
                key={line}
                style={{
                  display: "block",
                  fontWeight: 400,
                  color: "rgb(var(--color-text-muted))",
                }}
              >
                {line}
              </span>
            ))}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {zl(it.unitPrice)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface DeliveryRowProps {
  order: AdminOrderListItemDto;
  variant: "to-collect" | "in-transit";
  isLast: boolean;
  primaryPending: boolean;
  onPrimary: () => void;
}

export function DeliveryRow({
  order,
  variant,
  isLast,
  primaryPending,
  onPrimary,
}: DeliveryRowProps) {
  const now = useElapsedTick();
  const addr = order.deliveryAddress;
  const address = fullAddress(addr);
  const since = elapsedMin(order.placedAt, now);
  const isToCollect = variant === "to-collect";
  const primaryLabel = isToCollect ? "Wyjechało →" : "✓ Doręczone";
  const primaryBg = isToCollect ? "rgb(var(--color-primary))" : "rgb(var(--status-ready))";
  const cash = cashChangeText(order.cashChangeFrom, order.total);

  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: isLast ? "none" : "1px solid rgb(var(--color-border-subtle))",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>
          {order.orderNumber}
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>
          {zl(order.total)}
        </span>
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: "rgb(var(--color-text-primary))",
          letterSpacing: "-0.005em",
        }}
      >
        {address}
      </div>
      <div
        style={{
          fontSize: 13,
          color: "rgb(var(--color-text-muted))",
          marginTop: 4,
        }}
      >
        {order.customerName}
        {isToCollect ? (
          <>
            {/* D-03: kurier ma wiedzieć, ILE wydać, nie z czego liczyć. */}
            {" · "}
            <span
              style={
                cash.warn
                  ? { color: "rgb(var(--status-cancelled))", fontWeight: 600 }
                  : undefined
              }
            >
              {cash.text}
            </span>
            {addr?.notes && <span> · {addr.notes}</span>}
          </>
        ) : (
          <>
            {addr?.city ? ` · ${addr.city}` : ""}
            {` · w drodze od ${since} min`}
          </>
        )}
      </div>
      <DeliveryItemList items={order.items} />
      <div className="flex flex-wrap gap-2" style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={onPrimary}
          disabled={primaryPending}
          style={{
            flex: 1,
            minWidth: 130,
            height: 38,
            borderRadius: 8,
            border: "none",
            background: primaryBg,
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            cursor: primaryPending ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: primaryPending ? 0.7 : 1,
          }}
        >
          {primaryPending ? "Zapisywanie…" : primaryLabel}
        </button>
        <a
          href={navUrl(addr)}
          target="_blank"
          rel="noopener noreferrer"
          title="Nawiguj"
          style={{
            height: 38,
            padding: "0 12px",
            borderRadius: 8,
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-card))",
            color: "rgb(var(--status-out))",
            fontSize: 13,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
          }}
        >
          🧭 Nawiguj
        </a>
        <a
          href={`tel:${order.customerPhone}`}
          style={{
            height: 38,
            padding: "0 12px",
            borderRadius: 8,
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-card))",
            color: "rgb(var(--status-out))",
            fontSize: 13,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
          }}
        >
          <Phone size={14} strokeWidth={1.7} aria-hidden /> Zadzwoń
        </a>
        {isToCollect && (
          <Link
            to={`/admin/orders/${order.id}`}
            style={{
              height: 38,
              padding: "0 12px",
              borderRadius: 8,
              border: "1px solid rgb(var(--color-border-card))",
              background: "rgb(var(--color-bg-card))",
              color: "rgb(var(--color-text-body))",
              fontSize: 13,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
            }}
          >
            Szczegóły
          </Link>
        )}
      </div>
    </div>
  );
}
