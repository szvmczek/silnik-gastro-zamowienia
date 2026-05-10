import { useEffect, useRef, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useCartCount } from "./cartStore";

interface Props {
  onClick: () => void;
}

/* CartButton — ikona koszyka w PublicNav. Po M-019: bump animation
   200ms gdy cartCount wzrasta (klient dodał item z ProductModal).
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
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        bumping && "is-bumping"
      )}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
