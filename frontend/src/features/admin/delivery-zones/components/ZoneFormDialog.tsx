import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/RadioGroup";
import { Switch } from "@/shared/components/ui/Switch";
import type { DeliveryZoneDto, DeliveryZoneType } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: DeliveryZoneDto | null;
  onSubmit: (values: { name: string; type: DeliveryZoneType; deliveryFee: number; active: boolean }) => Promise<void>;
}

export function ZoneFormDialog({ open, onOpenChange, initial, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<DeliveryZoneType>("FREE");
  const [fee, setFee] = useState("0");
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setType(initial?.type ?? "FREE");
      setFee(initial ? String(initial.deliveryFee) : "0");
      setActive(initial?.active ?? true);
      setError(null);
    }
  }, [open, initial]);

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) return setError("Nazwa jest wymagana");
    const feeNum = type === "PAID" ? Number(fee) : 0;
    if (type === "PAID" && (!Number.isFinite(feeNum) || feeNum <= 0)) {
      return setError("Strefa PAID wymaga kosztu większego niż 0");
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), type, deliveryFee: feeNum, active });
      onOpenChange(false);
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Błąd zapisu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edytuj strefę" : "Nowa strefa dostawy"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="zone-name">Nazwa</Label>
            <Input
              id="zone-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="np. Centrum, Modlin-Twierdza"
            />
          </div>

          <div>
            <Label>Typ strefy</Label>
            <RadioGroup
              value={type}
              onValueChange={(v) => setType(v as DeliveryZoneType)}
              className="mt-2 grid grid-cols-1 gap-2"
            >
              <label className="flex items-center gap-2 rounded-md border border-[rgb(var(--color-border-card))] p-2.5 text-sm">
                <RadioGroupItem value="FREE" /> Darmowa dostawa
              </label>
              <label className="flex items-center gap-2 rounded-md border border-[rgb(var(--color-border-card))] p-2.5 text-sm">
                <RadioGroupItem value="PAID" /> Płatna dostawa
              </label>
              <label className="flex items-center gap-2 rounded-md border border-[rgb(var(--color-border-card))] p-2.5 text-sm">
                <RadioGroupItem value="UNAVAILABLE" /> Niedostępne
              </label>
            </RadioGroup>
          </div>

          {type === "PAID" && (
            <div>
              <Label htmlFor="zone-fee">Koszt dostawy (zł)</Label>
              <Input
                id="zone-fee"
                type="number"
                step="0.01"
                min="0.01"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <Switch checked={active} onCheckedChange={setActive} id="zone-active" />
            <Label htmlFor="zone-active">Aktywna</Label>
          </div>

          {error && (
            <div
              className="rounded-md p-2 text-sm"
              style={{
                border: "1px solid rgb(var(--status-cancelled) / 0.3)",
                background: "rgb(var(--status-cancelled-tint))",
                color: "rgb(var(--status-cancelled))",
              }}
            >
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
            Anuluj
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Zapisuję…" : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
