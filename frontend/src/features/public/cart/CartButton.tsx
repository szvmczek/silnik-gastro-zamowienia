import { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useCartCount } from "./cartStore";

interface Props {
  onClick: () => void;
}

/* CartButton — state-based ikona w PublicNav (F-006 retrofit).
   - count = 0: 40×40 outlined kwadrat (border-card, text-primary)
   - count > 0: h-10 px-3 primary bg, white text, icon + mono count
   Bump animation 200ms gdy count wzrasta (klient dodał item z ProductModal).
   prefers-reduced-motion wyłącza animację via tokens.css globalny
   media query. */

export function CartButton({ onClick }: Props) {
  const count = useCartCount();
  const [bumping, setBumping] = useState(false);
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (count > prevCountRef.current) {
      setBumping(true);
      const timer = window.setTimeout(() => setBumping(false), 200);
      prevCountRef.current = count;
      return () => window.clearTimeout(timer);
    }
    prevCountRef.current = count;
  }, [count]);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `Koszyk (${count})` : "Koszyk"}
      className={cn(
        "inline-flex h-10 shrink-0 items-center rounded-md transition-colors focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
        count > 0
          ? "gap-2 border border-transparent bg-[rgb(var(--color-primary))] px-3 text-white hover:bg-[rgb(var(--color-primary-hover))]"
          : "w-10 justify-center border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-primary))] hover:border-[rgb(var(--color-border-strong))]",
        bumping && "is-bumping"
      )}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 ? (
        <span className="font-mono text-[13px] font-semibold leading-none tabular-nums">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
