import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowRight, CircleCheck, Info } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import {
  type CartItem,
  lineTotal as cartLineTotal,
} from "@/features/public/cart/cartStore";

interface ConfirmationLocationState {
  trackingToken?: string;
  total?: string;
  items?: CartItem[];
  subtotal?: number;
  deliveryFee?: number | null;
}

export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const state = (location.state as ConfirmationLocationState | null) ?? {};
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  const hasSummarySnapshot = !!(state.items && state.items.length > 0);

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-page))] text-[rgb(var(--color-text-primary))]">
      <header className="border-b border-[rgb(var(--color-border-subtle))] bg-[rgb(var(--color-bg-card))]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-10">
          <Link to="/" className="text-[15px] font-semibold">
            {settings?.name ?? "Restauracja"}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 pb-16 pt-10 md:pt-16">
        <div className="w-full md:w-[580px]">
          <div className="rounded-2xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-8 text-center sm:p-10">
            <div className="inline-flex animate-in fade-in zoom-in-50 duration-500 ease-out">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(var(--color-primary-tint))]">
                <CircleCheck className="h-8 w-8 text-[rgb(var(--color-primary))]" strokeWidth={2} />
              </div>
            </div>
            <div className="t-kicker t-kicker--accent mt-5">
              POTWIERDZENIE · #{orderNumber ?? "—"}
            </div>
            <h1 className="mt-3 text-[28px] font-black tracking-tight text-[rgb(var(--color-text-primary))] sm:text-[40px]">
              Dziękujemy za zamówienie<span className="text-[rgb(var(--color-primary))]">.</span>
            </h1>
            <p className="mx-auto mt-3 max-w-[440px] text-[14px] leading-relaxed text-[rgb(var(--color-text-muted))] sm:text-[15px]">
              Zapisaliśmy Twoje zamówienie. Poniżej znajdziesz numer zamówienia
              i link do śledzenia.
            </p>

            <div className="mt-7 inline-block rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-section))] px-6 py-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[rgb(var(--color-text-faint))]">
                Numer zamówienia
              </div>
              <div className="mt-1 font-mono text-[28px] font-semibold tracking-tight text-[rgb(var(--color-text-primary))] sm:text-[32px] md:text-[40px]">
                {orderNumber ?? "—"}
              </div>
            </div>

            {state.total && !hasSummarySnapshot ? (
              <p className="mt-4 text-[13px] text-[rgb(var(--color-text-muted))]">
                Do zapłaty:{" "}
                <span className="font-semibold text-[rgb(var(--color-text-primary))]">
                  {formatPrice(state.total, currency)}
                </span>
              </p>
            ) : null}

            <div className="mt-6 flex items-start gap-2.5 rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-section))] px-4 py-3 text-left text-[13px] text-[rgb(var(--color-text-body))]">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[rgb(var(--color-text-muted))]" />
              <span>
                Zachowaj ten link — to twój dostęp do śledzenia bez logowania.
              </span>
            </div>

            {state.trackingToken ? (
              <div className="mt-7">
                <Link to={`/track/${state.trackingToken}`} className="inline-block w-full md:w-auto">
                  <Button variant="primary" size="xl" className="w-full md:w-auto md:px-10">
                    Śledź zamówienie
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="mt-7 rounded-md border border-[rgb(var(--color-primary))]/30 bg-[rgb(var(--color-primary-tint))] p-4 text-left text-[13px] text-[rgb(var(--color-primary))]">
                <p className="font-semibold">Nie widzisz przycisku śledzenia?</p>
                <p className="mt-1 leading-relaxed">
                  Link do śledzenia jest dostępny tylko zaraz po złożeniu zamówienia.
                  Jeśli odświeżyłeś stronę, sprawdź wcześniej otwartą kartę.
                  Twoje zamówienie <strong>{orderNumber}</strong> zostało zapisane.
                </p>
              </div>
            )}

            <Link
              to="/menu"
              className="mt-5 inline-block text-[13px] text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-primary))]"
            >
              ← Wróć do menu
            </Link>
          </div>

          {hasSummarySnapshot ? (
            <OrderSummarySnapshot
              items={state.items!}
              subtotal={state.subtotal ?? null}
              deliveryFee={state.deliveryFee ?? null}
              total={state.total ?? null}
              currency={currency}
            />
          ) : null}
        </div>
      </main>
    </div>
  );
}

interface OrderSummarySnapshotProps {
  items: CartItem[];
  subtotal: number | null;
  deliveryFee: number | null;
  total: string | null;
  currency: string;
}

function OrderSummarySnapshot({
  items,
  subtotal,
  deliveryFee,
  total,
  currency,
}: OrderSummarySnapshotProps) {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))]">
      <div className="border-b border-[rgb(var(--color-border-card))] px-6 py-4">
        <div className="text-[14px] font-semibold text-[rgb(var(--color-text-primary))]">
          Podsumowanie zamówienia
        </div>
      </div>
      <ul className="divide-y divide-[rgb(var(--color-border-subtle))] px-6 py-2">
        {items.map((item) => {
          const unit =
            item.unitPrice + item.addons.reduce((acc, a) => acc + a.price, 0);
          return (
            <li
              key={item.lineKey}
              className="flex items-start justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[rgb(var(--color-text-primary))]">
                  <span className="text-[rgb(var(--color-text-muted))]">{item.quantity}× </span>
                  {item.productName}
                </p>
                {(item.variantName || item.addons.length > 0) && (
                  <p className="mt-0.5 text-[11px] text-[rgb(var(--color-text-muted))]">
                    {[
                      item.variantName,
                      ...item.addons.map((a) => `+${a.name}`),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <p className="mt-0.5 text-[11px] text-[rgb(var(--color-text-faint))]">
                  {item.quantity} × {formatPrice(unit, currency)}
                </p>
              </div>
              <span className="shrink-0 text-[13px] font-semibold text-[rgb(var(--color-text-primary))]">
                {formatPrice(cartLineTotal(item), currency)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="space-y-1.5 border-t border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-section))] px-6 py-4">
        {subtotal !== null && (
          <div className="flex items-center justify-between text-[13px] text-[rgb(var(--color-text-body))]">
            <span>Suma produktów</span>
            <span>{formatPrice(subtotal, currency)}</span>
          </div>
        )}
        {deliveryFee !== null && deliveryFee > 0 && (
          <div className="flex items-center justify-between text-[13px] text-[rgb(var(--color-text-body))]">
            <span>Dostawa</span>
            <span>{formatPrice(deliveryFee, currency)}</span>
          </div>
        )}
        {total ? (
          <div className="flex items-center justify-between pt-1.5">
            <span className="text-[14px] font-semibold text-[rgb(var(--color-text-primary))]">Razem</span>
            <span className="text-[20px] font-semibold text-[rgb(var(--color-text-primary))]">
              {formatPrice(total, currency)}
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
