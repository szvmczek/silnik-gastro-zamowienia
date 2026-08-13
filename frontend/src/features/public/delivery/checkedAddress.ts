/**
 * Adres sprawdzony na pasku „czy dowozimy" — trzymany na czas wizyty,
 * nie tygodniami, dlatego `sessionStorage`, nie `localStorage` (koszyk
 * ma inne wymagania i zostaje w localStorage).
 *
 * To wyłącznie wygodny domyślny stan pól na checkoucie. Klient może go
 * nadpisać, a backend i tak liczy strefę od nowa przy składaniu zamówienia.
 */
const KEY = "piec.checked-address.v1";

export interface CheckedAddress {
  city: string;
  postalCode: string;
}

export function readCheckedAddress(): CheckedAddress | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const { city, postalCode } = parsed as Partial<CheckedAddress>;
    if (typeof city !== "string" || typeof postalCode !== "string") return null;
    if (!city.trim() || !postalCode.trim()) return null;
    return { city, postalCode };
  } catch {
    // Prywatny tryb przeglądarki / zablokowany storage — brak podpowiedzi
    // to nie jest błąd, checkout działa bez niej.
    return null;
  }
}

export function saveCheckedAddress(address: CheckedAddress): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(address));
  } catch {
    /* jw. */
  }
}
