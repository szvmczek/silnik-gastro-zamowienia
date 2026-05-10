import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { usePublicMenu } from "@/features/public/menu/hooks/usePublicMenu";
import { formatPrice, minVariantPrice } from "@/features/public/menu/lib/formatPrice";
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
  compact?: boolean;
}

function priceLabel(product: PublicProductDto, currency: string): string {
  if (product.variants.length > 0) {
    const min = minVariantPrice(product.variants);
    return min ? formatPrice(min, currency) : "";
  }
  return formatPrice(product.basePrice, currency);
}

const MiniStripedPlaceholder = () => (
  <div
    className="h-10 w-10 shrink-0 rounded-md"
    style={{
      background:
        "repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 6px, rgba(15,23,42,0.08) 6px, rgba(15,23,42,0.08) 12px)",
    }}
    aria-hidden="true"
  />
);

export function UpsellSection({
  cartItems,
  onAdd,
  currency = "PLN",
  compact = false,
}: Props) {
  const { data: menu } = usePublicMenu();
  const [removed, setRemoved] = useState<Set<number>>(new Set());

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
        compact ? "mt-1 pt-3" : "mt-1 pt-4"
      )}
      aria-label="Sugerowane dodatki do zamówienia"
    >
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <span className="t-kicker t-kicker--accent">A może jeszcze?</span>
        <span className="font-mono text-[11px] text-[rgb(var(--color-text-faint))]">
          {suggestions.length} {suffix}
        </span>
      </div>
      <div className="flex flex-col gap-2">
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

  return (
    <div
      className={cn(
        "group flex items-center gap-2.5 rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-2.5 transition-[opacity,transform,border-color] duration-[200ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:border-[rgb(var(--color-border-strong))]",
        leaving && "translate-y-2 opacity-0"
      )}
    >
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-10 w-10 shrink-0 rounded-md object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <MiniStripedPlaceholder />
      )}

      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold leading-tight text-[rgb(var(--color-text-primary))]">
          {product.name}
        </div>
        {product.description ? (
          <div className="truncate text-[11.5px] leading-tight text-[rgb(var(--color-text-muted))]">
            {product.description}
          </div>
        ) : null}
      </div>

      <span className="whitespace-nowrap font-mono text-[13px] font-bold tabular-nums text-[rgb(var(--color-text-primary))]">
        {price}
      </span>

      <button
        type="button"
        onClick={() => onAdd(product)}
        disabled={leaving}
        aria-label={`Dodaj ${product.name} do koszyka`}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary))] text-white transition-transform duration-[120ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:bg-[rgb(var(--color-primary-hover))] group-hover:scale-[1.06] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] disabled:opacity-50"
      >
        <Plus className="h-4 w-4" strokeWidth={2.4} />
      </button>
    </div>
  );
}
