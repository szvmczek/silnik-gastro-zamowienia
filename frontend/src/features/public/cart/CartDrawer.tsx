import { useNavigate } from "react-router-dom";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/shared/components/ui/Sheet";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { lineTotal, useCartStore, useCartTotal, type CartItem } from "./cartStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDrawer({ open, onOpenChange }: Props) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartTotal();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";
  const navigate = useNavigate();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Twój koszyk</SheetTitle>
          <SheetDescription>
            {items.length === 0
              ? "Twój koszyk jest pusty."
              : `Pozycje: ${items.length}`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center text-slate-500">
            <ShoppingCart className="mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm">Dodaj coś z menu, żeby rozpocząć zamówienie.</p>
          </div>
        ) : (
          <>
            <div className="-mx-6 mt-4 flex-1 overflow-y-auto px-6">
              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <CartLineRow
                    key={item.lineKey}
                    item={item}
                    currency={currency}
                    onIncrement={() => updateQuantity(item.lineKey, item.quantity + 1)}
                    onDecrement={() => updateQuantity(item.lineKey, item.quantity - 1)}
                    onRemove={() => removeItem(item.lineKey)}
                  />
                ))}
              </ul>
            </div>
            <div className="shrink-0 border-t border-slate-200 pt-4">
              <div className="flex items-center justify-between text-base">
                <span className="font-medium text-slate-700">Razem</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatPrice(total, currency)}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCheckout}
                className="mt-4 w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Przejdź do checkout
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

interface RowProps {
  item: CartItem;
  currency: string;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

function CartLineRow({ item, currency, onIncrement, onDecrement, onRemove }: RowProps) {
  return (
    <li className="flex gap-3 py-4">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-md object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="h-16 w-16 shrink-0 rounded-md bg-slate-100" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{item.productName}</p>
            {item.variantName ? (
              <p className="text-xs text-slate-500">{item.variantName}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Usuń pozycję"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {item.addons.length > 0 ? (
          <ul className="mt-1 space-y-0.5 text-xs text-slate-500">
            {item.addons.map((a) => (
              <li key={a.addonId}>+ {a.name}</li>
            ))}
          </ul>
        ) : null}

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-slate-200">
            <button
              type="button"
              onClick={onDecrement}
              aria-label="Zmniejsz ilość"
              className="flex h-7 w-7 items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
            <button
              type="button"
              onClick={onIncrement}
              aria-label="Zwiększ ilość"
              className="flex h-7 w-7 items-center justify-center text-slate-600 hover:bg-slate-50"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="text-sm font-semibold text-slate-900">
            {formatPrice(lineTotal(item), currency)}
          </span>
        </div>
      </div>
    </li>
  );
}
