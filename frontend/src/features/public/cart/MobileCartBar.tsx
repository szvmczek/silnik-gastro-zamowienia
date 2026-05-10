import { ShoppingCart } from "lucide-react";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { useCartCount, useCartTotal } from "./cartStore";

/* MobileCartBar — floating bar bottom (z bundle Stage 2 MobileCartBar).
   Widoczny gdy items > 0 i viewport < lg (≥ 1024 px chowamy bo widać
   CartSidebar w M-019). Klik → otwiera CartBottomSheet (M-022) przez
   onOpenCart callback w MenuPage / LandingPage. */

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
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 pt-2 lg:hidden">
      <button
        type="button"
        onClick={onOpenCart}
        className="flex h-14 w-full items-center justify-between rounded-lg bg-[rgb(var(--color-primary))] px-4 text-white transition-[transform,background-color] duration-[120ms] ease-[cubic-bezier(0.2,0.7,0.3,1)] hover:bg-[rgb(var(--color-primary-hover))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] active:scale-[0.985]"
        style={{ boxShadow: "0 8px 24px rgba(230, 57, 70, 0.32)" }}
        aria-label={`Otwórz koszyk · ${count} sztuk · ${formatPrice(total, currency)}`}
      >
        <span className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 font-mono text-[13px] font-bold leading-none tabular-nums">
            {count}
          </span>
          <span className="flex items-center gap-1.5 text-[15px] font-bold">
            <ShoppingCart className="h-4 w-4" />
            Koszyk
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="font-mono text-[15px] font-bold tabular-nums">
            {formatPrice(total, currency)}
          </span>
          <span className="text-[14px] opacity-80" aria-hidden="true">
            ›
          </span>
        </span>
      </button>
    </div>
  );
}
