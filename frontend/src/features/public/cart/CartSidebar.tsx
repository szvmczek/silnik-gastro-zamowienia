import { Edit3, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import type { PublicProductDto } from "@/shared/api/menuApi";
import {
  lineTotal,
  useCartStore,
  useCartTotal,
  type CartItem,
} from "./cartStore";
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

  return (
    <aside
      className={cn(
        "flex w-[360px] shrink-0 flex-col rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))]",
        "sticky top-32 max-h-[calc(100vh-9rem)]",
        className
      )}
      aria-label="Koszyk"
    >
      {/* Header */}
      <div className="border-b border-[rgb(var(--color-border-subtle))] p-5">
        <div className="t-kicker t-kicker--accent mb-1.5">Twój koszyk</div>
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-[rgb(var(--color-text-primary))]">
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
        <ul className="flex-1 overflow-y-auto px-5">
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
            />
          ))}
        </ul>
      )}

      {/* Footer */}
      {!empty ? (
        <div className="border-t border-[rgb(var(--color-border-subtle))] p-5">
          <UpsellSection
            cartItems={items}
            onAdd={onUpsellAdd}
            currency={currency}
            compact
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

interface CartRowProps {
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

function CartRow({
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
