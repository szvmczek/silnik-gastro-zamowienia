import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import { Label } from "@/shared/components/ui/Label";

const REASON_MAX = 500;

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  isSubmitting: boolean;
  onConfirm: (reason: string) => void;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  orderNumber,
  isSubmitting,
  onConfirm,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setConfirmed(false);
      setTouched(false);
    }
  }, [open]);

  const trimmed = reason.trim();
  const reasonInvalid = trimmed.length === 0;
  const tooLong = reason.length > REASON_MAX;
  const canSubmit = confirmed && !reasonInvalid && !tooLong && !isSubmitting;

  const handleConfirm = () => {
    setTouched(true);
    if (!canSubmit) return;
    onConfirm(trimmed);
  };

  const showReasonError = touched && reasonInvalid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--status-cancelled-tint))] text-[rgb(var(--status-cancelled))]">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
              Anulować zamówienie{" "}
              <span className="font-mono">{orderNumber}</span>?
            </h2>
            <p className="mt-1 text-sm text-[rgb(var(--color-text-body))]">
              Klient zobaczy zmianę statusu na stronie śledzenia. Tej akcji
              nie można cofnąć.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="cancel-reason">Powód anulowania (wymagany)</Label>
            <textarea
              id="cancel-reason"
              rows={4}
              value={reason}
              maxLength={REASON_MAX}
              onChange={(e) => setReason(e.target.value)}
              placeholder="np. brak składnika, klient odwołał, błędne dane…"
              aria-invalid={showReasonError}
              className="w-full rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] px-3 py-2 text-sm text-[rgb(var(--color-text-primary))] placeholder:text-[rgb(var(--color-text-faint))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] aria-[invalid=true]:border-[rgb(var(--status-cancelled))]"
            />
            <div className="flex items-start justify-between text-xs">
              {showReasonError ? (
                <span className="text-[rgb(var(--status-cancelled))]">
                  Podaj powód anulowania.
                </span>
              ) : (
                <span className="text-[rgb(var(--color-text-muted))]">
                  Powód zapisuje się w historii statusów zamówienia.
                </span>
              )}
              <span
                className={
                  tooLong
                    ? "text-[rgb(var(--status-cancelled))]"
                    : "text-[rgb(var(--color-text-faint))]"
                }
              >
                {reason.length} / {REASON_MAX}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              id="cancel-confirmed"
              checked={confirmed}
              onCheckedChange={(value) => setConfirmed(value === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="cancel-confirmed"
              className="cursor-pointer text-sm font-normal text-[rgb(var(--color-text-body))]"
            >
              Rozumiem, że ta akcja jest nieodwracalna.
            </Label>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Zachowaj zamówienie
          </Button>
          <Button
            type="button"
            variant="dangerOutline"
            disabled={!confirmed || isSubmitting || tooLong}
            onClick={handleConfirm}
          >
            {isSubmitting ? "Anulowanie…" : "Anuluj zamówienie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
