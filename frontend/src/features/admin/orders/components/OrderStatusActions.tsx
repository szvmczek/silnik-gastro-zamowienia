import { useState } from "react";
import { Button } from "@/shared/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import type { FulfillmentType, OrderStatus } from "@/shared/api/orderApi";
import { isTerminal, nextAllowedStatuses } from "../lib/transitions";
import { statusLabel } from "./OrderStatusBadge";

interface OrderStatusActionsProps {
  currentStatus: OrderStatus;
  fulfillmentType: FulfillmentType;
  onChangeStatus: (next: OrderStatus) => void;
  isSubmitting: boolean;
}

export function OrderStatusActions({
  currentStatus,
  fulfillmentType,
  onChangeStatus,
  isSubmitting,
}: OrderStatusActionsProps) {
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (isTerminal(currentStatus)) {
    return (
      <p className="text-sm text-slate-500">
        Zamówienie jest w stanie finalnym — dalsze zmiany statusu nie są możliwe.
      </p>
    );
  }

  const forward = nextAllowedStatuses(currentStatus, fulfillmentType).filter(
    (s) => s !== "CANCELED"
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {forward.map((status) => (
          <Button
            key={status}
            type="button"
            onClick={() => onChangeStatus(status)}
            disabled={isSubmitting}
          >
            → {statusLabel(status)}
          </Button>
        ))}
        {forward.length === 0 && (
          <span className="text-sm text-slate-500">
            Brak kolejnych statusów poza anulowaniem.
          </span>
        )}
      </div>

      <div className="border-t border-slate-200 pt-3">
        <Button
          type="button"
          variant="danger"
          size="sm"
          disabled={isSubmitting}
          onClick={() => setConfirmCancel(true)}
        >
          Anuluj zamówienie
        </Button>
      </div>

      <Dialog open={confirmCancel} onOpenChange={setConfirmCancel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anulować zamówienie?</DialogTitle>
            <DialogDescription>
              Ta operacja jest nieodwracalna. Zamówienie przejdzie w stan
              "Anulowane" i nie będzie można go dalej edytować.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmCancel(false)}
              disabled={isSubmitting}
            >
              Wróć
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={isSubmitting}
              onClick={() => {
                setConfirmCancel(false);
                onChangeStatus("CANCELED");
              }}
            >
              {isSubmitting ? "Anulowanie…" : "Tak, anuluj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
