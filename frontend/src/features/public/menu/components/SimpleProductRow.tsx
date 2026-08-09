import { useRef } from "react";
import type { PublicProductDto } from "@/shared/api/menuApi";
import { formatPrice } from "../lib/formatPrice";
import { useCartStore, buildLineKey } from "@/features/public/cart/cartStore";
import { flyToCart } from "@/shared/motion/flyToCart";

interface Props {
  product: PublicProductDto;
  currency: string;
}

/**
 * Wiersz produktu bez konfiguracji — sosy w kubeczku, napoje, desery.
 * Paczka dodaje je jednym dotknięciem, bez wchodzenia w konfigurator,
 * więc taki produkt dostaje od razu przycisk + / stepper.
 *
 * Warunek użycia (MenuPage): kategoria, w której żaden produkt nie ma
 * wariantów ani grup dodatków — nie ma czego wybierać.
 */
export function SimpleProductRow({ product, currency }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const lineKey = buildLineKey({ productId: product.id, variantId: null, addons: [] });
  const quantity = useCartStore(
    (s) => s.items.find((it) => it.lineKey === lineKey)?.quantity ?? 0,
  );
  const addRef = useRef<HTMLButtonElement>(null);

  const add = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      variantId: null,
      variantName: null,
      addons: [],
      unitPrice: Number(product.basePrice ?? 0),
      quantity: 1,
      imageUrl: product.imageUrl,
    });
    flyToCart(addRef.current);
  };

  return (
    <div className="flex items-center gap-3 border-b border-piec-ink/10 py-2.5">
      <div className="min-w-0 flex-1">
        <span className="text-[15px] font-semibold">{product.name}</span>{" "}
        {product.description ? (
          <span className="text-[13px] text-piec-ink/50">{product.description}</span>
        ) : null}
      </div>
      <div className="whitespace-nowrap text-[15px] font-bold">
        {formatPrice(product.basePrice, currency)}
      </div>

      {quantity === 0 ? (
        <button
          ref={addRef}
          type="button"
          onClick={add}
          aria-label={`Dodaj ${product.name} do koszyka`}
          className="flex h-11 w-11 flex-none items-center justify-center rounded-full border-[1.5px] border-primary text-[22px] leading-none text-primary transition-colors hover:bg-primary hover:text-onPrimary"
        >
          +
        </button>
      ) : (
        <div className="flex flex-none items-center rounded-full border-[1.5px] border-primary bg-primary/10">
          <button
            type="button"
            onClick={() => updateQuantity(lineKey, quantity - 1)}
            aria-label={`Zmniejsz liczbę: ${product.name}`}
            className="flex h-[41px] w-10 items-center justify-center text-xl leading-none text-primary"
          >
            −
          </button>
          <span aria-live="polite" className="w-5 text-center text-[15px] font-bold">
            {quantity}
          </span>
          <button
            ref={addRef}
            type="button"
            onClick={add}
            aria-label={`Zwiększ liczbę: ${product.name}`}
            className="flex h-[41px] w-10 items-center justify-center text-xl leading-none text-primary"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
