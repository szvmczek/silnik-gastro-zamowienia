import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, X } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";
import { VariantPicker } from "./VariantPicker";
import { AddonGroupPicker } from "./AddonGroupPicker";
import { formatPrice } from "../lib/formatPrice";
import { useMenuPrice, type SelectedAddons } from "../hooks/useMenuPrice";
import { useCartStore, type CartAddon } from "@/features/public/cart/cartStore";
import type { PublicProductDto } from "@/shared/api/menuApi";

export interface ProductModalDefaults {
  variantId: number | null;
  addonIds: number[];
  quantity: number;
}

interface Props {
  product: PublicProductDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
  defaults?: ProductModalDefaults | null;
}

function buildSelected(product: PublicProductDto, addonIds: number[] | null): SelectedAddons {
  const map: SelectedAddons = {};
  const picked = new Set(addonIds ?? []);
  for (const group of product.addonGroups) {
    const intersection = new Set<number>();
    for (const addon of group.addons) {
      if (picked.has(addon.id)) intersection.add(addon.id);
    }
    map[group.id] = intersection;
  }
  return map;
}

export function ProductModal({ product, open, onOpenChange, currency, defaults }: Props) {
  const [variantId, setVariantId] = useState<number | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<SelectedAddons>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!product || !open) return;
    if (defaults) {
      setVariantId(defaults.variantId);
      setSelectedAddons(buildSelected(product, defaults.addonIds));
      setQuantity(Math.max(1, defaults.quantity));
    } else {
      setVariantId(product.variants[0]?.id ?? null);
      setSelectedAddons(buildSelected(product, null));
      setQuantity(1);
    }
  }, [product, open, defaults]);

  const { total, variant } = useMenuPrice({ product, variantId, selectedAddons, quantity });
  const addItem = useCartStore((s) => s.addItem);

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

  const handleAddToCart = () => {
    if (!product || validationIssue) return;
    const addons: CartAddon[] = [];
    for (const group of product.addonGroups) {
      const picked = selectedAddons[group.id];
      if (!picked) continue;
      for (const addon of group.addons) {
        if (picked.has(addon.id)) {
          addons.push({
            addonId: addon.id,
            name: addon.name,
            groupName: group.name,
            price: Number(addon.price),
          });
        }
      }
    }
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
    toast.success(`Dodano do koszyka: ${product.name}`);
    onOpenChange(false);
  };

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
      <DialogContent
        showClose={false}
        className={cn(
          "flex max-h-[90vh] flex-col gap-0 overflow-hidden border-0 bg-[rgb(var(--color-bg-card))] p-0 shadow-[var(--shadow-lg)]",
          "sm:max-w-[760px] sm:rounded-2xl",
          // mobile: bottom sheet
          "max-sm:left-0 max-sm:top-auto max-sm:bottom-0 max-sm:w-full max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0",
          "max-sm:rounded-b-none max-sm:rounded-t-2xl",
          "max-sm:data-[state=open]:slide-in-from-bottom max-sm:data-[state=closed]:slide-out-to-bottom",
          "max-sm:data-[state=open]:zoom-in-100 max-sm:data-[state=closed]:zoom-out-100"
        )}
      >
        {/* Mobile drag handle */}
        <div className="flex shrink-0 justify-center pt-2.5 sm:hidden">
          <div
            className="h-1 w-10 rounded-full bg-[rgb(var(--color-border-strong))]"
            aria-hidden="true"
          />
        </div>

        <div className="relative shrink-0">
          {product.imageUrl ? (
            <div className="aspect-[16/9] w-full overflow-hidden bg-[rgb(var(--color-bg-section))] sm:aspect-[21/9]">
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
          <DialogClose
            aria-label="Zamknij"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-[rgb(var(--color-bg-card)/0.92)] text-[rgb(var(--color-text-primary))] shadow-sm backdrop-blur transition-colors hover:bg-[rgb(var(--color-bg-card))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          >
            <X className="h-[18px] w-[18px]" />
          </DialogClose>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-6 sm:px-7">
          <DialogHeader className="gap-2">
            <DialogTitle className="text-[22px] font-semibold tracking-tight text-[rgb(var(--color-text-primary))] sm:text-[28px]">
              {product.name}
            </DialogTitle>
            {product.description ? (
              <DialogDescription className="text-[14px] leading-relaxed text-[rgb(var(--color-text-body))]">
                {product.description}
              </DialogDescription>
            ) : null}
          </DialogHeader>

          <div className="mt-6 space-y-6">
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

        <div className="shrink-0 border-t border-[rgb(var(--color-border-subtle))] bg-[rgb(var(--color-bg-card))] px-6 py-4 sm:px-7">
          {validationIssue ? (
            <p className="mb-3 text-[12px] font-medium text-rose-600">{validationIssue}</p>
          ) : null}
          <div className="flex items-center gap-3">
            <div className="flex h-12 shrink-0 items-center rounded-md border border-[rgb(var(--color-border-card))]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-11 w-11 items-center justify-center text-[rgb(var(--color-text-body))] transition-colors hover:bg-[rgb(var(--color-bg-section))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] disabled:opacity-40"
                disabled={quantity <= 1}
                aria-label="Zmniejsz ilość"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-10 text-center font-mono text-[15px] font-semibold text-[rgb(var(--color-text-primary))]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-11 w-11 items-center justify-center text-[rgb(var(--color-text-body))] transition-colors hover:bg-[rgb(var(--color-bg-section))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
                aria-label="Zwiększ ilość"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button
              type="button"
              variant="primary"
              size="xl"
              disabled={validationIssue !== null}
              onClick={handleAddToCart}
              className="flex-1"
            >
              <span className="truncate">
                Dodaj do koszyka — {formatPrice(total, currency)}
              </span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
