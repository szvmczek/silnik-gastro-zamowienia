import { Info } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Kicker } from "@/shared/components/typography/Kicker";
import type { FulfillmentType, OrderStatus } from "@/shared/api/orderApi";
import { isTerminal, nextAllowedStatuses } from "../lib/transitions";
import { statusLabel } from "@/shared/components/ui/OrderStatusBadge";

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
      <div className="rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-section))] p-5">
        <div className="text-sm text-[rgb(var(--color-text-body))]">
          Zamówienie {statusLabel(currentStatus).toLowerCase()} — brak dalszych
          akcji.
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
    <div className="space-y-4">
      {primary && (
        <div className="rounded-xl border-2 border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-bg-card))] p-5">
          <Kicker className="block">Następny krok</Kicker>
          <Button
            type="button"
            variant="primary"
            size="xl"
            className="mt-3 w-full"
            onClick={() => onChangeStatus(primary.nextStatus)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Zapisywanie…" : primary.label}
          </Button>
          <div className="mt-3 flex items-start gap-2 text-xs text-[rgb(var(--color-text-muted))]">
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
