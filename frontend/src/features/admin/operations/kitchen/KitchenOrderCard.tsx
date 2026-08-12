import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import {
  updateOrderStatus,
  type AdminOrderDto,
  type AdminOrderListItemDto,
  type FulfillmentType,
  type OrderStatus,
  type OrderTrackingItemDto,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { statusLabel } from "@/shared/components/ui/OrderStatusBadge";
import { useElapsedTick } from "../shared/useElapsedTick";
import { orderItemAddonLines } from "../shared/orderItemMeta";
import { ItemNoteLine } from "../shared/ItemNoteLine";

interface KitchenOrderCardProps {
  order: AdminOrderListItemDto;
  status: OrderStatus;
  urgent?: boolean;
  highlightNote?: boolean;
  onOpenEta: () => void;
}

function zl(raw: string | number): string {
  const n = typeof raw === "number" ? raw : Number.parseFloat(raw);
  if (!Number.isFinite(n)) return String(raw);
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

function minAgo(placedIso: string, nowMs: number): string {
  const m = Math.max(0, Math.floor((nowMs - new Date(placedIso).getTime()) / 60_000));
  if (m === 0) return "teraz";
  if (m === 1) return "1 min temu";
  return `${m} min temu`;
}

function elapsedMin(placedIso: string, nowMs: number): number {
  return Math.max(0, Math.floor((nowMs - new Date(placedIso).getTime()) / 60_000));
}

function formatEtaTime(etaMinutes: number, etaSetAt: string | null): string {
  if (!etaSetAt) return `${etaMinutes} min`;
  const target = new Date(new Date(etaSetAt).getTime() + etaMinutes * 60_000);
  return target.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
}

const FULFILLMENT_LABEL: Record<FulfillmentType, string> = {
  DELIVERY: "Dostawa",
  PICKUP: "Odbiór",
};

export function KitchenOrderCard({
  order,
  status,
  urgent = false,
  highlightNote = true,
  onOpenEta,
}: KitchenOrderCardProps) {
  const queryClient = useQueryClient();
  const now = useElapsedTick();
  const isNew = status === "NEW";
  const isConfirmed = status === "CONFIRMED";
  const isPrep = status === "IN_PREPARATION";

  const borderColor = isNew
    ? "rgb(var(--status-new))"
    : isConfirmed
      ? "rgb(var(--status-confirmed))"
      : isPrep
        ? "rgb(var(--color-primary))"
        : "rgb(var(--status-ready))";

  const mutation = useMutation({
    mutationFn: (next: OrderStatus) =>
      updateOrderStatus(order.id, { status: next, version: order.version }),
    onSuccess: (data: AdminOrderDto) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.setQueryData(["admin", "orders", "detail", data.id], data);
      toast.success(`${order.orderNumber} → ${statusLabel(data.status)}`);
    },
    onError: (err) => {
      const httpStatus = err instanceof AxiosError ? err.response?.status : undefined;
      if (httpStatus === 409) {
        toast.error("Ktoś inny zmienił zamówienie. Lista odświeżona.");
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
        return;
      }
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zmienić statusu");
    },
  });

  const fulfillmentLabel = FULFILLMENT_LABEL[order.fulfillmentType];
  const isDelivery = order.fulfillmentType === "DELIVERY";
  const elapsedFromPlaced = elapsedMin(order.placedAt, now);
  const timeLabel = isPrep ? `od ${elapsedFromPlaced} min` : minAgo(order.placedAt, now);

  return (
    <div
      className={cn(urgent && isPrep && "motion-safe:animate-pulse-new")}
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        borderLeft: `4px solid ${borderColor}`,
        position: "relative",
        transition: "border-color 180ms",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 16,
                fontWeight: 700,
                color: "rgb(var(--color-text-primary))",
              }}
            >
              {order.orderNumber}
            </span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 6px",
                borderRadius: 4,
                background: isDelivery
                  ? "rgb(var(--status-out-tint))"
                  : "rgb(var(--color-bg-section))",
                color: isDelivery
                  ? "rgb(var(--status-out))"
                  : "rgb(var(--color-text-body))",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {fulfillmentLabel}
            </span>
          </div>
          <div
            style={{
              fontSize: 13,
              color: "rgb(var(--color-text-body))",
              marginTop: 2,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span>{order.customerName}</span>
            <span style={{ color: "rgb(var(--color-text-faint))" }}>·</span>
            {order.etaMinutes !== null ? (
              <button
                type="button"
                title="Edytuj ETA"
                onClick={onOpenEta}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgb(var(--color-text-body))",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ color: "rgb(var(--color-text-muted))", fontWeight: 400 }}>ETA:</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>
                  {formatEtaTime(order.etaMinutes, order.etaSetAt)}
                </span>
                <span style={{ fontSize: 11, opacity: 0.6 }}>✏️</span>
              </button>
            ) : (
              <button
                type="button"
                title="Ustaw ETA"
                onClick={onOpenEta}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  fontWeight: 600,
                  color: "rgb(var(--color-primary))",
                  background: "transparent",
                  border: "1px dashed rgb(var(--color-primary))",
                  borderRadius: 6,
                  padding: "1px 8px",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <span style={{ color: "rgb(var(--color-text-muted))", fontWeight: 400 }}>ETA:</span>
                <span>+ Ustaw</span>
              </button>
            )}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 16,
              fontWeight: 700,
              color: "rgb(var(--color-text-primary))",
            }}
          >
            {zl(order.total)}
          </div>
          <div
            style={{
              fontSize: 11,
              color: urgent ? "rgb(var(--status-cancelled))" : "rgb(var(--color-text-muted))",
              marginTop: 2,
              fontWeight: urgent ? 700 : 400,
              display: "flex",
              alignItems: "center",
              gap: 4,
              justifyContent: "flex-end",
            }}
          >
            <Clock size={14} strokeWidth={1.7} aria-hidden />
            {timeLabel}
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px dashed rgb(var(--color-border-subtle))",
        }}
      >
        {order.items.map((it, i) => (
          <KitchenItemRow key={i} item={it} highlightNote={highlightNote} />
        ))}
        {order.customerNotes && (
          <div
            style={{
              marginTop: 6,
              padding: "8px 10px",
              background: highlightNote ? "#FFF8E1" : "transparent",
              border: highlightNote
                ? "1px solid #FCD34D"
                : "1px dashed rgb(var(--color-border-card))",
              borderLeft: highlightNote
                ? "3px solid rgb(var(--status-new))"
                : "1px dashed rgb(var(--color-border-card))",
              borderRadius: 6,
              fontSize: 13,
              color: highlightNote ? "#78350F" : "rgb(var(--color-text-muted))",
              lineHeight: 1.4,
              display: "flex",
              gap: 8,
              alignItems: "flex-start",
            }}
          >
            {highlightNote && (
              <span
                style={{
                  color: "rgb(var(--status-new))",
                  flexShrink: 0,
                  marginTop: 1,
                  display: "inline-flex",
                }}
              >
                <AlertTriangle size={16} strokeWidth={1.7} aria-hidden />
              </span>
            )}
            <span>
              <strong>Notka:</strong> {order.customerNotes}
            </span>
          </div>
        )}
      </div>

      {isNew && (
        <button
          type="button"
          onClick={() => mutation.mutate("CONFIRMED")}
          disabled={mutation.isPending}
          style={{
            width: "100%",
            height: 40,
            marginTop: 12,
            borderRadius: 8,
            border: "none",
            background: "rgb(var(--status-new))",
            color: "#1A1A1A",
            fontSize: 14,
            fontWeight: 600,
            cursor: mutation.isPending ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: mutation.isPending ? 0.7 : 1,
          }}
        >
          {mutation.isPending ? "Zapisywanie…" : "Potwierdź zamówienie →"}
        </button>
      )}
      {isConfirmed && (
        <button
          type="button"
          onClick={() => mutation.mutate("IN_PREPARATION")}
          disabled={mutation.isPending}
          style={{
            width: "100%",
            height: 40,
            marginTop: 12,
            borderRadius: 8,
            border: "none",
            background: "rgb(var(--status-confirmed))",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: mutation.isPending ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: mutation.isPending ? 0.7 : 1,
          }}
        >
          {mutation.isPending ? "Zapisywanie…" : "Rozpocznij przygotowanie →"}
        </button>
      )}
      {isPrep && (
        <button
          type="button"
          onClick={() => mutation.mutate("READY")}
          disabled={mutation.isPending}
          style={{
            width: "100%",
            height: 40,
            marginTop: 12,
            borderRadius: 8,
            border: "none",
            background: "rgb(var(--color-primary))",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: mutation.isPending ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            opacity: mutation.isPending ? 0.7 : 1,
          }}
        >
          {mutation.isPending ? "Zapisywanie…" : "✓ Gotowe"}
        </button>
      )}
    </div>
  );
}

