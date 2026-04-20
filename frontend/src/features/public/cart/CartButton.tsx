import { ShoppingCart } from "lucide-react";
import { useCartCount } from "./cartStore";

interface Props {
  onClick: () => void;
}

export function CartButton({ onClick }: Props) {
  const count = useCartCount();
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={count > 0 ? `Koszyk (${count})` : "Koszyk"}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition-colors hover:bg-slate-100 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
