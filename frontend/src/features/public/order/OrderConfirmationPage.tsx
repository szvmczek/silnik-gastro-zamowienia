import { Link, useLocation, useParams } from "react-router-dom";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { formatShortOrderNumber } from "@/shared/lib/orderNumber";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { PiecLinkButton } from "@/features/public/shared/PiecButton";
import { type CartItem, lineTotal as cartLineTotal } from "@/features/public/cart/cartStore";

interface ConfirmationLocationState {
  trackingToken?: string;
  total?: string;
  items?: CartItem[];
  subtotal?: number;
  deliveryFee?: number | null;
  cashChangeFrom?: string | null;
}

export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const state = (location.state as ConfirmationLocationState | null) ?? {};
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  const shortNumber = formatShortOrderNumber(orderNumber);
  const items = state.items ?? [];
  const hasSnapshot = items.length > 0;
  const isDelivery = state.deliveryFee !== null && state.deliveryFee !== undefined;
  const prepMinutes = settings?.defaultPreparationMinutes ?? null;

  return (
    <PiecShell size="narrow" className="pb-16 pt-5">
      <Link to="/" className="flex min-h-[44px] items-center font-display text-xl tracking-[3px]">
        {settings?.name ?? " "}
      </Link>

      <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-piec-ok bg-piec-ok/[0.12] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-50 motion-safe:duration-500">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 12.5L9.5 18L20 6.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-piec-ok"
          />
        </svg>
      </div>

      <h1 className="mt-3.5 text-center font-display text-[clamp(30px,8vw,40px)] tracking-[1.5px]">
        Zamówienie przyjęte
      </h1>
      {/* D-06: klient i telefon operują krótkim numerem; pełny „2026-00047"
          zostaje w bazie i w panelu. */}
      <p className="mt-1.5 text-center text-[14.5px] text-piec-ink/65">
        Nr <b className="text-piec-ink">{shortNumber}</b>
      </p>

      <section className="mt-5 rounded-2xl border border-piec-ink/10 bg-piec-surface2 p-[18px] text-center">
        <p className="text-[11.5px] font-bold uppercase tracking-[2px] text-piec-ink/55">
          {isDelivery ? "Będzie u Ciebie" : "Do odbioru"}
        </p>
        <p className="mt-0.5 font-display text-[44px] tracking-[1px] text-primary">
          {prepMinutes ? `~${prepMinutes} min` : "wkrótce"}
        </p>
        <p className="mt-1 text-[13.5px] text-piec-ink/60">
          {isDelivery
            ? "Dokładną godzinę zobaczysz po przyjęciu zamówienia przez kuchnię."
            : `Odbiór: ${[settings?.addressLine, settings?.city].filter(Boolean).join(", ")}`}
        </p>
      </section>

      {hasSnapshot ? (
        <section className="mt-3 rounded-2xl border border-piec-ink/10 bg-piec-surface2 px-4 py-3.5">
          {items.map((item) => (
            <div key={item.lineKey} className="flex justify-between gap-2.5 py-1 text-sm">
              <span className="text-piec-ink/75">
                {item.productName}
                {item.quantity > 1 ? ` ×${item.quantity}` : ""}
              </span>
              <span className="whitespace-nowrap font-semibold">
                {formatPrice(cartLineTotal(item), currency)}
              </span>
            </div>
          ))}
          {state.deliveryFee ? (
            <div className="flex justify-between gap-2.5 py-1 text-sm">
              <span className="text-piec-ink/55">Dostawa</span>
              <span className="font-semibold">{formatPrice(state.deliveryFee, currency)}</span>
            </div>
          ) : null}
          {state.total ? (
            <div className="mt-2 flex justify-between gap-2.5 border-t border-piec-ink/10 pt-2.5">
              <span className="text-[14.5px] font-bold">Razem, gotówką</span>
              <span className="font-display text-[22px] tracking-[0.5px] text-primary">
                {formatPrice(state.total, currency)}
              </span>
            </div>
          ) : null}
          {state.cashChangeFrom ? (
            <p className="mt-1.5 text-[13px] text-piec-ink/55">
              Reszta z {formatPrice(state.cashChangeFrom, currency)}.
            </p>
          ) : null}
        </section>
      ) : (
        <p className="mt-3 rounded-2xl border border-piec-ink/10 bg-piec-surface2 px-4 py-3.5 text-[13.5px] leading-[1.6] text-piec-ink/60">
          Szczegóły zamówienia zobaczysz na stronie śledzenia.
        </p>
      )}

      {state.trackingToken ? (
        <>
          <p className="mt-4 text-[13.5px] leading-[1.6] text-piec-ink/60">
            Status sprawdzisz pod tym linkiem — bez logowania, bez konta:
          </p>
          <p className="mt-2 break-all rounded-[10px] border border-dashed border-piec-ink/[0.28] bg-piec-surface2 px-3.5 py-2.5 text-[13.5px] text-piec-ink/80">
            {`${window.location.origin}/track/${state.trackingToken}`}
          </p>
          <PiecLinkButton
            to={`/track/${state.trackingToken}`}
            fullWidth
            className="mt-3.5 text-[15.5px] uppercase"
          >
            Śledź zamówienie
          </PiecLinkButton>
        </>
      ) : (
        <p className="mt-4 rounded-xl border border-piec-warn/40 bg-piec-warn/[0.08] px-3.5 py-3 text-sm leading-[1.6] text-piec-warnSoft">
          Link do śledzenia był jednorazowy i zniknął przy odświeżeniu strony. Zadzwoń, podając
          numer {shortNumber} — sprawdzimy status.
        </p>
      )}

      <PiecLinkButton to="/" variant="outline" height={50} fullWidth className="mt-2.5 text-[14.5px]">
        Wróć na stronę główną
      </PiecLinkButton>

      <p className="mt-4 text-center text-[13px] leading-[1.6] text-piec-ink/45">
        Zadzwonimy tylko, jeśli coś będzie niejasne.
      </p>
    </PiecShell>
  );
}
