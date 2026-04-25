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

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderNumber: string;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export function CancelOrderDialog({
  open,
  onOpenChange,
  orderNumber,
  isSubmitting,
  onConfirm,
}: CancelOrderDialogProps) {
  // The reason field is local-only — backend's UpdateOrderStatusRequest
  // accepts only { version, status }. We render the textarea so the operator
  // gets a moment of friction (jot a note, see the deliberation), but we
  // deliberately don't send the value anywhere. If/when the API gains a
  // cancellation_reason field, wire it in onConfirm.
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setConfirmed(false);
    }
  }, [open]);

  const canSubmit = confirmed && !isSubmitting;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[520px]">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Anulować zamówienie{" "}
              <span className="font-mono">{orderNumber}</span>?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Klient zobaczy zmianę statusu na stronie śledzenia. Tej akcji
              nie można cofnąć.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-1">
            <Label htmlFor="cancel-reason">
              Powód anulowania (opcjonalny, tylko do Twoich notatek)
            </Label>
            <textarea
              id="cancel-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="np. brak składnika, klient odwołał, błędne dane…"
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
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
              className="cursor-pointer text-sm font-normal text-slate-700"
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
            disabled={!canSubmit}
            onClick={onConfirm}
          >
            {isSubmitting ? "Anulowanie…" : "Anuluj zamówienie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
