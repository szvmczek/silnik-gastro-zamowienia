import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";
import type { FulfillmentType, OrderStatus } from "@/shared/api/orderApi";

export interface OrderFiltersValue {
  status: OrderStatus | null;
  fulfillmentType: FulfillmentType | null;
  dateFrom: string | null;
  dateTo: string | null;
}

interface OrderFiltersProps {
  value: OrderFiltersValue;
  onChange: (next: OrderFiltersValue) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const statusOptions: { value: OrderStatus | null; label: string }[] = [
  { value: null, label: "Wszystkie" },
  { value: "NEW", label: "Nowe" },
  { value: "CONFIRMED", label: "Potwierdzone" },
  { value: "IN_PREPARATION", label: "W przygotowaniu" },
  { value: "READY", label: "Gotowe" },
  { value: "OUT_FOR_DELIVERY", label: "W drodze" },
  { value: "DELIVERED", label: "Dostarczone" },
  { value: "CANCELED", label: "Anulowane" },
];

const fulfillmentOptions: { value: FulfillmentType | null; label: string }[] = [
  { value: null, label: "Wszystkie" },
  { value: "DELIVERY", label: "Dostawa" },
  { value: "PICKUP", label: "Odbiór" },
];

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-3 text-[13px] font-medium transition-colors",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}

const SECTION_LABEL =
  "text-[11px] font-semibold uppercase tracking-wider text-slate-500";

export function OrderFilters({
  value,
  onChange,
  onReset,
  hasActiveFilters,
}: OrderFiltersProps) {
  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="space-y-2">
        <div className={SECTION_LABEL}>Status</div>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <FilterChip
              key={opt.value ?? "all"}
              active={value.status === opt.value}
              onClick={() => onChange({ ...value, status: opt.value })}
            >
              {opt.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className={SECTION_LABEL}>Typ</div>
        <div className="flex flex-wrap gap-2">
          {fulfillmentOptions.map((opt) => (
            <FilterChip
              key={opt.value ?? "all"}
              active={value.fulfillmentType === opt.value}
              onClick={() =>
                onChange({ ...value, fulfillmentType: opt.value })
              }
            >
              {opt.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label htmlFor="filter-date-from" className={SECTION_LABEL}>
            Od
          </label>
          <input
            id="filter-date-from"
            type="date"
            value={value.dateFrom ?? ""}
            onChange={(e) =>
              onChange({ ...value, dateFrom: e.target.value || null })
            }
            className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="filter-date-to" className={SECTION_LABEL}>
            Do
          </label>
          <input
            id="filter-date-to"
            type="date"
            value={value.dateTo ?? ""}
            onChange={(e) =>
              onChange({ ...value, dateTo: e.target.value || null })
            }
            className="h-8 rounded-md border border-slate-200 bg-white px-3 text-[13px] text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        {hasActiveFilters && (
          <div className="ml-auto">
            <Button type="button" variant="ghost" size="sm" onClick={onReset}>
              Wyczyść filtry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
