import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCartStore, useCartTotal, lineTotal } from "./cartStore";
import { cartLineMeta } from "./cartLineMeta";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPhoneDisplay } from "@/shared/lib/formatPhone";
import { PiecHeader } from "@/features/public/shared/PiecHeader";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { PiecLinkButton } from "@/features/public/shared/PiecButton";
import {
  StickyActionBar,
  StickyActionBarSpacer,
} from "@/features/public/shared/StickyActionBar";
import { RollingNumber } from "@/shared/motion/RollingNumber";

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const total = useCartTotal();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency;

  if (items.length === 0) {
    return (
      <>
        <PiecHeader size="cart" back={{ to: "/menu", label: "Menu" }} title="Koszyk" />
        <PiecShell size="cart" className="flex min-h-[calc(100vh-200px)] flex-col items-center justify-center py-10 text-center">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-dashed border-piec-ink/[0.28]"
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h2.2l2.3 9.5a1.6 1.6 0 001.55 1.2h7.3a1.6 1.6 0 001.55-1.2L20.5 9H7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-piec-ink/50"
              />
              <circle cx="10.5" cy="20" r="1.3" fill="currentColor" className="text-piec-ink/50" />
              <circle cx="17.5" cy="20" r="1.3" fill="currentColor" className="text-piec-ink/50" />
            </svg>
          </span>
          <h1 className="mt-4 font-display text-[clamp(42px,11vw,58px)] tracking-[2px] text-piec-ink/90">
            Pusto
          </h1>
          <p className="mt-2 max-w-[300px] text-[15px] leading-[1.6] text-piec-ink/60">
            W koszyku jeszcze nic nie ma.
          </p>
          <PiecLinkButton to="/menu" height={52} className="mt-5 px-6">
            Zobacz menu
          </PiecLinkButton>
          {settings?.phone ? (
            <a
              href={`tel:${settings.phone}`}
              className="mt-1.5 flex min-h-[44px] items-center text-sm font-semibold text-piec-ink/60"
            >
              albo zadzwoń: {formatPhoneDisplay(settings.phone)}
            </a>
          ) : null}
        </PiecShell>
      </>
    );
  }

  return (
    <>
      <PiecHeader size="cart" back={{ to: "/menu", label: "Menu" }} title="Koszyk" />

      <PiecShell size="cart" className="pt-2">
        <ul>
          {items.map((item) => {
            const meta = cartLineMeta(item);
            return (
              <li key={item.lineKey} className="border-b border-piec-ink/10 py-4">
                <div className="flex justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-lg tracking-[0.6px]">
                      {item.productName}
                    </h2>
                    <div className="mt-1 flex flex-col gap-0.5">
                      {meta.map((line, index) => (
                        <p
                          key={line}
                          className={
                            index === 0
                              ? "text-[13px] font-semibold leading-[1.45] text-piec-ink/75"
                              : "text-[13px] leading-[1.45] text-piec-ink/55"
                          }
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                  <span className="whitespace-nowrap text-base font-bold">
                    {formatPrice(lineTotal(item), currency)}
                  </span>
                </div>

                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex items-center rounded-full border-[1.5px] border-piec-ink/20 bg-piec-surface2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineKey, item.quantity - 1)}
                      aria-label={`Zmniejsz liczbę: ${item.productName}`}
                      className="flex h-[42px] w-11 items-center justify-center text-xl leading-none transition-colors hover:text-primary"
                    >
                      −
                    </button>
                    <span aria-live="polite" className="w-[22px] text-center text-base font-bold">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.lineKey, item.quantity + 1)}
                      aria-label={`Zwiększ liczbę: ${item.productName}`}
                      className="flex h-[42px] w-11 items-center justify-center text-xl leading-none transition-colors hover:text-primary"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => {
                      removeItem(item.lineKey);
                      toast.success(`Usunięto: ${item.productName}`);
                    }}
                    className="flex min-h-[44px] items-center text-[13.5px] text-piec-ink/55 underline underline-offset-[3px] transition-colors hover:text-piec-warn"
                  >
                    usuń
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex items-baseline justify-between border-t border-piec-ink/10 pb-1 pt-[18px]">
          <span className="text-[14.5px] text-piec-ink/70">Razem, bez dostawy</span>
          <RollingNumber value={formatPrice(total, currency)} size={27} />
        </div>
        <p className="text-[13px] leading-[1.6] text-piec-ink/50">
          Koszt dostawy doliczymy po podaniu adresu. Przy odbiorze osobistym — 0 zł.
        </p>
        <Link
          to="/menu"
          className="mt-2 inline-flex min-h-[44px] items-center text-sm font-semibold text-primary"
        >
          ← dodaj coś jeszcze z menu
        </Link>
      </PiecShell>

      <StickyActionBarSpacer height={120} />
      <StickyActionBar>
        <Link
          to="/upsell"
          className="flex min-h-[54px] items-center justify-center gap-2.5 rounded-[14px] bg-primary text-[15.5px] font-bold text-onPrimary shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-[transform,filter] duration-150 hover:brightness-110 active:scale-[0.97]"
        >
          Dalej · <RollingNumber value={formatPrice(total, currency)} size={17} plain />
        </Link>
      </StickyActionBar>
    </>
  );
}
