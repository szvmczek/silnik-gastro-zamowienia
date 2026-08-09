import { Link } from "react-router-dom";
import { useCartCount, useCartTotal } from "@/features/public/cart/cartStore";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { RollingNumber } from "@/shared/motion/RollingNumber";
import { useCountBump } from "@/shared/motion/useCountBump";
import { CART_ANCHOR_ATTR } from "@/shared/motion/flyToCart";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { cn } from "@/shared/lib/cn";

interface CartPillProps {
  /** Co pokazać, gdy koszyk jest pusty. Paczka używa telefonu na stronie
   *  głównej, a suchego „koszyk pusty" w menu. */
  emptyVariant?: "phone" | "label" | "none";
  className?: string;
}

/**
 * Pigułka koszyka z paczki: KOSZYK · {liczba} · {suma}. Nosi atrybut
 * data-cart-anchor, więc jest celem lotu do koszyka (flyToCart).
 */
export function CartPill({ emptyVariant = "label", className }: CartPillProps) {
  const count = useCartCount();
  const total = useCartTotal();
  const { data: settings } = usePublicSettings();
  const bump = useCountBump(count);

  if (count === 0) {
    if (emptyVariant === "none") return null;
    if (emptyVariant === "phone" && settings?.phone) {
      return (
        <a
          href={`tel:${settings.phone}`}
          className="flex min-h-[44px] items-center text-sm font-semibold text-piec-ink/85 transition-colors hover:text-primary"
        >
          {settings.phone}
        </a>
      );
    }
    return (
      <span className="text-[13px] font-semibold text-piec-ink/45">koszyk pusty</span>
    );
  }

  return (
    <Link
      to="/cart"
      {...{ [CART_ANCHOR_ATTR]: "1" }}
      aria-label={`Koszyk, ${count} szt., ${formatPrice(total, settings?.currency)}`}
      className={cn(
        "flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-4 text-[13.5px] font-bold tracking-[0.5px] text-onPrimary",
        "transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.97]",
        className,
      )}
    >
      <span aria-hidden="true">KOSZYK</span>
      <span aria-hidden="true" className={cn("inline-block", bump)}>
        · {count} ·
      </span>
      <span aria-hidden="true">
        <RollingNumber value={formatPrice(total, settings?.currency)} size={13.5} plain />
      </span>
    </Link>
  );
}
