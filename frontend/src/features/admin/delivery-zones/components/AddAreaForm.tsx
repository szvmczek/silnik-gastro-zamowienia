import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Textarea } from "@/shared/components/ui/Textarea";
import { Checkbox } from "@/shared/components/ui/Checkbox";
import { parsePostalCodes } from "../lib/postalCode";

interface Props {
  onAdd: (areas: { city: string; postalCode: string | null }[]) => Promise<void>;
}

export function AddAreaForm({ onAdd }: Props) {
  const [city, setCity] = useState("");
  const [wholeCity, setWholeCity] = useState(false);
  const [codesRaw, setCodesRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCity("");
    setWholeCity(false);
    setCodesRaw("");
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (!city.trim()) return setError("Podaj miejscowość");

    let payload: { city: string; postalCode: string | null }[];
    if (wholeCity) {
      payload = [{ city: city.trim(), postalCode: null }];
    } else {
      const { valid, invalid } = parsePostalCodes(codesRaw);
      if (invalid.length > 0) {
        return setError(`Nieprawidłowy format: ${invalid.join(", ")}`);
      }
      if (valid.length === 0) {
        return setError("Podaj co najmniej jeden kod pocztowy");
      }
      payload = valid.map((postalCode) => ({ city: city.trim(), postalCode }));
    }

    setBusy(true);
    try {
      await onAdd(payload);
      reset();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? "Nie udało się zapisać");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <div>
        <Label htmlFor="area-city">Miejscowość</Label>
        <Input
          id="area-city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="np. Nowy Dwór Mazowiecki"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="whole-city"
          checked={wholeCity}
          onCheckedChange={(v) => setWholeCity(v === true)}
        />
        <Label htmlFor="whole-city" className="text-[13px]">
          Cała miejscowość (wszystkie kody pocztowe)
        </Label>
      </div>

      {!wholeCity && (
        <div>
          <Label htmlFor="area-codes">Kody pocztowe</Label>
          <Textarea
            id="area-codes"
            rows={3}
            value={codesRaw}
            onChange={(e) => setCodesRaw(e.target.value)}
            placeholder="05-100, 05-160&#10;05-180"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Oddziel przecinkiem lub nową linią. Format: 00-000 (lub 00000 — automatycznie sformatuję).
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Button onClick={submit} disabled={busy} size="sm">
        <Plus className="h-4 w-4" /> Dodaj obszar
      </Button>
    </div>
  );
}
