import { Button } from "@/shared/components/ui/Button";
import { Kicker } from "@/shared/components/typography/Kicker";
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

interface StatusChipOption {
  value: OrderStatus | null;
  label: string;
  /** CSS var name (no `var()` wrap) for the chip's status dot. null for
   * the "all" chip — no dot, just label. D-009 muscle-memory mapping. */
  dotVar: string | null;
}

const statusOptions: StatusChipOption[] = [
  { value: null, label: "Wszystkie", dotVar: null },
  { value: "NEW", label: "Nowe", dotVar: "--status-new" },
  { value: "CONFIRMED", label: "Potwierdzone", dotVar: "--status-confirmed" },
  { value: "IN_PREPARATION", label: "W przygotowaniu", dotVar: "--status-prep" },
  { value: "READY", label: "Gotowe", dotVar: "--status-ready" },
  { value: "OUT_FOR_DELIVERY", label: "W drodze", dotVar: "--status-out" },
  { value: "DELIVERED", label: "Dostarczone", dotVar: "--status-delivered" },
  { value: "CANCELED", label: "Anulowane", dotVar: "--status-cancelled" },
];

const fulfillmentOptions: { value: FulfillmentType | null; label: string }[] = [
  { value: null, label: "Wszystkie" },
  { value: "DELIVERY", label: "Dostawa" },
  { value: "PICKUP", label: "Odbiór" },
];

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  dotVar?: string | null;
  children: React.ReactNode;
}

function FilterChip({ active, onClick, dotVar, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-[13px] font-medium transition-colors focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
        active
          ? "border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary))] text-white"
          : "border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-body))] hover:bg-[rgb(var(--color-bg-section))]"
      )}
    >
      {dotVar && (
        <span
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: `rgb(var(${dotVar}))` }}
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}

export function OrderFilters({
  value,
  onChange,
  onReset,
  hasActiveFilters,
}: OrderFiltersProps) {
  return (
    <div className="space-y-3 rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-4">
      <div className="space-y-2">
        <Kicker as="div">Status</Kicker>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((opt) => (
            <FilterChip
              key={opt.value ?? "all"}
              active={value.status === opt.value}
              dotVar={opt.dotVar}
              onClick={() => onChange({ ...value, status: opt.value })}
            >
              {opt.label}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Kicker as="div">Typ</Kicker>
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
          <Kicker as="label" {...{ htmlFor: "filter-date-from" }}>Od</Kicker>
          <input
            id="filter-date-from"
            type="date"
            value={value.dateFrom ?? ""}
            onChange={(e) =>
              onChange({ ...value, dateFrom: e.target.value || null })
            }
            className="h-9 rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] px-3 text-[13px] text-[rgb(var(--color-text-body))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          />
        </div>
        <div className="space-y-1">
          <Kicker as="label" {...{ htmlFor: "filter-date-to" }}>Do</Kicker>
          <input
            id="filter-date-to"
            type="date"
            value={value.dateTo ?? ""}
            onChange={(e) =>
              onChange({ ...value, dateTo: e.target.value || null })
            }
            className="h-9 rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] px-3 text-[13px] text-[rgb(var(--color-text-body))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
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
