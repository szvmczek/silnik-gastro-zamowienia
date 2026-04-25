import { Info } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import type { FulfillmentType, OrderStatus } from "@/shared/api/orderApi";
import { isTerminal, nextAllowedStatuses } from "../lib/transitions";
import { statusLabel } from "@/shared/components/OrderStatusBadge";

interface OrderStatusActionsProps {
  currentStatus: OrderStatus;
  fulfillmentType: FulfillmentType;
  onChangeStatus: (next: OrderStatus) => void;
  onOpenEta: () => void;
  onOpenCancel: () => void;
  isSubmitting: boolean;
}

interface PrimaryAction {
  label: string;
  helper: string;
  nextStatus: OrderStatus;
}

function getPrimaryAction(
  status: OrderStatus,
  fulfillmentType: FulfillmentType
): PrimaryAction | null {
  switch (status) {
    case "NEW":
      return {
        label: "Potwierdź zamówienie →",
        helper: "Następnie: W przygotowaniu",
        nextStatus: "CONFIRMED",
      };
    case "CONFIRMED":
      return {
        label: "Rozpocznij przygotowanie →",
        helper: "Następnie: Gotowe",
        nextStatus: "IN_PREPARATION",
      };
    case "IN_PREPARATION":
      return {
        label: "Oznacz jako gotowe →",
        helper:
          fulfillmentType === "DELIVERY"
            ? "Następnie: W drodze → Dostarczone"
            : "Następnie: Wydane klientowi",
        nextStatus: "READY",
      };
    case "READY":
      return fulfillmentType === "DELIVERY"
        ? {
            label: "Wydaj kurierowi →",
            helper: "Następnie: Dostarczone",
            nextStatus: "OUT_FOR_DELIVERY",
          }
        : {
            label: "Oznacz jako wydane →",
            helper: "Zamówienie zakończone",
            nextStatus: "DELIVERED",
          };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Oznacz jako dostarczone →",
        helper: "Zamówienie zakończone",
        nextStatus: "DELIVERED",
      };
    case "DELIVERED":
    case "CANCELED":
      return null;
  }
}

export function OrderStatusActions({
  currentStatus,
  fulfillmentType,
  onChangeStatus,
  onOpenEta,
  onOpenCancel,
  isSubmitting,
}: OrderStatusActionsProps) {
  if (isTerminal(currentStatus)) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
        <div className="text-sm text-slate-600">
          Zamówienie {statusLabel(currentStatus).toLowerCase()} — brak dalszych akcji.
        </div>
      </div>
    );
  }

  const primary = getPrimaryAction(currentStatus, fulfillmentType);

  // Sanity: in DEV, warn if our lookup disagrees with the state machine.
  // Production keeps rendering — UI is best-effort, the backend enforces.
  if (import.meta.env.DEV && primary) {
    const allowed = nextAllowedStatuses(currentStatus, fulfillmentType);
    if (!allowed.includes(primary.nextStatus)) {
      // eslint-disable-next-line no-console
      console.warn(
        `[G7] PrimaryAction lookup mismatch: ${currentStatus}/${fulfillmentType} → ${primary.nextStatus}, transitions.ts allows [${allowed.join(", ")}]`
      );
    }
  }

  return (
    <div className="space-y-9">
      {primary && (
        <div className="rounded-lg border-2 border-primary/20 bg-white p-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Następny krok
          </div>
          <Button
            type="button"
            variant="primary"
            size="xl"
            className="mt-2 w-full"
            onClick={() => onChangeStatus(primary.nextStatus)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Zapisywanie…" : primary.label}
          </Button>
          <div className="mt-3 flex items-start gap-2 text-xs text-slate-500">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{primary.helper}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={onOpenEta}
          disabled={isSubmitting}
        >
          Zmień ETA
        </Button>
        <Button
          type="button"
          variant="dangerOutline"
          size="lg"
          onClick={onOpenCancel}
          disabled={isSubmitting}
        >
          Anuluj zamówienie
        </Button>
      </div>
    </div>
  );
}
