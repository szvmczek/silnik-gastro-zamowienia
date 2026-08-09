import { useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { usePublicProduct } from "./hooks/usePublicMenu";
import { useMenuPrice, type SelectedAddons } from "./hooks/useMenuPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "./lib/formatPrice";
import { isSpicy } from "./lib/productTags";
import { PiecHeader } from "@/features/public/shared/PiecHeader";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { CartPill } from "@/features/public/shared/CartPill";
import {
  StickyActionBar,
  StickyActionBarSpacer,
} from "@/features/public/shared/StickyActionBar";
import { RollingNumber } from "@/shared/motion/RollingNumber";
import { useCountBump } from "@/shared/motion/useCountBump";
import { flyToCart } from "@/shared/motion/flyToCart";
import { useCartStore, type CartAddon } from "@/features/public/cart/cartStore";
import { cn } from "@/shared/lib/cn";
import type { PublicAddonGroupDto } from "@/shared/api/menuApi";

const MAX_QUANTITY = 99;

export function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading, isError } = usePublicProduct(slug);
  const { data: settings } = usePublicSettings();
  const addItem = useCartStore((s) => s.addItem);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const [variantId, setVariantId] = useState<number | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddons>({});
  const [quantity, setQuantity] = useState(1);

  // Pierwszy wariant wybrany domyślnie — paczka nigdy nie pokazuje
  // konfiguratora bez zaznaczonego rozmiaru.
  const effectiveVariantId =
    variantId ?? (product?.variants.length ? product.variants[0].id : null);

  const { unit, total, variant } = useMenuPrice({
    product: product ?? null,
    variantId: effectiveVariantId,
    selectedAddons,
    quantity,
  });

  const currency = settings?.currency;

  const toggleAddon = (group: PublicAddonGroupDto, addonId: number) => {
    setSelectedAddons((prev) => {
      const current = new Set(prev[group.id] ?? []);
      if (current.has(addonId)) {
        current.delete(addonId);
      } else {
        // Grupa jednokrotnego wyboru zachowuje się jak radio.
        if (group.maxSelect === 1) current.clear();
        if (current.size >= group.maxSelect) return prev;
        current.add(addonId);
      }
      return { ...prev, [group.id]: current };
    });
  };

  /** Pierwszy niespełniony warunek grupy — trafia pod przycisk jako podpowiedź. */
  const blockingHint = useMemo(() => {
    if (!product) return null;
    if (!product.available) return "Ta pozycja jest dziś niedostępna.";
    for (const group of product.addonGroups) {
      const picked = selectedAddons[group.id]?.size ?? 0;
      if (group.required && picked < 1) return `Wybierz: ${group.name.toLowerCase()}`;
      if (picked < group.minSelect) {
        return `${group.name}: wybierz minimum ${group.minSelect}`;
      }
    }
    return null;
  }, [product, selectedAddons]);

  const handleAdd = () => {
    if (!product || blockingHint) return;
    const addons: CartAddon[] = product.addonGroups.flatMap((group) =>
      group.addons
        .filter((addon) => selectedAddons[group.id]?.has(addon.id))
        .map((addon) => ({
          addonId: addon.id,
          name: addon.name,
          groupName: group.name,
          price: Number(addon.price),
        })),
    );

    addItem({
      productId: product.id,
      productName: product.name,
      variantId: variant?.id ?? null,
      variantName: variant?.name ?? null,
      addons,
      unitPrice: variant ? Number(variant.price) : Number(product.basePrice ?? 0),
      quantity,
      imageUrl: product.imageUrl,
    });
    flyToCart(addButtonRef.current);
    toast.success(`Dodano: ${product.name}`);
    navigate("/menu");
  };

  if (isLoading) {
    return (
      <>
        <PiecHeader size="product" back={{ to: "/menu", label: "Menu" }} />
        <PiecShell size="product" className="py-16 text-sm text-piec-ink/55">
          Wczytujemy pozycję…
        </PiecShell>
      </>
    );
  }

  if (isError || !product) {
    return (
      <>
        <PiecHeader size="product" back={{ to: "/menu", label: "Menu" }} />
        <PiecShell size="product" className="py-16">
          <h1 className="font-display text-[32px] tracking-[1px]">Nie ma takiej pozycji</h1>
          <p className="mt-2 text-sm text-piec-ink/60">
            Mogła zniknąć z menu albo link jest nieaktualny.
          </p>
          <Link to="/menu" className="mt-4 inline-flex min-h-[44px] items-center text-primary">
            Wróć do menu →
          </Link>
        </PiecShell>
      </>
    );
  }

  return (
    <>
      <PiecHeader
        size="product"
        back={{ to: "/menu", label: "Menu" }}
        actions={<CartPill emptyVariant="none" />}
      />

      {product.imageUrl ? (
        <PiecShell size="product" className="pt-4">
          <img
            src={product.imageUrl}
            alt=""
            className="block aspect-[3/2] w-full rounded-[20px] object-cover shadow-[0_20px_56px_rgba(0,0,0,0.5)]"
          />
        </PiecShell>
      ) : null}

      <PiecShell size="product">
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-display text-[clamp(34px,8vw,46px)] tracking-[1px]">
              {product.name}
            </h1>
            {isSpicy(product) ? (
              <span className="rounded-full border border-piec-warn/55 px-1.5 py-0.5 text-[10px] font-bold tracking-[1.2px] text-piec-warn">
                OSTRA
              </span>
            ) : null}
          </div>
          {product.description ? (
            <p className="mt-1.5 text-[14.5px] leading-[1.6] text-piec-ink/65">
              {product.description}
            </p>
          ) : null}

          {!product.available ? (
            <div className="mt-3.5 rounded-xl border border-piec-ink/[0.18] bg-piec-ink/5 p-3.5">
              <p className="text-[14.5px] font-bold">Dziś niedostępna</p>
              <p className="mt-0.5 text-[13.5px] leading-[1.55] text-piec-ink/60">
                Skończyły się składniki. Wróci, jak dowiozą — zwykle w ciągu dnia lub dwóch.
              </p>
              <Link
                to="/menu"
                className="mt-1 flex min-h-[44px] items-center text-sm font-bold text-primary"
              >
                Zobacz inne pozycje →
              </Link>
            </div>
          ) : null}
        </div>

        {product.variants.length > 0 ? (
          <fieldset className="mt-6">
            <legend className="text-xs font-bold uppercase tracking-[2px] text-piec-ink/55">
              Rozmiar
            </legend>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {product.variants.map((v) => {
                const active = v.id === effectiveVariantId;
                return (
                  <label
                    key={v.id}
                    className={cn(
                      "cursor-pointer rounded-[14px] border-[1.5px] p-3.5 text-center transition-colors",
                      active
                        ? "border-primary bg-primary/[0.12]"
                        : "border-piec-ink/20 hover:border-primary/60",
                    )}
                  >
                    <input
                      type="radio"
                      name="variant"
                      className="sr-only"
                      checked={active}
                      onChange={() => setVariantId(v.id)}
                    />
                    <span className="block font-display text-[21px] tracking-[1px]">
                      {v.name}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block text-[13.5px] font-semibold",
                        active ? "text-primary" : "text-piec-ink/55",
                      )}
                    >
                      {formatPrice(v.price, currency)}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {product.addonGroups.map((group) => (
          <AddonGroup
            key={group.id}
            group={group}
            currency={currency}
            selected={selectedAddons[group.id] ?? new Set<number>()}
            onToggle={(addonId) => toggleAddon(group, addonId)}
          />
        ))}
      </PiecShell>

      <StickyActionBarSpacer height={140} />
      <StickyActionBar hint={blockingHint}>
        <div className="flex items-stretch gap-2.5">
          <div className="flex items-center rounded-[14px] border-[1.5px] border-piec-ink/25 bg-piec-surface2">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Zmniejsz liczbę sztuk"
              className="flex min-h-[54px] w-[46px] items-center justify-center text-[22px] leading-none transition-colors hover:text-primary"
            >
              −
            </button>
            <span aria-live="polite" className="w-[26px] text-center text-[17px] font-bold">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
              aria-label="Zwiększ liczbę sztuk"
              className="flex min-h-[54px] w-[46px] items-center justify-center text-[22px] leading-none transition-colors hover:text-primary"
            >
              +
            </button>
          </div>
          <button
            ref={addButtonRef}
            type="button"
            onClick={handleAdd}
            disabled={Boolean(blockingHint)}
            className={cn(
              "flex min-h-[54px] flex-1 items-center justify-center gap-2 rounded-[14px] text-[15.5px] font-bold transition-[transform,filter] duration-150",
              blockingHint
                ? "cursor-default bg-primary/20 text-piec-ink/45"
                : "bg-primary text-onPrimary shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:brightness-110 active:scale-[0.97]",
            )}
          >
            Do koszyka ·{" "}
            <RollingNumber value={formatPrice(total, currency)} size={17} plain />
          </button>
        </div>
        <p className="sr-only" aria-live="polite">
          Cena jednostkowa {formatPrice(unit, currency)}
        </p>
      </StickyActionBar>
    </>
  );
}

interface AddonGroupProps {
  group: PublicAddonGroupDto;
  currency: string | undefined;
  selected: Set<number>;
  onToggle: (addonId: number) => void;
}

function AddonGroup({ group, currency, selected, onToggle }: AddonGroupProps) {
  const bump = useCountBump(selected.size);
  const limitReached = selected.size >= group.maxSelect;

  return (
    <fieldset className="mt-6">
      <div className="flex flex-wrap items-baseline gap-2.5">
        <legend className="text-xs font-bold uppercase tracking-[2px] text-piec-ink/55">
          {group.name}
          {group.required ? <span className="text-primary"> (obowiązkowe)</span> : null}
        </legend>
        {selected.size > 0 ? (
          <span className={cn("text-[12.5px] font-bold text-primary", bump)}>
            {selected.size}/{group.maxSelect}
          </span>
        ) : null}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {group.addons.map((addon) => {
          const active = selected.has(addon.id);
          const disabled = !active && limitReached;
          return (
            <button
              key={addon.id}
              type="button"
              aria-pressed={active}
              disabled={disabled}
              onClick={() => onToggle(addon.id)}
              className={cn(
                "flex min-h-[44px] items-center gap-1.5 rounded-full px-4 transition-[border-color,transform] duration-150",
                active
                  ? "bg-primary text-onPrimary shadow-[0_4px_14px_rgb(var(--color-primary)/0.25)] motion-safe:animate-piec-bump"
                  : "border-[1.5px] border-piec-ink/[0.18] hover:border-primary/70 active:scale-[0.96]",
                disabled && "cursor-default opacity-40 hover:border-piec-ink/[0.18]",
              )}
            >
              <span className={cn("text-[13.5px]", active ? "font-bold" : "font-semibold text-piec-ink/85")}>
                {addon.name}
              </span>
              {Number(addon.price) > 0 ? (
                <span
                  className={cn(
                    "whitespace-nowrap text-[12.5px] font-semibold",
                    active ? "opacity-75" : "text-piec-ink/50",
                  )}
                >
                  +{formatPrice(addon.price, currency)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
