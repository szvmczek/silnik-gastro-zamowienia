import { ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/shared/components/ui/Sheet";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import type { PublicProductDto } from "@/shared/api/menuApi";
import { useCartStore, useCartTotal, type CartItem } from "./cartStore";
import { CartRow } from "./CartRow";
import { FreeDeliveryProgress } from "./FreeDeliveryProgress";
import { UpsellSection } from "./UpsellSection";

/* CartBottomSheet — mobile bottom sheet 92vh (lg:hidden). Open trigger:
   MobileCartBar (M-022) lub CartButton w PublicNav. Konsumpcja w M-018/M-019.

   Layout vertical: drag handle (visual, swipe-down gesture skip — Radix
   natywnie obsługuje overlay click / ESC / X button) → header → scroll body
   (CartRow + UpsellSection) → sticky footer (FreeDeliveryProgress + total
   row + below-min warning + CTA).

   Graceful fallback identyczny co CartSidebar (Q2 plan mode):
   - minOrderAmount == null → CTA bez belowMin gating
   - freeDeliveryFrom == null → FreeDeliveryProgress null
   - deliveryFee == null → total = subtotal

   Cart store nietknięty. */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
  onUpsellAdd: (product: PublicProductDto) => void;
  onEditItem?: (item: CartItem) => void;
}

function plural(n: number, [one, few, many]: [string, string, string]): string {
  if (n === 1) return one;
  if (n < 5) return few;
  return many;
}

export function CartBottomSheet({
  open,
  onOpenChange,
  onCheckout,
  onUpsellAdd,
  onEditItem,
}: Props) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartTotal();
  const { data: settings } = usePublicSettings();

  const currency = settings?.currency ?? "PLN";
  const minOrderAmount = settings?.minOrderAmount;
  const freeDeliveryFrom = settings?.freeDeliveryFrom;
  const deliveryFee = settings?.deliveryFee;

  const empty = items.length === 0;
  const reachedFreeDelivery =
    freeDeliveryFrom != null && subtotal >= freeDeliveryFrom;
  const effectiveDeliveryFee =
    deliveryFee == null ? 0 : reachedFreeDelivery ? 0 : deliveryFee;
  const total = subtotal + effectiveDeliveryFee;

  const belowMin = minOrderAmount != null && subtotal < minOrderAmount;
  const remainingMin =
    minOrderAmount != null ? Math.max(0, minOrderAmount - subtotal) : 0;

  const handleRemove = (item: CartItem) => {
    removeItem(item.lineKey);
    toast.success(`Usunięto: ${item.productName}`);
  };

  const handleCheckout = () => {
    onOpenChange(false);
    onCheckout();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showClose={false}
        className={cn(
          "flex max-h-[92vh] flex-col gap-0 rounded-t-2xl border-t border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-0 shadow-[var(--shadow-lg)]"
        )}
      >
        <SheetDescription className="sr-only">
          Koszyk zamówienia z listą pozycji, sumą i przyciskiem złóż zamówienie.
        </SheetDescription>

        {/* Drag handle (visual only) */}
        <div className="flex shrink-0 justify-center pt-2.5">
          <div
            className="h-1 w-9 rounded-full bg-[rgb(var(--color-border-strong))]"
            aria-hidden="true"
          />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[rgb(var(--color-border-subtle))] px-4 pb-3 pt-2">
          <div className="min-w-0">
            <div className="t-kicker t-kicker--accent mb-1">Twój koszyk</div>
            <SheetTitle className="text-[19px] font-bold leading-tight tracking-[-0.02em] text-[rgb(var(--color-text-primary))]">
              {empty
                ? "Pusty"
                : `${items.length} ${plural(items.length, ["pozycja", "pozycje", "pozycji"])}`}
            </SheetTitle>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Zamknij koszyk"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-bg-section))] text-[rgb(var(--color-text-primary))] transition-colors hover:bg-[rgb(var(--color-border-card))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        {empty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--color-bg-section))] text-[rgb(var(--color-text-muted))]">
              <ShoppingBag className="h-7 w-7" strokeWidth={1.5} />
            </div>
            <h3 className="text-[15px] font-bold text-[rgb(var(--color-text-primary))]">
              Tu pojawi się Twoje zamówienie
            </h3>
            <p className="max-w-[260px] text-[13px] leading-snug text-[rgb(var(--color-text-muted))]">
              Wybierz coś z menu — dodaj pierwszą pozycję, żeby zacząć.
            </p>
          </div>
        ) : (
          <ul className="flex-1 overflow-y-auto px-4">
            {items.map((item, idx) => (
              <CartRow
                key={item.lineKey}
                item={item}
                currency={currency}
                last={idx === items.length - 1}
                onIncrement={() =>
                  updateQuantity(item.lineKey, item.quantity + 1)
                }
                onDecrement={() =>
                  updateQuantity(item.lineKey, item.quantity - 1)
                }
                onRemove={() => handleRemove(item)}
                onEdit={onEditItem ? () => onEditItem(item) : undefined}
              />
            ))}
          </ul>
        )}

        {/* Footer */}
        {!empty ? (
          <div className="shrink-0 border-t border-[rgb(var(--color-border-subtle))] bg-[rgb(var(--color-bg-card))] p-4">
            <UpsellSection
              cartItems={items}
              onAdd={onUpsellAdd}
              currency={currency}
              compact
            />

            <div className="mt-3">
              <FreeDeliveryProgress compact />
            </div>

            <div className="mt-3 flex items-baseline justify-between pb-3 text-[16px] font-bold text-[rgb(var(--color-text-primary))]">
              <span>Do zapłaty</span>
              <span className="font-mono text-[18px] tabular-nums">
                {formatPrice(total, currency)}
              </span>
            </div>

            {belowMin ? (
              <div
                role="status"
                aria-live="polite"
                className="mb-3 rounded-md bg-[rgb(var(--color-primary-tint))] px-3 py-2 text-[12px] font-medium leading-snug text-[rgb(var(--color-primary))]"
              >
                Brakuje{" "}
                <strong className="font-mono font-semibold">
                  {formatPrice(remainingMin, currency)}
                </strong>{" "}
                do minimum zamówienia.
              </div>
            ) : null}

            <Button
              type="button"
              variant="primary"
              size="xl"
              className="w-full"
              disabled={belowMin}
              onClick={handleCheckout}
            >
              {belowMin
                ? `Minimum ${minOrderAmount != null ? formatPrice(minOrderAmount, currency) : ""}`
                : `Złóż zamówienie · ${formatPrice(total, currency)}`}
            </Button>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
