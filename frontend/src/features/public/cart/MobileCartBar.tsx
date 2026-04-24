import { ShoppingCart } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
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
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.05)] backdrop-blur md:hidden">
      <Button
        variant="primary"
        size="xl"
        className="w-full justify-between"
        onClick={onOpenCart}
      >
        <span className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          <span>Koszyk · {count}</span>
        </span>
        <span className="font-mono">{formatPrice(total, currency)}</span>
      </Button>
    </div>
  );
}
