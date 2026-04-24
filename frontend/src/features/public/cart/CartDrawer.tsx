import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit3, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/shared/components/ui/Sheet";
import { Button } from "@/shared/components/ui/Button";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { lineTotal, useCartStore, useCartTotal, type CartItem } from "./cartStore";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (item: CartItem) => void;
  onBrowseMenu?: () => void;
}

const MOBILE_QUERY = "(max-width: 767px)";

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(MOBILE_QUERY).matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

export function CartDrawer({ open, onOpenChange, onEdit, onBrowseMenu }: Props) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartTotal();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";
  const navigate = useNavigate();
  const isMobile = useIsMobileViewport();

  const handleCheckout = () => {
    onOpenChange(false);
    navigate("/checkout");
  };

  const handleBrowseMenu = () => {
    onOpenChange(false);
    if (onBrowseMenu) onBrowseMenu();
    else navigate("/menu");
  };

  const handleRemove = (item: CartItem) => {
    removeItem(item.lineKey);
    toast.success(`Usunięto: ${item.productName}`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        showClose={false}
        className={cn(
          "flex flex-col gap-0 p-0",
          isMobile
            ? "max-h-[92vh] rounded-t-xl"
            : "sm:max-w-[440px]"
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <SheetTitle className="text-[17px] font-semibold text-slate-900">
              Twój koszyk
            </SheetTitle>
            {items.length > 0 ? (
              <p className="mt-0.5 text-[12px] text-slate-500">
                {items.length}{" "}
                {items.length === 1 ? "pozycja" : items.length < 5 ? "pozycje" : "pozycji"}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Zamknij koszyk"
            className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-6">
            <EmptyState
              icon={<ShoppingBag className="h-5 w-5" />}
              title="Twój koszyk jest pusty"
              description="Wybierz coś z menu — nasze pizze wyjeżdżają z pieca w ~90 sekund."
              action={
                <Button variant="primary" onClick={handleBrowseMenu}>
                  Przeglądaj menu
                </Button>
              }
              className="w-full max-w-[360px]"
            />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <ul className="divide-y divide-slate-100">
                {items.map((item) => (
                  <CartLineRow
                    key={item.lineKey}
                    item={item}
                    currency={currency}
                    onIncrement={() => updateQuantity(item.lineKey, item.quantity + 1)}
                    onDecrement={() => updateQuantity(item.lineKey, item.quantity - 1)}
                    onRemove={() => handleRemove(item)}
                    onEdit={onEdit ? () => onEdit(item) : undefined}
                  />
                ))}
              </ul>
            </div>
            <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="text-[13px] text-slate-500">Podsuma</span>
                <span className="font-mono text-[16px] font-semibold text-slate-900">
                  {formatPrice(total, currency)}
                </span>
              </div>
              <Button
                type="button"
                variant="primary"
                size="xl"
                className="w-full"
                onClick={handleCheckout}
              >
                Przejdź do kasy →
              </Button>
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
  onEdit?: () => void;
}

function formatLineMeta(item: CartItem): string {
  const parts: string[] = [];
  if (item.variantName) parts.push(item.variantName);
  if (item.addons.length > 0) {
    parts.push(item.addons.map((a) => `+${a.name}`).join(", "));
  }
  return parts.join(" · ");
}

function CartLineRow({ item, currency, onIncrement, onDecrement, onRemove, onEdit }: RowProps) {
  const meta = formatLineMeta(item);
  return (
    <li className="flex gap-3 py-4">
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt=""
          className="h-20 w-20 shrink-0 rounded-lg object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <div className="h-20 w-20 shrink-0 rounded-lg bg-slate-100" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-[14px] font-semibold text-slate-900">
            {item.productName}
          </p>
          <span className="whitespace-nowrap font-mono text-[14px] font-semibold text-slate-900">
            {formatPrice(lineTotal(item), currency)}
          </span>
        </div>
        {meta ? (
          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{meta}</p>
        ) : null}

        <div className="mt-2.5 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-slate-200">
            <button
              type="button"
              onClick={onDecrement}
              aria-label="Zmniejsz ilość"
              className="flex h-11 w-11 items-center justify-center text-slate-600 hover:bg-slate-50 sm:h-8 sm:w-8"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-8 text-center font-mono text-[12px] font-semibold">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={onIncrement}
              aria-label="Zwiększ ilość"
              className="flex h-11 w-11 items-center justify-center text-slate-600 hover:bg-slate-50 sm:h-8 sm:w-8"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1">
            {onEdit ? (
              <button
                type="button"
                onClick={onEdit}
                aria-label={`Edytuj: ${item.productName}`}
                className="flex h-11 w-11 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 sm:h-8 sm:w-8"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            ) : null}
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Usuń: ${item.productName}`}
              className="flex h-11 w-11 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 sm:h-8 sm:w-8"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
