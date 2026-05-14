import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import type { PublicProductDto } from "@/shared/api/menuApi";
import { useCartStore, useCartTotal, type CartItem } from "./cartStore";
import { CartRow } from "./CartRow";
import { FreeDeliveryProgress } from "./FreeDeliveryProgress";
import { UpsellSection } from "./UpsellSection";

/* CartSidebar — sticky aside 360px w MenuPage grid (right column, lg ≥ 1024px).
   3 stany: empty (placeholder + CTA) / with-items 1-N (lista + upsell +
   free-delivery + totals + CTA).

   Per Q2 plan mode: graceful fallback dla pól backendowych jeszcze nie
   wystawionych (Faza 5 M1 backend delta):
   - minOrderAmount == null → CTA bez belowMin gating
   - freeDeliveryFrom == null → FreeDeliveryProgress zwróci null
   - deliveryFee == null → wiersz "Dostawa" pomijany w totals, do-zapłaty
     liczone bez deliveryFee

   Cart store nietknięty — useCartStore API (items / updateQuantity /
   removeItem) bez zmian. lineTotal helper reused. */

interface Props {
  onCheckout: () => void;
  onBrowseMenu: () => void;
  onUpsellAdd: (product: PublicProductDto) => void;
  onEditItem?: (item: CartItem) => void;
  className?: string;
}

function plural(n: number, [one, few, many]: [string, string, string]): string {
  if (n === 1) return one;
  if (n < 5) return few;
  return many;
}

export function CartSidebar({
  onCheckout,
  onBrowseMenu,
  onUpsellAdd,
  onEditItem,
  className,
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
  const totalQty = items.reduce((acc, it) => acc + it.quantity, 0);

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

  const listRef = useRef<HTMLUListElement>(null);
  const prevItemsCount = useRef(items.length);
  const [canScrollMore, setCanScrollMore] = useState(false);

  useEffect(() => {
    const el = listRef.current;
    if (!el) {
      setCanScrollMore(false);
      return;
    }
    const check = () => {
      setCanScrollMore(
        el.scrollHeight > el.clientHeight + 4 &&
          el.scrollTop + el.clientHeight < el.scrollHeight - 4
      );
    };
    check();
    el.addEventListener("scroll", check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", check);
      ro.disconnect();
    };
  }, [items.length]);

  useEffect(() => {
    if (items.length > prevItemsCount.current && listRef.current) {
      listRef.current.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
    prevItemsCount.current = items.length;
  }, [items.length]);

  return (
    <aside
      className={cn(
        "flex w-[360px] shrink-0 flex-col rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))]",
        "sticky",
        className
      )}
      style={{
        top: "calc(var(--sticky-stack-height, 200px) + 1rem)",
        maxHeight: "calc(100vh - var(--sticky-stack-height, 200px) - 2rem)",
      }}
      aria-label="Koszyk"
    >
      {/* Header */}
      <div className="border-b border-[rgb(var(--color-border-subtle))] px-5 py-4">
        <div className="t-kicker t-kicker--accent mb-0.5">Twój koszyk</div>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[20px] font-bold leading-tight tracking-[-0.02em] text-[rgb(var(--color-text-primary))]">
            {empty
              ? "Pusty"
              : `${items.length} ${plural(items.length, ["pozycja", "pozycje", "pozycji"])}`}
          </h2>
          {!empty ? (
            <span className="font-mono text-[13px] text-[rgb(var(--color-text-muted))]">
              {totalQty} szt.
            </span>
          ) : null}
        </div>
      </div>

      {/* Body */}
      {empty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--color-bg-section))] text-[rgb(var(--color-text-muted))]">
            <ShoppingBag className="h-7 w-7" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-[16px] font-bold leading-snug text-[rgb(var(--color-text-primary))]">
              Tu pojawi się Twoje zamówienie
            </h3>
            <p className="mt-1.5 max-w-[240px] text-[13.5px] leading-snug text-[rgb(var(--color-text-muted))]">
              Wybierz coś z menu — dodaj pierwszą pozycję, żeby zacząć.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onBrowseMenu}
            className="mt-2"
          >
            Przeglądaj menu
          </Button>
        </div>
      ) : (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <ul
            ref={listRef}
            className="flex-1 overflow-y-auto px-5 [scrollbar-color:rgb(var(--color-border-card))_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar-thumb:hover]:bg-[rgb(var(--color-border-strong))] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[rgb(var(--color-border-card))] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:w-1.5"
          >
            {items.map((item, idx) => (
              <CartRow
                key={item.lineKey}
                item={item}
                currency={currency}
                last={idx === items.length - 1}
                onIncrement={() => updateQuantity(item.lineKey, item.quantity + 1)}
                onDecrement={() => updateQuantity(item.lineKey, item.quantity - 1)}
                onRemove={() => handleRemove(item)}
                onEdit={onEditItem ? () => onEditItem(item) : undefined}
                compact
              />
            ))}
          </ul>
          <div
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[rgb(var(--color-bg-card))] to-transparent transition-opacity duration-150",
              canScrollMore ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      )}

      {/* Footer */}
      {!empty ? (
        <div className="border-t border-[rgb(var(--color-border-subtle))] p-5">
          <UpsellSection
            cartItems={items}
            onAdd={onUpsellAdd}
            currency={currency}
          />

          <div className="mt-3.5">
            <FreeDeliveryProgress compact />
          </div>

          <div className="mb-3.5 mt-3.5 flex flex-col gap-1.5 text-[13px]">
            <div className="flex items-baseline justify-between text-[rgb(var(--color-text-body))]">
              <span>Suma</span>
              <span className="font-mono tabular-nums">
                {formatPrice(subtotal, currency)}
              </span>
            </div>
            {deliveryFee != null ? (
              <div className="flex items-baseline justify-between text-[rgb(var(--color-text-body))]">
                <span>Dostawa</span>
                <span className="font-mono tabular-nums">
                  {formatPrice(reachedFreeDelivery ? 0 : deliveryFee, currency)}
                </span>
              </div>
            ) : null}
            <div className="mt-1.5 flex items-baseline justify-between border-t border-dashed border-[rgb(var(--color-border-card))] pt-2.5 text-[16px] font-bold text-[rgb(var(--color-text-primary))]">
              <span>Do zapłaty</span>
              <span className="font-mono text-[18px] tabular-nums">
                {formatPrice(total, currency)}
              </span>
            </div>
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
            onClick={onCheckout}
          >
            {belowMin
              ? `Minimum ${minOrderAmount != null ? formatPrice(minOrderAmount, currency) : ""}`
              : `Złóż zamówienie · ${formatPrice(total, currency)}`}
          </Button>

          <button
            type="button"
            onClick={onBrowseMenu}
            className="mt-2 h-9 w-full text-[12px] font-medium text-[rgb(var(--color-text-muted))] transition-colors hover:text-[rgb(var(--color-text-primary))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          >
            ← Wróć do menu
          </button>
        </div>
      ) : null}
    </aside>
  );
}

