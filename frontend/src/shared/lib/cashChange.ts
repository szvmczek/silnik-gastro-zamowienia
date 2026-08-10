/**
 * D-03 — interpretacja `Order.cashChangeFrom`.
 *
 * Od rundy poprawek 2026-08-10 pole trzyma ZAWSZE kwotę, którą klient
 * deklaruje mieć przy sobie. „Odliczoną kwotą" zapisuje sumę zamówienia,
 * więc reszta wychodzi 0. Dzięki temu `null` znaczy dokładnie jedno:
 * nie wiemy, ile klient da — i kurier musi zadzwonić.
 *
 * Wcześniej `null` znaczyło „odliczoną kwotą", przez co nie dało się
 * odróżnić świadomego wyboru od braku danych. Stare zamówienia z `null`
 * trafiają więc do gałęzi „unknown" — i słusznie, bo naprawdę nie wiemy,
 * co klient wtedy wybrał.
 */
export type CashChangeInfo =
  | { kind: "unknown" }
  | { kind: "exact" }
  | { kind: "change"; from: number; change: number };

function toNumber(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = typeof raw === "number" ? raw : Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

/** Sformatowana kwota w złotych — panel nie używa formatPrice z części publicznej. */
function zl(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

/**
 * Zdanie dla panelu i kuriera. Zawsze mówi, ILE wydać — nie zostawia
 * liczenia w pamięci przy drzwiach klienta. `warn` oznacza stan, w którym
 * trzeba zadzwonić, żeby w ogóle wiedzieć, ile brać.
 */
export function cashChangeText(
  cashChangeFrom: string | number | null | undefined,
  total: string | number,
): { text: string; warn: boolean } {
  const info = cashChangeInfo(cashChangeFrom, total);
  if (info.kind === "unknown") {
    return { text: "Brak danych o reszcie — zadzwoń do klienta", warn: true };
  }
  if (info.kind === "exact") {
    return { text: "Gotówka odliczona — bez reszty", warn: false };
  }
  return {
    text: `Gotówka ${zl(info.from)} · wydaj resztę: ${zl(info.change)}`,
    warn: false,
  };
}

export function cashChangeInfo(
  cashChangeFrom: string | number | null | undefined,
  total: string | number,
): CashChangeInfo {
  const from = toNumber(cashChangeFrom);
  const sum = toNumber(total);
  if (from === null || sum === null) return { kind: "unknown" };
  // Grosze: kwoty są dziesiętne, więc porównujemy z tolerancją zamiast
  // liczyć na dokładność float.
  const change = Math.round((from - sum) * 100) / 100;
  if (change <= 0.004) return { kind: "exact" };
  return { kind: "change", from, change };
}
