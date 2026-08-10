import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { cashChangeInfo } from "@/shared/lib/cashChange";

interface Props {
  cashChangeFrom: string | number | null | undefined;
  total: string | number;
  currency: string | undefined;
}

/**
 * D-03 — potwierdzenie rozliczenia gotówki na potwierdzeniu i trackingu.
 * Klient widzi to, co wybrał, a nie surową kwotę z bazy: „odliczoną
 * kwotą" zapisuje się jako suma zamówienia, więc bez przeliczenia
 * wyglądałoby jak „reszta z 64 zł" przy zamówieniu za 64 zł.
 */
export function CashChangeNote({ cashChangeFrom, total, currency }: Props) {
  const info = cashChangeInfo(cashChangeFrom, total);
  if (info.kind === "unknown") return null;

  return (
    <p className="mt-1.5 text-[13px] text-piec-ink/55">
      {info.kind === "exact"
        ? "Płacisz odliczoną kwotą."
        : `Reszta z ${formatPrice(info.from, currency)} — wydamy ${formatPrice(info.change, currency)}.`}
    </p>
  );
}
