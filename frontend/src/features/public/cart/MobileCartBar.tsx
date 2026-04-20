import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { useCartCount, useCartTotal } from "./cartStore";

interface Props {
  onOpenCart: () => void;
}

export function MobileCartBar({ onOpenCart }: Props) {
  const count = useCartCount();
  const total = useCartTotal();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  if (count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:hidden">
      <button
        type="button"
        onClick={onOpenCart}
        className="flex w-full items-center justify-between rounded-md bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>Koszyk · {count}</span>
        </span>
        <span>{formatPrice(total, currency)}</span>
      </button>
    </div>
  );
}
