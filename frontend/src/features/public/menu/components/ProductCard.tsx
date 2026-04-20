import { cn } from "@/shared/lib/cn";
import { formatPrice, minVariantPrice } from "../lib/formatPrice";
import type { PublicProductDto } from "@/shared/api/menuApi";

interface Props {
  product: PublicProductDto;
  currency: string;
  onClick: (product: PublicProductDto) => void;
}

export function ProductCard({ product, currency, onClick }: Props) {
  const hasVariants = product.variants.length > 0;
  const priceLabel = hasVariants
    ? `od ${formatPrice(minVariantPrice(product.variants), currency)}`
    : formatPrice(product.basePrice, currency);
  const disabled = !product.available;

  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      disabled={disabled}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white text-left shadow-sm transition-all",
        disabled
          ? "cursor-not-allowed opacity-60"
          : "hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      )}
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-transform",
              !disabled && "group-hover:scale-[1.02]"
            )}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
            Brak zdjęcia
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
          {disabled ? (
            <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">
              Niedostępne
            </span>
          ) : null}
        </div>
        {product.description ? (
          <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-base font-semibold text-primary">{priceLabel}</span>
          {!disabled ? (
            <span className="text-xs font-medium text-slate-500 group-hover:text-primary">
              Zobacz →
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
