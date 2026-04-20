import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { cn } from "@/shared/lib/cn";
import { VariantPicker } from "./VariantPicker";
import { AddonGroupPicker } from "./AddonGroupPicker";
import { formatPrice } from "../lib/formatPrice";
import { useMenuPrice, type SelectedAddons } from "../hooks/useMenuPrice";
import type { PublicProductDto } from "@/shared/api/menuApi";

interface Props {
  product: PublicProductDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
}

function initialSelected(product: PublicProductDto | null): SelectedAddons {
  if (!product) return {};
  const map: SelectedAddons = {};
  for (const group of product.addonGroups) {
    map[group.id] = new Set<number>();
  }
  return map;
}

export function ProductModal({ product, open, onOpenChange, currency }: Props) {
  const [variantId, setVariantId] = useState<number | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddons>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product || !open) return;
    setVariantId(product.variants[0]?.id ?? null);
    setSelectedAddons(initialSelected(product));
    setQuantity(1);
  }, [product, open]);

  const { unit, total } = useMenuPrice({ product, variantId, selectedAddons, quantity });

  const validationIssue = useMemo(() => {
    if (!product) return null;
    if (product.variants.length > 0 && variantId === null) {
      return "Wybierz wariant";
    }
    for (const group of product.addonGroups) {
      const count = selectedAddons[group.id]?.size ?? 0;
      if (count < group.minSelect) {
        return `"${group.name}" — wybierz co najmniej ${group.minSelect}`;
      }
    }
    return null;
  }, [product, variantId, selectedAddons]);

  const toggleAddon = (groupId: number, addonId: number) => {
    setSelectedAddons((prev) => {
      const current = new Set(prev[groupId] ?? []);
      const group = product?.addonGroups.find((g) => g.id === groupId);
      if (!group) return prev;
      if (current.has(addonId)) {
        current.delete(addonId);
      } else {
        if (current.size >= group.maxSelect) {
          if (group.maxSelect === 1) {
            current.clear();
          } else {
            return prev;
          }
        }
        current.add(addonId);
      }
      return { ...prev, [groupId]: current };
    });
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-full max-w-2xl overflow-hidden p-0 sm:rounded-xl">
        <div className="flex max-h-[90vh] flex-col">
          {product.imageUrl ? (
            <div className="aspect-[16/9] w-full shrink-0 overflow-hidden bg-slate-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : null}

          <div className="overflow-y-auto px-6 pb-4 pt-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{product.name}</DialogTitle>
              {product.description ? (
                <DialogDescription className="text-sm text-slate-600">
                  {product.description}
                </DialogDescription>
              ) : null}
            </DialogHeader>

            <div className="mt-5 space-y-5">
              <VariantPicker
                variants={product.variants}
                selectedId={variantId}
                onChange={setVariantId}
                currency={currency}
              />

              {product.addonGroups.map((group) => (
                <AddonGroupPicker
                  key={group.id}
                  group={group}
                  selected={selectedAddons[group.id] ?? new Set<number>()}
                  onToggle={toggleAddon}
                  currency={currency}
                />
              ))}
            </div>
          </div>

          <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-slate-600">Cena jednostkowa</span>
              <span className="text-base font-semibold text-slate-900">
                {formatPrice(unit, currency)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-md border border-slate-200">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="h-9 w-9 text-lg font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                  disabled={quantity <= 1}
                  aria-label="Zmniejsz ilość"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="h-9 w-9 text-lg font-semibold text-slate-700 hover:bg-slate-50"
                  aria-label="Zwiększ ilość"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                disabled
                title="Koszyk pojawi się w Fazie 3"
                className={cn(
                  "flex-1 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                <span className="flex items-center justify-between">
                  <span>Dodaj do koszyka</span>
                  <span>{formatPrice(total, currency)}</span>
                </span>
              </button>
            </div>
            {validationIssue ? (
              <p className="mt-2 text-xs font-medium text-rose-600">{validationIssue}</p>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Koszyk będzie aktywny w Fazie 3.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
