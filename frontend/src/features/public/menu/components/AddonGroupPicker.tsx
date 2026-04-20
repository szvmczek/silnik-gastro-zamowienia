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
    <fieldset className="space-y-2">
      <legend className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-900">
          {group.name}
          {group.required ? <span className="ml-1 text-rose-600">*</span> : null}
        </span>
        <span
          className={cn(
            "text-xs font-medium",
            invalid ? "text-rose-600" : "text-slate-500"
          )}
        >
          {rangeLabel(group)}
        </span>
      </legend>
      <div className="space-y-1.5">
        {group.addons.map((addon) => {
          const checked = selected.has(addon.id);
          const disabled = !checked && hitMax;
          return (
            <label
              key={addon.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition-colors",
                checked
                  ? "border-primary bg-primary/5"
                  : "border-slate-200 hover:border-slate-300",
                disabled && "cursor-not-allowed opacity-50"
              )}
            >
              <span className="flex items-center gap-2">
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={() => onToggle(group.id, addon.id)}
                />
                <span className="font-medium text-slate-800">{addon.name}</span>
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {Number(addon.price) === 0
                  ? "gratis"
                  : `+ ${formatPrice(addon.price, currency)}`}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
