import { cn } from "@/shared/lib/cn";
import { formatPrice } from "../lib/formatPrice";
import type { PublicVariantDto } from "@/shared/api/menuApi";

interface Props {
  variants: PublicVariantDto[];
  selectedId: number | null;
  onChange: (id: number) => void;
  currency: string;
}

export function VariantPicker({ variants, selectedId, onChange, currency }: Props) {
  if (!variants.length) return null;

  return (
    <fieldset>
      <div className="mb-2 flex items-baseline justify-between">
        <legend className="text-[13px] font-semibold text-slate-900">Rozmiar</legend>
        <span className="text-[11px] text-slate-500">Wybierz jeden</span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {variants.map((variant) => {
          const active = variant.id === selectedId;
          return (
            <label
              key={variant.id}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-md border-2 p-3.5 text-[14px] transition-colors",
                active
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 hover:border-slate-300"
              )}
            >
              <span className="flex items-center gap-3">
                <input
                  type="radio"
                  name="variant"
                  value={variant.id}
                  checked={active}
                  onChange={() => onChange(variant.id)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    active ? "border-primary" : "border-slate-300"
                  )}
                  aria-hidden="true"
                >
                  {active ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                </span>
                <span
                  className={cn(
                    "text-slate-800",
                    active && "font-semibold text-slate-900"
                  )}
                >
                  {variant.name}
                </span>
              </span>
              <span className="font-semibold text-slate-900">
                {formatPrice(variant.price, currency)}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
