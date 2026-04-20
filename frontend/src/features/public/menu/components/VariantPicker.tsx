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
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-semibold text-slate-900">Wariant</legend>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {variants.map((variant) => {
          const active = variant.id === selectedId;
          return (
            <label
              key={variant.id}
              className={cn(
                "flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors",
                active
                  ? "border-primary bg-primary/5 text-slate-900"
                  : "border-slate-200 text-slate-700 hover:border-slate-300"
              )}
            >
              <span className="flex items-center gap-2">
                <input
                  type="radio"
                  name="variant"
                  value={variant.id}
                  checked={active}
                  onChange={() => onChange(variant.id)}
                  className="h-4 w-4 text-primary focus:ring-primary"
                />
                <span className="font-medium">{variant.name}</span>
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
