import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { usePublicMenu } from "@/features/public/menu/hooks/usePublicMenu";
import { formatPrice, minVariantPrice } from "@/features/public/menu/lib/formatPrice";
import { getCategoryEmoji } from "@/features/public/menu/lib/categoryEmoji";
import type { PublicProductDto } from "@/shared/api/menuApi";
import type { CartItem } from "./cartStore";

/* UpsellSection — sekcja "A może jeszcze?" w CartSidebar / CartBottomSheet.
   Top-3 produkty available spoza koszyka. Klik + → fade+slide-out 200ms,
   potem onAdd(product) (parent otwiera ProductModal — patrz Q4 plan mode:
   quick-add zawsze przez modal, bezpieczne dla wariantów).

   Empty pool (cart pokrył całe dostępne menu) → return null. Operator nie
   chce "wszystko już dodane" message.

   Brak featured/popularity flag w PublicProductDto — selekcja "top-3"
   to natural displayOrder pierwszych 3 dostępnych spoza koszyka. */

interface Props {
  cartItems: CartItem[];
  onAdd: (product: PublicProductDto) => void;
  currency?: string;
}

function priceLabel(product: PublicProductDto, currency: string): string {
  if (product.variants.length > 0) {
    const min = minVariantPrice(product.variants);
    return min ? formatPrice(min, currency) : "";
  }
  return formatPrice(product.basePrice, currency);
}

export function UpsellSection({
  cartItems,
  onAdd,
  currency = "PLN",
}: Props) {
  const [isOpen, setIsOpen] = useState(cartItems.length === 1);
  const { data: menu } = usePublicMenu();
  const [removed, setRemoved] = useState<Set<number>>(new Set());

  if (cartItems.length === 0) return null;

  const inCartIds = new Set(cartItems.map((ci) => ci.productId));
  const allProducts: PublicProductDto[] = (menu?.categories ?? []).flatMap(
    (c) => c.products
  );
  const candidates = allProducts.filter(
    (p) => p.available && !inCartIds.has(p.id) && !removed.has(p.id)
  );
  const suggestions = candidates.slice(0, 3);

  if (suggestions.length === 0) return null;

  const handleAdd = (product: PublicProductDto) => {
    setRemoved((prev) => {
      const next = new Set(prev);
      next.add(product.id);
      return next;
    });
    window.setTimeout(() => onAdd(product), 200);
  };

  const suffix =
    suggestions.length === 1 ? "sugestia" : suggestions.length < 5 ? "sugestie" : "sugestii";

  return (
    <section
      className={cn(
        "border-t border-dashed border-[rgb(var(--color-border-card))]",
        "mt-1 pt-2 md:pt-3"
      )}
      aria-label="Sugerowane dodatki do zamówienia"
    >
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls="upsell-list"
        className="mb-1.5 flex w-full items-baseline justify-between gap-2 focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
      >
        <span className="t-kicker t-kicker--accent">A może jeszcze?</span>
        <span className="flex items-baseline gap-1.5">
          <span className="font-mono text-[11px] text-[rgb(var(--color-text-faint))] md:text-[12px]">
            {suggestions.length} {suffix}
          </span>
          <ChevronDown
            aria-hidden="true"
            strokeWidth={2.4}
            className={cn(
              "h-3.5 w-3.5 self-center text-[rgb(var(--color-text-faint))] transition-transform duration-200 md:h-4 md:w-4",
              isOpen && "rotate-180"
            )}
          />
        </span>
      </button>
      <div
        id="upsell-list"
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-1.5 pt-1.5 md:gap-2">
            {suggestions.map((product) => (
              <UpsellRow
                key={product.id}
                product={product}
                currency={currency}
                leaving={removed.has(product.id)}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface UpsellRowProps {
  product: PublicProductDto;
  currency: string;
  leaving: boolean;
  onAdd: (product: PublicProductDto) => void;
}

function UpsellRow({ product, currency, leaving, onAdd }: UpsellRowProps) {
  const price = priceLabel(product, currency);
  const emoji = getCategoryEmoji(product.categorySlug);

  return (
    <div
      className={cn(
        "group flex min-h-[48px] items-center gap-2.5 rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] px-2.5 py-2 transition-[opacity,transform,border-color] duration-[200ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:border-[rgb(var(--color-border-strong))] md:min-h-[56px] md:gap-3 md:px-3",
        leaving && "translate-y-2 opacity-0"
      )}
    >
      <span
        aria-hidden="true"
        className="w-7 shrink-0 text-center text-[22px] leading-none md:w-8 md:text-[26px]"
      >
        {emoji}
      </span>

      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold leading-tight text-[rgb(var(--color-text-primary))] md:text-[15px]">
          {product.name}
        </div>
      </div>

      <span className="whitespace-nowrap font-mono text-[13px] font-bold tabular-nums text-[rgb(var(--color-text-primary))] md:text-[14px]">
        {price}
      </span>

      <button
        type="button"
        onClick={() => onAdd(product)}
        disabled={leaving}
        aria-label={`Dodaj ${product.name} do koszyka`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary))] text-white transition-transform duration-[120ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:bg-[rgb(var(--color-primary-hover))] group-hover:scale-[1.06] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] disabled:opacity-50 md:h-9 md:w-9"
      >
        <Plus className="h-4 w-4 md:h-[18px] md:w-[18px]" strokeWidth={2.4} />
      </button>
    </div>
  );
}
