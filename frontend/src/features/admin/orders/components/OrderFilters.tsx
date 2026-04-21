import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import type { FulfillmentType, OrderStatus } from "@/shared/api/orderApi";

const ALL = "ALL";

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

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: "NEW", label: "Nowe" },
  { value: "CONFIRMED", label: "Potwierdzone" },
  { value: "IN_PREPARATION", label: "W przygotowaniu" },
  { value: "READY", label: "Gotowe" },
  { value: "OUT_FOR_DELIVERY", label: "W drodze" },
  { value: "DELIVERED", label: "Dostarczone" },
  { value: "CANCELED", label: "Anulowane" },
];

const fulfillmentOptions: { value: FulfillmentType; label: string }[] = [
  { value: "DELIVERY", label: "Dostawa" },
  { value: "PICKUP", label: "Odbiór" },
];

export function OrderFilters({
  value,
  onChange,
  onReset,
  hasActiveFilters,
}: OrderFiltersProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="filter-status">Status</Label>
          <Select
            value={value.status ?? ALL}
            onValueChange={(v) =>
              onChange({ ...value, status: v === ALL ? null : (v as OrderStatus) })
            }
          >
            <SelectTrigger id="filter-status">
              <SelectValue placeholder="Wszystkie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Wszystkie</SelectItem>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-fulfillment">Rodzaj</Label>
          <Select
            value={value.fulfillmentType ?? ALL}
            onValueChange={(v) =>
              onChange({
                ...value,
                fulfillmentType: v === ALL ? null : (v as FulfillmentType),
              })
            }
          >
            <SelectTrigger id="filter-fulfillment">
              <SelectValue placeholder="Wszystkie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Wszystkie</SelectItem>
              {fulfillmentOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-date-from">Od</Label>
          <Input
            id="filter-date-from"
            type="date"
            value={value.dateFrom ?? ""}
            onChange={(e) =>
              onChange({ ...value, dateFrom: e.target.value || null })
            }
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="filter-date-to">Do</Label>
          <Input
            id="filter-date-to"
            type="date"
            value={value.dateTo ?? ""}
            onChange={(e) =>
              onChange({ ...value, dateTo: e.target.value || null })
            }
          />
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onReset}>
            Wyczyść filtry
          </Button>
        </div>
      )}
    </div>
  );
}
