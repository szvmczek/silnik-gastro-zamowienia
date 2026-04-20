import { useMemo } from "react";
import type { PublicAddonGroupDto, PublicProductDto, PublicVariantDto } from "@/shared/api/menuApi";

export type SelectedAddons = Record<number, Set<number>>;

function sumAddons(groups: PublicAddonGroupDto[], selected: SelectedAddons): number {
  let total = 0;
  for (const group of groups) {
    const picked = selected[group.id];
    if (!picked) continue;
    for (const addon of group.addons) {
      if (picked.has(addon.id)) total += Number(addon.price);
    }
  }
  return total;
}

interface Args {
  product: PublicProductDto | null;
  variantId: number | null;
  selectedAddons: SelectedAddons;
  quantity: number;
}

export function useMenuPrice({ product, variantId, selectedAddons, quantity }: Args) {
  return useMemo(() => {
    if (!product) return { unit: 0, total: 0, variant: null as PublicVariantDto | null };

    const variant = product.variants.find((v) => v.id === variantId) ?? null;
    const base = variant
      ? Number(variant.price)
      : product.basePrice !== null
        ? Number(product.basePrice)
        : 0;

    const addonsTotal = sumAddons(product.addonGroups, selectedAddons);
    const unit = base + addonsTotal;
    const total = unit * Math.max(1, quantity);

    return { unit, total, variant };
  }, [product, variantId, selectedAddons, quantity]);
}
