import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formatPrice, minVariantPrice } from "@/features/public/menu/lib/formatPrice";
import type { PublicProductDto } from "@/shared/api/menuApi";

/* ProductCard — karta produktu w grid Menu (M-019). Per decyzja Q4 plan mode:
   plus-button = wizualny CTA, taki sam efekt jak click całej karty (otwiera
   ProductModal). Bezpieczne dla produktów z wariantami (pizza → wybór 30/40/50)
   bo zawsze przechodzimy przez modal.

   TODO badge HIT/NOWOŚĆ: PublicProductDto nie ma pola `badge` ani `featured`.
   Slot pod element JSX zostawiony pusty — gdy backend doda pole (osobny logic
   delta task), wystarczy podpiąć absolute span w sekcji image area. Wzór z
   docs/design/v2-stage2/landing-shared.jsx ProductCard. */

interface Props {
  product: PublicProductDto;
  currency?: string;
  onOpen: (product: PublicProductDto) => void;
}

function priceLabel(product: PublicProductDto, currency: string): string {
  if (product.variants.length > 0) {
    const min = minVariantPrice(product.variants);
    return min ? formatPrice(min, currency) : "";
  }
  return formatPrice(product.basePrice, currency);
}

const StripedPlaceholder = ({ label }: { label: string }) => (
  <div
    className="flex h-full w-full items-center justify-center"
    style={{
      background:
        "repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 8px, rgba(15,23,42,0.08) 8px, rgba(15,23,42,0.08) 16px)",
    }}
    aria-hidden="true"
  >
    <span className="font-mono text-[11px] tracking-[0.02em] text-[rgb(var(--color-text-muted))]">
      {label}
    </span>
  </div>
);

export function ProductCard({ product, currency = "PLN", onOpen }: Props) {
  const disabled = !product.available;
  const headlinePrice = priceLabel(product, currency);
  const fromPrefix = product.variants.length > 0;

  const handleOpen = () => {
    if (disabled) return;
    onOpen(product);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen(product);
    }
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      aria-label={`${product.name} — szczegóły i dodaj do koszyka`}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
      className={cn(
        "group relative flex flex-col gap-3.5 rounded-lg border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-4 transition-[transform,border-color] duration-[200ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] sm:p-5",
        "focus-visible:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
        disabled
          ? "cursor-not-allowed opacity-55"
          : "cursor-pointer hover:-translate-y-0.5 hover:border-[rgb(var(--color-border-strong))]"
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[rgb(var(--color-bg-section))]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <StripedPlaceholder label="zdjęcie produktu · 4:3" />
        )}
        {/* TODO badge slot — gdy DTO doda pole `badge`, dorzuć:
            <span className="absolute left-2 top-2 rounded-sm bg-[rgb(var(--color-accent-yellow))] px-1.5 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-[rgb(var(--color-text-primary))]">
              {product.badge}
            </span>
        */}
      </div>

      <div className="flex min-h-[3.5rem] flex-col gap-1">
        <h3 className="text-[17px] font-bold leading-tight tracking-[-0.015em] text-[rgb(var(--color-text-primary))]">
          {product.name}
        </h3>
        {product.description ? (
          <p className="line-clamp-2 text-[14px] leading-[1.45] text-[rgb(var(--color-text-body))]">
            {product.description}
          </p>
        ) : null}
      </div>

      <div className="mt-auto flex items-center justify-between">
        {disabled ? (
          <span className="text-[13px] italic text-[rgb(var(--color-text-muted))]">
            chwilowo niedostępne
          </span>
        ) : (
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[18px] font-semibold leading-none text-[rgb(var(--color-text-primary))]">
              {headlinePrice}
            </span>
            {fromPrefix ? (
              <span className="text-[11px] text-[rgb(var(--color-text-muted))]">
                od
              </span>
            ) : null}
          </div>
        )}
        {!disabled ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(product);
            }}
            aria-label={`Otwórz ${product.name}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-primary))] text-white transition-transform duration-[120ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:bg-[rgb(var(--color-primary-hover))] group-hover:scale-[1.08] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={2.4} />
          </button>
        ) : null}
      </div>
    </div>
  );
}
