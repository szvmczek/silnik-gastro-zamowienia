import { Link } from "react-router-dom";
import type { PublicProductDto } from "@/shared/api/menuApi";
import { formatPrice, minVariantPrice } from "../lib/formatPrice";
import { isSpicy } from "../lib/productTags";

interface Props {
  product: PublicProductDto;
  currency: string;
  /** Kategoria z jedną pozycją dostaje w paczce szeroki layout „solo". */
  solo?: boolean;
}

/** D-07: „od" tylko wtedy, gdy jest z czego wybierać. */
function priceLabel(product: PublicProductDto, currency: string): string {
  const from = minVariantPrice(product.variants) ?? product.basePrice;
  const prefix = product.variants.length > 1 ? "od " : "";
  return `${prefix}${formatPrice(from, currency)}`;
}

export function MenuProductCard({ product, currency, solo }: Props) {
  if (!product.available) {
    return (
      <article className="flex flex-col overflow-hidden rounded-[18px] border border-piec-ink/[0.07] bg-[#1B120B]">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            className="block aspect-[4/3] w-full object-cover opacity-40 grayscale"
          />
        ) : null}
        <div className="flex flex-1 flex-col p-3 opacity-60">
          <h3 className="font-display text-[17.5px] tracking-[0.6px]">{product.name}</h3>
          {product.description ? (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-[1.5] text-piec-ink/60">
              {product.description}
            </p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
            <span className="whitespace-nowrap text-[15px] font-bold">
              {priceLabel(product, currency)}
            </span>
            <span className="flex min-h-[44px] items-center rounded-full border border-piec-ink/30 px-3 text-[11px] font-bold tracking-[1px] text-piec-ink/75">
              DZIŚ BRAK
            </span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={
        solo
          ? "grid overflow-hidden rounded-[18px] border border-piec-ink/10 bg-piec-surface transition-colors [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))] hover:border-primary/45"
          : "flex flex-col overflow-hidden rounded-[18px] border border-piec-ink/10 bg-piec-surface transition-[transform,border-color] duration-200 hover:-translate-y-[3px] hover:border-primary/45"
      }
    >
      <Link to={`/menu/${product.slug}`} aria-label={`Wybierz: ${product.name}`}>
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            loading="lazy"
            className={
              solo
                ? "block h-full max-h-[280px] min-h-[200px] w-full object-cover"
                : "block aspect-[4/3] w-full object-cover"
            }
          />
        ) : (
          <div className="aspect-[4/3] w-full bg-piec-surface2" />
        )}
      </Link>

      <div className={solo ? "flex flex-col justify-center p-6" : "flex flex-1 flex-col p-3"}>
        <Link to={`/menu/${product.slug}`} className="flex flex-wrap items-center gap-2">
          <h3
            className={
              solo
                ? "font-display text-[clamp(26px,4vw,34px)] tracking-[1px]"
                : "font-display text-[17.5px] tracking-[0.6px]"
            }
          >
            {product.name}
          </h3>
          {isSpicy(product) ? (
            <span className="flex-none rounded-full border border-piec-warn/55 px-1.5 py-0.5 text-[10px] font-bold tracking-[1.2px] text-piec-warn">
              OSTRA
            </span>
          ) : null}
        </Link>

        {product.description ? (
          <p
            className={
              solo
                ? "mt-2 max-w-[420px] text-[14.5px] leading-[1.6] text-piec-ink/65"
                : "mt-1 line-clamp-2 text-[12.5px] leading-[1.5] text-piec-ink/60"
            }
          >
            {product.description}
          </p>
        ) : null}

        <div
          className={
            solo
              ? "mt-5 flex flex-wrap items-center gap-4"
              : "mt-auto flex flex-wrap items-center justify-between gap-2 pt-3"
          }
        >
          <span className="whitespace-nowrap text-[15px] font-bold">
            {priceLabel(product, currency)}
          </span>
          <Link
            to={`/menu/${product.slug}`}
            className="flex min-h-[44px] items-center rounded-full bg-primary px-4 text-xs font-bold tracking-[1px] text-onPrimary transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.97]"
          >
            WYBIERZ
          </Link>
        </div>
      </div>
    </article>
  );
}
