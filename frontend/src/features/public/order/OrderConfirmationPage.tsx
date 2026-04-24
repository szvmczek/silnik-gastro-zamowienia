import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowRight, CircleCheck } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";

interface ConfirmationLocationState {
  trackingToken?: string;
  total?: string;
}

export function OrderConfirmationPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const state = (location.state as ConfirmationLocationState | null) ?? {};
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 md:px-10">
          <Link to="/" className="text-[15px] font-semibold">
            {settings?.name ?? "Restauracja"}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-3xl justify-center px-4 pb-16 pt-10 md:pt-16">
        <div className="w-full md:w-[580px]">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">
            <div className="inline-flex animate-in fade-in zoom-in-50 duration-500 ease-out">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <CircleCheck className="h-8 w-8 text-primary" strokeWidth={2} />
              </div>
            </div>
            <h1 className="mt-5 text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[36px]">
              Dziękujemy za zamówienie!
            </h1>
            <p className="mx-auto mt-3 max-w-[440px] text-[14px] leading-relaxed text-slate-500 sm:text-[15px]">
              Zapisaliśmy Twoje zamówienie. Poniżej znajdziesz numer zamówienia
              i link do śledzenia — zachowaj go, jeśli odświeżysz stronę, wrócisz
              przez ten sam link.
            </p>

            <div className="mt-7 inline-block rounded-xl border border-slate-200 bg-slate-50 px-6 py-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
                Numer zamówienia
              </div>
              <div className="mt-1 font-mono text-[28px] font-semibold tracking-tight text-slate-900 sm:text-[32px] md:text-[40px]">
                {orderNumber ?? "—"}
              </div>
            </div>

            {state.total ? (
              <p className="mt-4 text-[13px] text-slate-500">
                Do zapłaty:{" "}
                <span className="font-semibold text-slate-900">
                  {formatPrice(state.total, currency)}
                </span>
              </p>
            ) : null}

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
              <div className="mt-7 rounded-md border border-amber-200 bg-amber-50 p-4 text-left text-[13px] text-amber-900">
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
              className="mt-5 inline-block text-[13px] text-slate-500 hover:text-slate-900"
            >
              ← Wróć do menu
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
