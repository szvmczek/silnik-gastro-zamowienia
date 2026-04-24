import { Checkbox } from "@/shared/components/ui/Checkbox";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "../lib/formatPrice";
import type { PublicAddonGroupDto } from "@/shared/api/menuApi";

interface Props {
  group: PublicAddonGroupDto;
  selected: Set<number>;
  onToggle: (groupId: number, addonId: number) => void;
  currency: string;
}

function rangeLabel(group: PublicAddonGroupDto): string {
  if (group.minSelect === 0 && group.maxSelect === 1) return "opcjonalnie (max 1)";
  if (group.minSelect === 0) return `opcjonalnie (max ${group.maxSelect})`;
  if (group.minSelect === group.maxSelect) return `wybierz ${group.minSelect}`;
  return `wybierz ${group.minSelect}–${group.maxSelect}`;
}

export function AddonGroupPicker({ group, selected, onToggle, currency }: Props) {
  const hitMax = selected.size >= group.maxSelect;
  const invalid = selected.size < group.minSelect;

  return (
    <fieldset>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <legend className="text-[13px] font-semibold text-slate-900">
          {group.name}
          {group.required ? <span className="ml-1 text-rose-600">*</span> : null}
        </legend>
        <span
          className={cn(
            "text-[11px]",
            invalid ? "font-medium text-rose-600" : "text-slate-500"
          )}
        >
          {rangeLabel(group)}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {group.addons.map((addon) => {
          const checked = selected.has(addon.id);
          const disabled = !checked && hitMax;
          return (
            <label
              key={addon.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-md border p-3 text-[13px] transition-colors",
                checked
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 hover:border-slate-300",
                disabled && "cursor-not-allowed opacity-50",
                !disabled && "cursor-pointer"
              )}
            >
              <span className="flex items-center gap-2.5">
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => onToggle(group.id, addon.id)}
                />
                <span
                  className={cn(
                    "text-slate-800",
                    checked && "font-medium text-slate-900"
                  )}
                >
                  {addon.name}
                </span>
              </span>
              <span className="whitespace-nowrap text-[12px] text-slate-500">
                {Number(addon.price) === 0
                  ? "gratis"
                  : `+${formatPrice(addon.price, currency)}`}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