function KitchenItemRow({
  item,
}: {
  item: OrderTrackingItemDto;
  highlightNote: boolean;
}) {
  const addonLines = orderItemAddonLines(item);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 10,
        padding: "6px 0",
        alignItems: "baseline",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          fontWeight: 700,
          color: "rgb(var(--color-text-primary))",
          minWidth: 22,
        }}
      >
        {item.quantity}×
      </span>
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "rgb(var(--color-text-primary))",
            lineHeight: 1.3,
          }}
        >
          {item.productName}
          {item.variantName && (
            <span
              style={{
                fontWeight: 400,
                color: "rgb(var(--color-text-muted))",
                marginLeft: 6,
              }}
            >
              · {item.variantName}
            </span>
          )}
        </div>
        {addonLines.length > 0 && (
          <div style={{ marginTop: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            {addonLines.map((line) => (
              <div
                key={line}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "rgb(var(--color-text-body))",
                  lineHeight: 1.35,
                  paddingLeft: 9,
                  borderLeft: "2px solid rgb(var(--color-primary))",
                }}
              >
                {line}
              </div>
            ))}
          </div>
        )}
        <ItemNoteLine item={item} />
      </div>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: "rgb(var(--color-text-muted))",
          whiteSpace: "nowrap",
        }}
      >
        {zl(item.unitPrice)}
      </span>
    </div>
  );
}

