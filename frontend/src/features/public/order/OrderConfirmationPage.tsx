import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
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
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-semibold">
            {settings?.name ?? "Restauracja"}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-16 pt-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900 sm:text-3xl">
            Zamówienie przyjęte!
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Dziękujemy za zamówienie. Numer zamówienia:
          </p>
          <p className="mt-3 text-2xl font-mono font-bold tracking-wider text-primary sm:text-3xl">
            {orderNumber ?? "—"}
          </p>
          {state.total ? (
            <p className="mt-4 text-sm text-slate-600">
              Do zapłaty:{" "}
              <span className="font-semibold text-slate-900">
                {formatPrice(state.total, currency)}
              </span>
            </p>
          ) : null}

          {state.trackingToken ? (
            <div className="mt-8 space-y-3">
              <Link to={`/track/${state.trackingToken}`} className="block">
                <Button size="lg" className="w-full">
                  Śledź zamówienie
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-slate-500">
                Zachowaj ten link — to jedyny sposób, aby wrócić do widoku śledzenia.
              </p>
            </div>
          ) : (
            <div className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-900">
              <p className="font-semibold">Nie widzisz przycisku śledzenia?</p>
              <p className="mt-1">
                Link do śledzenia jest dostępny tylko zaraz po złożeniu zamówienia.
                Jeśli odświeżyłeś stronę, sprawdź wcześniej otwartą kartę.
                Twoje zamówienie <strong>{orderNumber}</strong> zostało zapisane.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/menu">
              <Button variant="ghost" size="md">
                Wróć do menu
              </Button>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="md">
                Strona główna
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
