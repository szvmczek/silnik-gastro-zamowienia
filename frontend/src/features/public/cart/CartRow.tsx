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
  compact?: boolean;
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
  compact = false,
}: CartRowProps) {
  const meta = formatLineMeta(item);
  const lineTotalLabel = formatPrice(lineTotal(item), currency);

  return (
    <li
      className={cn(
        "flex flex-col",
        compact ? "gap-2 py-3.5" : "gap-1.5 py-2.5",
        !last && "border-b border-[rgb(var(--color-border-subtle))]"
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h4
          className={cn(
            "min-w-0 flex-1 font-semibold leading-tight text-[rgb(var(--color-text-primary))]",
            compact ? "text-[15px]" : "text-[14px]"
          )}
        >
          <span className="truncate">{item.productName}</span>
          {item.variantName ? (
            <span className="font-normal text-[rgb(var(--color-text-muted))]">
              {" "}
              · {item.variantName}
            </span>
          ) : null}
        </h4>
        <span
          className={cn(
            "whitespace-nowrap font-mono font-semibold tabular-nums text-[rgb(var(--color-text-primary))]",
            compact ? "text-[15px]" : "text-[14px]"
          )}
        >
          {lineTotalLabel}
        </span>
      </div>

      {meta ? (
        <div
          className={cn(
            "leading-snug text-[rgb(var(--color-text-muted))]",
            compact ? "text-[13px]" : "text-[12px]"
          )}
        >
          {meta}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            "inline-flex items-center overflow-hidden rounded border border-[rgb(var(--color-border-card))]",
            compact ? "h-8" : "h-7"
          )}
        >
          <button
            type="button"
            onClick={onDecrement}
            aria-label="Zmniejsz ilość"
            className={cn(
              "flex items-center justify-center text-[rgb(var(--color-text-primary))] transition-colors hover:bg-[rgb(var(--color-bg-section))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
              compact ? "h-8 w-8" : "h-7 w-7"
            )}
          >
            <Minus className={cn(compact ? "h-3.5 w-3.5" : "h-3 w-3")} strokeWidth={2.5} />
          </button>
          <div
            className={cn(
              "flex items-center justify-center border-x border-[rgb(var(--color-border-card))] font-mono font-semibold tabular-nums",
              compact ? "w-9 text-[14px]" : "w-8 text-[13px]"
            )}
          >
            {item.quantity}
          </div>
          <button
            type="button"
            onClick={onIncrement}
            aria-label="Zwiększ ilość"
            className={cn(
              "flex items-center justify-center text-[rgb(var(--color-primary))] transition-colors hover:bg-[rgb(var(--color-primary-tint))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
              compact ? "h-8 w-8" : "h-7 w-7"
            )}
          >
            <Plus className={cn(compact ? "h-3.5 w-3.5" : "h-3 w-3")} strokeWidth={2.5} />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* TODO(F-005 placeholder): backend pole itemNote w OrderItem + CartItem
              store. Po dodaniu — uncomment onClick + textarea inline edit.
              F-009: ukryty w compact (CartSidebar desktop), zachowany w
              CartBottomSheet mobile gdzie viewport pressure mniejsza. */}
          {!compact ? (
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
          ) : null}
          {onEdit ? (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edytuj: ${item.productName}`}
              className={cn(
                "flex items-center justify-center rounded border border-[rgb(var(--color-border-card))] text-[rgb(var(--color-text-muted))] transition-colors hover:bg-[rgb(var(--color-bg-section))] hover:text-[rgb(var(--color-text-primary))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
                compact ? "h-8 w-8" : "h-7 w-7"
              )}
            >
              <Edit3 className={cn(compact ? "h-4 w-4" : "h-3.5 w-3.5")} />
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Usuń: ${item.productName}`}
            className={cn(
              "flex items-center justify-center rounded border border-[rgb(var(--color-border-card))] text-[rgb(var(--color-text-faint))] transition-colors hover:border-[rgb(var(--status-cancelled))] hover:bg-[rgb(var(--status-cancelled-tint))] hover:text-[rgb(var(--status-cancelled))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
              compact ? "h-8 w-8" : "h-7 w-7"
            )}
          >
            <Trash2 className={cn(compact ? "h-4 w-4" : "h-3.5 w-3.5")} />
          </button>
        </div>
      </div>
    </li>
  );
}
