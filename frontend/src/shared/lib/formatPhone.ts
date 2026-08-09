/**
 * Telefon do wyświetlenia. W bazie trzymamy postać zwartą (E.164, np.
 * „+48236924187"), a design pokazuje ją pogrupowaną — „23 692 41 87".
 *
 * Nie zmieniamy tego, co idzie do href="tel:" — tam zwarta postać jest
 * poprawniejsza. To tylko warstwa prezentacji.
 */
export function formatPhoneDisplay(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");

  // Polski numer z prefiksem kraju: pokazujemy 9 cyfr krajowych.
  const national =
    digits.length === 11 && digits.startsWith("48") ? digits.slice(2) : digits;

  // Komórka: 3-3-3. Stacjonarny z kierunkowym: 2-3-2-2.
  if (national.length === 9) {
    const isMobile = /^[45678]/.test(national);
    return isMobile
      ? `${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`
      : `${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5, 7)} ${national.slice(7)}`;
  }

  // Cokolwiek innego (numer zagraniczny, nietypowy format) — bez zmian.
  return trimmed;
}
