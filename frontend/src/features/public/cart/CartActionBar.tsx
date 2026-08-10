import { Link } from "react-router-dom";
import { useCartCount, useCartTotal } from "./cartStore";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { RollingNumber } from "@/shared/motion/RollingNumber";
import {
  StickyActionBar,
  StickyActionBarSpacer,
} from "@/features/public/shared/StickyActionBar";
import { plural } from "@/shared/lib/plural";

/**
 * Dolny pasek koszyka na ekranie menu — „Koszyk · 3 pozycje | 128,50 zł".
 * Znika, gdy koszyk jest pusty (paczka też go wtedy nie pokazuje).
 */
export function CartActionBar() {
  const count = useCartCount();
  const total = useCartTotal();
  const { data: settings } = usePublicSettings();

  if (count === 0) return null;

  return (
    <>
      <StickyActionBarSpacer />
      <StickyActionBar>
        <Link
          to="/cart"
          className="flex min-h-[54px] items-center justify-between rounded-[14px] bg-primary px-[18px] font-bold text-onPrimary shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.97]"
        >
          <span>
            Koszyk · {count} {plural(count, "pozycja", "pozycje", "pozycji")}
          </span>
          {/* flex — patrz komentarz w CartPill: rolka wyrównana do środka,
              nie do descendera linii. */}
          <span className="flex items-center text-[17px] font-bold">
            <RollingNumber value={formatPrice(total, settings?.currency)} size={17} plain />
          </span>
        </Link>
      </StickyActionBar>
    </>
  );
}
