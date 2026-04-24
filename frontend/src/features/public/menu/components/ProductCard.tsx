import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/components/ui/Badge";
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
          : "hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className={cn(
              "h-full w-full object-cover transition-transform duration-300",
              !disabled && "group-hover:scale-[1.03]"
            )}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[13px] text-slate-400">
            Brak zdjęcia
          </div>
        )}
        {disabled ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Badge
              variant="muted"
              className="border border-slate-200 bg-white text-slate-700 shadow-sm"
            >
              Chwilowo niedostępne
            </Badge>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[17px] font-semibold tracking-tight text-slate-900">
            {product.name}
          </h3>
          <span className="whitespace-nowrap text-[15px] font-semibold text-slate-900">
            {priceLabel}
          </span>
        </div>
        {product.description ? (
          <p className="mt-1.5 line-clamp-2 text-[13px] leading-snug text-slate-500">
            {product.description}
          </p>
        ) : null}
      </div>
    </button>
  );
}
