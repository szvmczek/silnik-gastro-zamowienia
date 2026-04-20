import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartAddon {
  addonId: number;
  name: string;
  groupName: string;
  price: number;
}

export interface CartItem {
  lineKey: string;
  productId: number;
  productName: string;
  variantId: number | null;
  variantName: string | null;
  addons: CartAddon[];
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
}

export interface CartItemInput {
  productId: number;
  productName: string;
  variantId: number | null;
  variantName: string | null;
  addons: CartAddon[];
  unitPrice: number;
  quantity: number;
  imageUrl: string | null;
}

export function buildLineKey(input: {
  productId: number;
  variantId: number | null;
  addons: { addonId: number }[];
}): string {
  const sortedAddonIds = [...input.addons]
    .map((a) => a.addonId)
    .sort((a, b) => a - b)
    .join(",");
  return `${input.productId}|${input.variantId ?? ""}|${sortedAddonIds}`;
}

interface CartState {
  items: CartItem[];
  addItem: (input: CartItemInput) => void;
  updateQuantity: (lineKey: string, quantity: number) => void;
  removeItem: (lineKey: string) => void;
  clear: () => void;
}

const MAX_QUANTITY_PER_LINE = 99;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (input) =>
        set((state) => {
          const lineKey = buildLineKey({
            productId: input.productId,
            variantId: input.variantId,
            addons: input.addons,
          });
          const existing = state.items.find((it) => it.lineKey === lineKey);
          if (existing) {
            const nextQty = Math.min(MAX_QUANTITY_PER_LINE, existing.quantity + input.quantity);
            return {
              items: state.items.map((it) =>
                it.lineKey === lineKey ? { ...it, quantity: nextQty } : it
              ),
            };
          }
          const newItem: CartItem = {
            lineKey,
            productId: input.productId,
            productName: input.productName,
            variantId: input.variantId,
            variantName: input.variantName,
            addons: input.addons,
            unitPrice: input.unitPrice,
            quantity: Math.min(MAX_QUANTITY_PER_LINE, input.quantity),
            imageUrl: input.imageUrl,
          };
          return { items: [...state.items, newItem] };
        }),
      updateQuantity: (lineKey, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((it) => it.lineKey !== lineKey) };
          }
          const clamped = Math.min(MAX_QUANTITY_PER_LINE, quantity);
          return {
            items: state.items.map((it) =>
              it.lineKey === lineKey ? { ...it, quantity: clamped } : it
            ),
          };
        }),
      removeItem: (lineKey) =>
        set((state) => ({ items: state.items.filter((it) => it.lineKey !== lineKey) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "pizza-showcase-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export function lineTotal(item: CartItem): number {
  const addonsSum = item.addons.reduce((acc, a) => acc + a.price, 0);
  return (item.unitPrice + addonsSum) * item.quantity;
}

export const useCartCount = () =>
  useCartStore((state) => state.items.reduce((acc, it) => acc + it.quantity, 0));

export const useCartTotal = () =>
  useCartStore((state) => state.items.reduce((acc, it) => acc + lineTotal(it), 0));
