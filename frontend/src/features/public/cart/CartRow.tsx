import { Edit3, Minus, Plus, Trash2 } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { lineTotal, type CartItem } from "./cartStore";

/* CartRow — shared row pomiędzy CartSidebar (M-021) i CartBottomSheet (M-022).
   Pierwotnie inline w CartSidebar, wyciągnięty gdy pojawił się 2-gi konsument.

   Layout per bundle Stage 2 cart.jsx CartRow, retrofit pod tokens v2.
   F-005 dodaje placeholder UI dla note button (disabled). Logika edit
   note (textarea inline, OrderItem.itemNote field) pojawi się w osobnym
   logic delta tasku po Warstwie 3a/3b — patrz docs/PHASE5_FINDINGS.md §1. */

export interface CartRowProps {
  item: CartItem;
  currency: string;
  last: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
  onEdit?: () => void;
}

function formatLineMeta(item: CartItem): string {
  if (item.addons.length === 0) return "";
  return item.addons.map((a) => a.name).join(" · ");
}

export function CartRow({
  item,
  currency,
  last,
  onIncrement,
  onDecrement,
  onRemove,
  onEdit,
}: CartRowProps) {
  const meta = formatLineMeta(item);
  const lineTotalLabel = formatPrice(lineTotal(item), currency);

  return (
    <li
      className={cn(
        "flex flex-col gap-2 py-3.5",
        !last && "border-b border-[rgb(var(--color-border-subtle))]"
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="min-w-0 flex-1 text-[14px] font-semibold leading-tight text-[rgb(var(--color-text-primary))]">
          <span className="truncate">{item.productName}</span>
          {item.variantName ? (
            <span className="font-normal text-[rgb(var(--color-text-muted))]">
              {" "}
              · {item.variantName}
            </span>
          ) : null}
        </h4>
        <span className="whitespace-nowrap font-mono text-[14px] font-semibold tabular-nums text-[rgb(var(--color-text-primary))]">
          {lineTotalLabel}
        </span>
      </div>

      {meta ? (
        <div className="text-[12px] leading-snug text-[rgb(var(--color-text-muted))]">
          {meta}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex h-7 items-center overflow-hidden rounded border border-[rgb(var(--color-border-card))]">
          <button
            type="button"
            onClick={onDecrement}
            aria-label="Zmniejsz ilość"
            className="flex h-7 w-7 items-center justify-center text-[rgb(var(--color-text-primary))] transition-colors hover:bg-[rgb(var(--color-bg-section))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          >
            <Minus className="h-3 w-3" strokeWidth={2.5} />
          </button>
          <div className="flex w-8 items-center justify-center border-x border-[rgb(var(--color-border-card))] font-mono text-[13px] font-semibold tabular-nums">
            {item.quantity}
          </div>
          <button
            type="button"
            onClick={onIncrement}
            aria-label="Zwiększ ilość"
            className="flex h-7 w-7 items-center justify-center text-[rgb(var(--color-primary))] transition-colors hover:bg-[rgb(var(--color-primary-tint))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          >
            <Plus className="h-3 w-3" strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* TODO(F-005 placeholder): backend pole itemNote w OrderItem + CartItem
              store. Po dodaniu — uncomment onClick + textarea inline edit. */}
          <button
            type="button"
            disabled
            aria-disabled="true"
            title="Wkrótce dostępne — komentarz do pozycji"
            className="flex h-7 shrink-0 cursor-not-allowed items-center gap-1 rounded border border-[rgb(var(--color-border-card))] px-2 text-[11px] font-medium leading-none text-[rgb(var(--color-text-faint))] opacity-60"
          >
            <span aria-hidden="true">＋</span>
            <span>dodaj uwagę</span>
          </button>
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edytuj: ${item.productName}`}
              className="flex h-7 w-7 items-center justify-center rounded border border-[rgb(var(--color-border-card))] text-[rgb(var(--color-text-muted))] transition-colors hover:bg-[rgb(var(--color-bg-section))] hover:text-[rgb(var(--color-text-primary))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
            >
              <Edit3 className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Usuń: ${item.productName}`}
            className="flex h-7 w-7 items-center justify-center rounded border border-[rgb(var(--color-border-card))] text-[rgb(var(--color-text-faint))] transition-colors hover:border-[rgb(var(--status-cancelled))] hover:bg-[rgb(var(--status-cancelled-tint))] hover:text-[rgb(var(--status-cancelled))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}
