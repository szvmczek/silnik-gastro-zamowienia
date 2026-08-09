/**
 * ETA jako godzina zegarowa.
 *
 * Backend trzyma parę (etaMinutes, etaSetAt) — liczba minut i moment,
 * w którym ją ustawiono; oba pola są w DTO od V9 i encja pilnuje ich
 * niezmiennika. Da się z tego odtworzyć konkretną godzinę, więc nie
 * pokazujemy klientowi surowego „~25 minut" liczonego od nie wiadomo
 * kiedy — po 40 minutach czekania taka liczba wprowadza w błąd.
 */
export function etaClockTime(
  etaMinutes: number | null,
  etaSetAt: string | null,
): string | null {
  if (etaMinutes === null || !etaSetAt) return null;
  const setAt = new Date(etaSetAt);
  if (Number.isNaN(setAt.getTime())) return null;
  const target = new Date(setAt.getTime() + etaMinutes * 60_000);
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Warsaw",
  }).format(target);
}
