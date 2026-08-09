import { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore, useCartTotal, buildLineKey } from "./cartStore";
import { usePublicMenu } from "@/features/public/menu/hooks/usePublicMenu";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { PiecHeader } from "@/features/public/shared/PiecHeader";
import { PiecShell } from "@/features/public/shared/PiecShell";
import {
  StickyActionBar,
  StickyActionBarSpacer,
} from "@/features/public/shared/StickyActionBar";
import { RollingNumber } from "@/shared/motion/RollingNumber";
import type { PublicProductDto } from "@/shared/api/menuApi";

/** Ile propozycji pokazujemy — paczka mieści 5-6 kafli bez scrolla. */
const MAX_SUGGESTIONS = 6;

export function UpsellPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const total = useCartTotal();
  const { data: menu } = usePublicMenu();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency;

  // Wejście na krok dosprzedaży z pustym koszykiem nie ma sensu — nie ma
  // czego dosprzedawać ani z czym iść dalej.
  useEffect(() => {
    if (items.length === 0) navigate("/menu", { replace: true });
  }, [items.length, navigate]);

  const suggestions = useMemo(() => {
    const inCart = new Set(items.map((it) => it.productId));
    return (menu?.categories ?? [])
      .filter((c) => c.active)
      .flatMap((c) => c.products)
      .filter(
        (p) =>
          p.available &&
          !inCart.has(p.id) &&
          // Tylko pozycje dobierane jednym dotknięciem — konfigurowalna
          // pizza wymagałaby wyjścia z tego kroku do konfiguratora.
          p.variants.length === 0 &&
          p.addonGroups.length === 0,
      )
      .slice(0, MAX_SUGGESTIONS);
  }, [menu, items]);

  return (
    <>
      <PiecHeader size="cart" back={{ to: "/cart", label: "Koszyk" }} title="Coś do tego?" />

      <PiecShell size="cart" className="pt-4">
        <p className="text-[14.5px] leading-[1.6] text-piec-ink/65">
          Zanim podasz dane — to, co najczęściej dobierane. Jedno dotknięcie, żeby dodać.
        </p>

        {suggestions.length > 0 ? (
          <>
            <h2 className="mt-5 text-xs font-bold uppercase tracking-[2px] text-primary">
              Najczęściej dobierane
            </h2>
            <div className="mt-2.5 grid gap-2.5 [grid-template-columns:repeat(auto-fill,minmax(min(100%,158px),1fr))] max-[430px]:!grid-cols-2">
              {suggestions.map((product) => (
                <UpsellTile key={product.id} product={product} currency={currency} />
              ))}
            </div>
          </>
        ) : null}

        <Link
          to="/menu"
          className="mt-4 flex min-h-[52px] items-center justify-center border-t border-piec-ink/10 text-[14.5px] font-semibold text-primary"
        >
          Coś jeszcze? Całe menu →
        </Link>
      </PiecShell>

      <StickyActionBarSpacer height={120} />
      <StickyActionBar>
        <div className="flex gap-2.5">
          {/* „Pomiń" zawsze widoczne — krok dosprzedaży nie może być pułapką. */}
          <Link
            to="/checkout"
            className="flex min-h-[54px] items-center rounded-[14px] border-[1.5px] border-piec-ink/30 bg-piec-bg px-5 text-[14.5px] font-semibold text-piec-ink/85 transition-colors hover:border-primary hover:text-primary"
          >
            Pomiń
          </Link>
          <Link
            to="/checkout"
            className="flex min-h-[54px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-primary text-[15.5px] font-bold text-onPrimary shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.97]"
          >
            Do danych · <RollingNumber value={formatPrice(total, currency)} size={17} plain />
          </Link>
        </div>
      </StickyActionBar>
    </>
  );
}

function UpsellTile({
  product,
  currency,
}: {
  product: PublicProductDto;
  currency: string | undefined;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const lineKey = buildLineKey({ productId: product.id, variantId: null, addons: [] });
  const quantity = useCartStore(
    (s) => s.items.find((it) => it.lineKey === lineKey)?.quantity ?? 0,
  );

  const add = () =>
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

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={add}
        className="rounded-[14px] border-[1.5px] border-piec-ink/[0.18] bg-piec-surface p-3.5 text-left transition-colors hover:border-primary"
      >
        <span className="block text-[14.5px] font-semibold">{product.name}</span>
        {product.description ? (
          <span className="mt-0.5 block text-[12.5px] text-piec-ink/50">
            {product.description}
          </span>
        ) : null}
        <span className="mt-3 flex items-center justify-between">
          <span className="text-[15px] font-bold">
            {formatPrice(product.basePrice, currency)}
          </span>
          <span
            aria-hidden="true"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full border-[1.5px] border-primary text-[19px] leading-none text-primary"
          >
            +
          </span>
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-[14px] border-[1.5px] border-primary bg-primary/10 p-3.5">
      <span className="block text-[14.5px] font-semibold">{product.name}</span>
      {product.description ? (
        <span className="mt-0.5 block text-[12.5px] text-piec-ink/50">
          {product.description}
        </span>
      ) : null}
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-[15.5px] font-bold text-primary">
          {formatPrice(product.basePrice, currency)}
        </span>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => updateQuantity(lineKey, quantity - 1)}
            aria-label={`Zmniejsz liczbę: ${product.name}`}
            className="flex h-9 w-9 items-center justify-center text-[19px] leading-none text-primary"
          >
            −
          </button>
          <span aria-live="polite" className="w-[18px] text-center text-[15px] font-bold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={add}
            aria-label={`Zwiększ liczbę: ${product.name}`}
            className="flex h-9 w-9 items-center justify-center text-[19px] leading-none text-primary"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
