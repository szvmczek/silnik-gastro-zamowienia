import { Plus } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formatPrice, minVariantPrice } from "../lib/formatPrice";
import type { PublicProductDto } from "@/shared/api/menuApi";

interface Props {
  index: number;
  product: PublicProductDto;
  currency: string;
  onClick: (product: PublicProductDto) => void;
}

function priceLabel(product: PublicProductDto, currency: string): string {
  if (product.variants.length > 0) {
    const min = minVariantPrice(product.variants);
    return min ? `od ${formatPrice(min, currency)}` : "";
  }
  return formatPrice(product.basePrice, currency);
}

function variantsLine(product: PublicProductDto, currency: string): string | null {
  if (product.variants.length < 2) return null;
  return product.variants
    .map((v) => `${v.name} — ${formatPrice(v.price, currency)}`)
    .join(" · ");
}

const Thumb = ({
  product,
  size,
  className,
}: {
  product: PublicProductDto;
  size: number;
  className?: string;
}) => (
  <div
    className={cn(
      "shrink-0 overflow-hidden rounded-md bg-[#f4ede3]",
      className
    )}
    style={{ width: size, height: size }}
  >
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
    ) : null}
  </div>
);

export function MenuItemRow({ index, product, currency, onClick }: Props) {
  const disabled = !product.available;
  const headlinePrice = priceLabel(product, currency);
  const sizesRow = variantsLine(product, currency);

  const handleOpen = () => {
    if (disabled) return;
    onClick(product);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(product);
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
        "group relative flex items-start gap-5 px-6 py-6 transition-colors",
        disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer hover:bg-slate-50/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7]"
      )}
    >
      <div className="w-10 shrink-0 pt-1 text-[13px] font-mono tabular-nums text-slate-400 transition-colors group-hover:text-primary">
        {String(index).padStart(2, "0")}
      </div>

      <Thumb product={product} size={64} />

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-baseline gap-3">
          <h3 className="text-[18px] font-semibold tracking-tight text-slate-900">
            {product.name}
          </h3>
          <div className="mb-1.5 flex-1 border-b border-dotted border-slate-300" />
          {disabled ? (
            <span className="whitespace-nowrap text-[12px] italic text-slate-500">
              chwilowo niedostępne
            </span>
          ) : (
            <span className="whitespace-nowrap font-mono text-[14px] font-semibold tabular-nums text-slate-900">
              {headlinePrice}
            </span>
          )}
        </div>
        {product.description ? (
          <p className="mt-1.5 max-w-[640px] text-[13.5px] leading-[1.65] text-slate-500">
            {product.description}
          </p>
        ) : null}
        {sizesRow ? (
          <div className="mt-3 font-mono text-[12px] tabular-nums text-slate-500">
            {sizesRow}
          </div>
        ) : null}
      </div>

      <div className="shrink-0 self-center pl-2">
        {disabled ? (
          <div className="h-10 w-10" aria-hidden="true" />
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick(product);
            }}
            aria-label={`Dodaj ${product.name} do koszyka`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-600 transition-colors hover:border-primary hover:bg-primary hover:text-white group-hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export function MenuItemRowMobile({ index, product, currency, onClick }: Props) {
  const disabled = !product.available;
  const headlinePrice = priceLabel(product, currency);

  const handleOpen = () => {
    if (disabled) return;
    onClick(product);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(product);
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
        "flex items-start gap-3 px-5 py-4 transition-colors",
        disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer active:bg-slate-100/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fbfaf7]"
      )}
    >
      <div className="w-7 shrink-0 pt-1 text-[11px] font-mono tabular-nums text-slate-400">
        {String(index).padStart(2, "0")}
      </div>

      <Thumb product={product} size={48} />

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <h3 className="truncate text-[15px] font-semibold tracking-tight text-slate-900">
            {product.name}
          </h3>
          <div className="mb-1 flex-1 border-b border-dotted border-slate-300" />
          <span className="whitespace-nowrap font-mono text-[12px] font-semibold tabular-nums text-slate-900">
            {disabled ? "—" : headlinePrice}
          </span>
        </div>
        {product.description ? (
          <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-slate-500">
            {product.description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
