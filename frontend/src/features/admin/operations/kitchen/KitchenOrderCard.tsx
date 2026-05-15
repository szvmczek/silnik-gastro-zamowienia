import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Button } from "@/shared/components/ui/Button";
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
import { statusTheme } from "../shared/statusColors";
import { timerEscalation } from "../shared/timerColor";
import { useElapsedTick } from "../shared/useElapsedTick";

interface KitchenOrderCardProps {
  order: AdminOrderListItemDto;
  onOpenEta: () => void;
}

interface PrimaryAction {
  label: string;
  next: OrderStatus;
  /* Bg color CSS var for the action button. AD-023 + Fix-up #5 F-020 visual
   * differentiation per bundle frame-kitchen:161-188: NEW→status-new,
   * CONFIRMED→status-confirmed, IN_PREPARATION→color-primary (red — Fix-up
   * #5 flip from emerald, supersedes AD-Δ11 original). Backend transitions:
   * NEW+CONFIRMED both jump straight to IN_PREPARATION (single-tap kuchnia),
   * IN_PREPARATION goes to READY. */
  bgVar: string;
  /* Text color — light-on-dark for confirmed/prep, dark-on-light for new
   * (amber bg needs dark text per WCAG). */
  textColor: string;
}

function primaryAction(status: OrderStatus): PrimaryAction | null {
  // AD-023: NEW and CONFIRMED collapse into a single "Przyjmij" / "Rozpocznij"
  // gesture that goes straight to IN_PREPARATION. CONFIRMED only appears when
  // an admin used the back-office /admin/orders flow.
  if (status === "NEW") {
    return {
      label: "Przyjmij",
      next: "IN_PREPARATION",
      bgVar: "--status-new",
      textColor: "text-[rgb(var(--color-text-primary))]",
    };
  }
  if (status === "CONFIRMED") {
    return {
      label: "Rozpocznij przygotowanie →",
      next: "IN_PREPARATION",
      bgVar: "--status-confirmed",
      textColor: "text-white",
    };
  }
  if (status === "IN_PREPARATION") {
    return {
      label: "✓ Gotowe",
      next: "READY",
      bgVar: "--color-primary",
      textColor: "text-white",
    };
  }
  return null;
}

interface FulfillmentBadge {
  label: string;
  bgVar: string;
  textVar: string;
}

function fulfillmentBadge(t: FulfillmentType): FulfillmentBadge {
  return t === "DELIVERY"
    ? {
        label: "Dostawa",
        bgVar: "--status-out-tint",
        textVar: "--status-out",
      }
    : {
        label: "Odbiór",
        bgVar: "--color-bg-section",
        textVar: "--color-text-body",
      };
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

export function KitchenOrderCard({ order, onOpenEta }: KitchenOrderCardProps) {
  const queryClient = useQueryClient();
  const action = primaryAction(order.status);
  const badge = fulfillmentBadge(order.fulfillmentType);
  const theme = statusTheme(order.status);
  const now = useElapsedTick();
  const timer = timerEscalation(order.placedAt, now);

  const mutation = useMutation({
    mutationFn: (next: OrderStatus) =>
      updateOrderStatus(order.id, { status: next, version: order.version }),
    onSuccess: (data: AdminOrderDto) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.setQueryData(["admin", "orders", "detail", data.id], data);
      toast.success(`${order.orderNumber} → ${statusLabel(data.status)}`);
    },
    onError: (err) => {
      const status = err instanceof AxiosError ? err.response?.status : undefined;
      if (status === 409) {
        toast.error("Ktoś inny zmienił zamówienie. Lista odświeżona.");
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
        return;
      }
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zmienić statusu");
    },
  });

  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border border-[rgb(var(--color-border-card))] border-l-4 bg-[rgb(var(--color-bg-card))] p-5",
        theme.accent,
        timer.pulse &&
          "motion-safe:animate-urgent-pulse motion-reduce:border-[rgb(var(--status-cancelled))] motion-reduce:ring-1 motion-reduce:ring-[rgb(var(--status-cancelled))]/30"
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[16px] font-bold tracking-tight text-[rgb(var(--color-text-primary))]">
              {order.orderNumber}
            </span>
            <span
              className="rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.04em]"
              style={{
                background: `rgb(var(${badge.bgVar}))`,
                color: `rgb(var(${badge.textVar}))`,
              }}
            >
              {badge.label}
            </span>
          </div>
          <div className={cn("mt-1 text-[12px]", timer.color)}>
            {relativeTime(order.placedAt)}
          </div>
        </div>
        <div className="text-right">
          {order.etaMinutes !== null ? (
            <button
              type="button"
              onClick={onOpenEta}
              className="inline-flex items-baseline gap-1.5 text-[13px] font-semibold text-[rgb(var(--color-text-body))] transition-colors hover:text-[rgb(var(--color-primary))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
              title="Zmień ETA"
            >
              <span className="text-[11px] font-normal uppercase tracking-[0.06em] text-[rgb(var(--color-text-muted))]">
                ETA
              </span>
              <span className="font-mono">
                {formatEta(order.etaMinutes, order.etaSetAt)}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenEta}
              className="inline-flex items-center gap-1 rounded-md border border-dashed border-[rgb(var(--color-primary))] px-2 py-0.5 text-[12px] font-semibold text-[rgb(var(--color-primary))] transition-colors hover:bg-[rgb(var(--color-primary-tint))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
            >
              + Ustaw ETA
            </button>
          )}
        </div>
      </header>

      <ul className="mt-4 space-y-1.5 border-t border-dashed border-[rgb(var(--color-border-subtle))] pt-3 text-[14px] text-[rgb(var(--color-text-primary))]">
        {(order.items ?? []).map((item, idx) => (
          <ItemLine key={idx} item={item} />
        ))}
      </ul>

      {order.customerNotes && (
        <div
          className="mt-4 flex items-start gap-2.5 rounded-md border border-[rgb(var(--status-new))]/40 border-l-4 border-l-[rgb(var(--status-new))] bg-[rgb(var(--status-new-tint))] p-3 text-[13px] text-[rgb(var(--color-text-primary))]"
        >
          <AlertTriangle
            className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--status-new))]"
            aria-hidden
          />
          <span className="whitespace-pre-line leading-[1.4]">
            <strong className="font-semibold">Notka:</strong> {order.customerNotes}
          </span>
        </div>
      )}

      {action && (
        <div className="mt-auto pt-5">
          <Button
            type="button"
            size="xl"
            className={cn("w-full border-0", action.textColor)}
            style={{ background: `rgb(var(${action.bgVar}))` }}
            onClick={() => mutation.mutate(action.next)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Zapisywanie…" : action.label}
          </Button>
        </div>
      )}
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
        <div className="font-medium leading-snug">
          {item.productName}
          {item.variantName && (
            <span className="font-normal text-[rgb(var(--color-text-muted))]">
              {" · "}
              {item.variantName}
            </span>
          )}
        </div>
        {item.addons.length > 0 && (
          <div className="ml-0 text-[12px] text-[rgb(var(--color-text-muted))]">
            + {item.addons.map((a) => a.name).join(", ")}
          </div>
        )}
      </div>
    </li>
  );
}
