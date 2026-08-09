import { Link } from "react-router-dom";
import type {
  AdminOrderListItemDto,
  OrderTrackingItemDto,
} from "@/shared/api/orderApi";
import { useElapsedTick } from "../shared/useElapsedTick";

interface PickupRowProps {
  order: AdminOrderListItemDto;
  slotEmphasis?: boolean;
}

function zl(raw: string | number): string {
  const n = typeof raw === "number" ? raw : Number.parseFloat(raw);
  if (!Number.isFinite(n)) return String(raw);
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

function fmtItemsBrief(items: OrderTrackingItemDto[]): string {
  if (!items.length) return "—";
  const fmt = (it: OrderTrackingItemDto) =>
    `${it.quantity}× ${it.productName}${it.variantName ? ` ${it.variantName}` : ""}`;
  if (items.length <= 3) return items.map(fmt).join(", ");
  const head = items.slice(0, 2).map(fmt).join(", ");
  return `${head} · +${items.length - 2} więcej`;
}

function formatSlot(order: AdminOrderListItemDto): string {
  if (order.etaMinutes !== null && order.etaSetAt) {
    const target = new Date(new Date(order.etaSetAt).getTime() + order.etaMinutes * 60_000);
    return target.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  }
  if (order.etaMinutes !== null) {
    const target = new Date(Date.now() + order.etaMinutes * 60_000);
    return target.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
  }
  return "—";
}

function elapsedMinSince(iso: string, nowMs: number): number {
  return Math.max(0, Math.floor((nowMs - new Date(iso).getTime()) / 60_000));
}

// Bundle frame-pickup:15-95 — row in a table card. Grid 6 columns at lg+:
// Slot (mono 24px) / Customer (22px bold) / Items brief (12px clamp-2) /
// Phone (mono 13px) / Total (mono 15px + paid status) / Action "Szczegóły →".
// At <lg stacks as vertical card with same data, since bundle assumes desktop.
export function PickupRow({ order, slotEmphasis = true }: PickupRowProps) {
  const now = useElapsedTick();
  const since = elapsedMinSince(order.placedAt, now);
  const slot = formatSlot(order);
  const itemsBrief = fmtItemsBrief(order.items);
  const detailHref = `/admin/orders/${order.id}`;

  return (
    <div
      className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[84px_1.1fr_1.6fr_150px_110px_140px]"
      style={{
        padding: "16px 20px",
        background: "rgb(var(--color-bg-card))",
        borderBottom: "1px solid rgb(var(--color-border-subtle))",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: slotEmphasis ? 24 : 16,
            fontWeight: 700,
            color: "rgb(var(--color-text-primary))",
            lineHeight: 1,
          }}
        >
          {slot}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgb(var(--color-text-faint))",
            marginTop: 4,
            fontWeight: 500,
          }}
        >
          slot
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "rgb(var(--color-text-primary))",
            letterSpacing: "-0.01em",
            lineHeight: 1.2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {order.customerName}
        </div>
        <div
          style={{
            fontSize: 12,
            color: "rgb(var(--color-text-muted))",
            marginTop: 4,
          }}
        >
          {order.orderNumber} · czeka {since} min
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        <div
          title={order.items
            .map(
              (it) =>
                `${it.quantity}× ${it.productName}${it.variantName ? ` ${it.variantName}` : ""}`,
            )
            .join(", ")}
          style={{
            fontSize: 12,
            color: "rgb(var(--color-text-body))",
            lineHeight: 1.35,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {itemsBrief}
        </div>
      </div>

      <div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "rgb(var(--color-text-body))",
            fontWeight: 600,
          }}
        >
          {order.customerPhone || "—"}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 15,
            fontWeight: 700,
            color: "rgb(var(--color-text-primary))",
          }}
        >
          {zl(order.total)}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgb(var(--color-text-muted))",
            marginTop: 2,
            fontWeight: 600,
          }}
        >
          {/* D-03: wydający musi wiedzieć, ile przygotować na resztę. */}
          {order.cashChangeFrom ? `Reszta z ${order.cashChangeFrom} zł` : "Gotówka odliczona"}
        </div>
      </div>

      <Link
        to={detailHref}
        style={{
          height: 44,
          borderRadius: 8,
          border: "1px solid rgb(var(--color-border-card))",
          background: "rgb(var(--color-bg-card))",
          color: "rgb(var(--color-text-primary))",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
        }}
      >
        Szczegóły →
      </Link>
    </div>
  );
}
