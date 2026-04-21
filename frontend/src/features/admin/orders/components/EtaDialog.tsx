import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { cn } from "@/shared/lib/cn";

const PRESETS = [15, 30, 45, 60] as const;

interface EtaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEtaMinutes: number | null;
  onSubmit: (minutesFromNow: number) => void;
  isSubmitting: boolean;
}

export function EtaDialog({
  open,
  onOpenChange,
  currentEtaMinutes,
  onSubmit,
  isSubmitting,
}: EtaDialogProps) {
  const [selected, setSelected] = useState<number | null>(
    currentEtaMinutes ?? null
  );
  const [customValue, setCustomValue] = useState<string>("");

  const resolved = customValue.trim() !== ""
    ? Number.parseInt(customValue, 10)
    : selected;

  const isValid =
    resolved !== null &&
    Number.isInteger(resolved) &&
    resolved >= 0 &&
    resolved <= 480;

  const handleSubmit = () => {
    if (!isValid || resolved === null) return;
    onSubmit(resolved);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ustaw ETA</DialogTitle>
          <DialogDescription>
            Szacowany czas w minutach od teraz. Widoczny dla klienta na stronie
            trackingu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="mb-2">Presety</Label>
            <div className="grid grid-cols-4 gap-2">
              {PRESETS.map((minutes) => {
                const isActive =
                  customValue.trim() === "" && selected === minutes;
                return (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => {
                      setSelected(minutes);
                      setCustomValue("");
                    }}
                    className={cn(
                      "h-12 rounded-md border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      isActive
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {minutes} min
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="eta-custom">Własna wartość (min)</Label>
            <Input
              id="eta-custom"
              type="number"
              min={0}
              max={480}
              step={5}
              placeholder="np. 75"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
            />
            <p className="text-xs text-slate-500">Zakres 0–480 minut (8h).</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Zapisywanie…" : "Zapisz ETA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
