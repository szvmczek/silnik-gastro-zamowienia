/**
 * D-06: w bazie numer jest jednoznaczny i sortowalny („2026-00047"),
 * a klientowi i przez telefon operuje się krótką częścią („Nr 47").
 *
 * URL trackingu zostaje na UUID (AD-007) — skracamy tylko to, co widać,
 * nigdy adresu. Numer sekwencyjny w linku ujawniłby cudze zamówienia
 * razem z adresem i telefonem.
 */
export function formatShortOrderNumber(orderNumber: string | null | undefined): string {
  if (!orderNumber) return "";
  const match = orderNumber.match(/^\d{4}-(\d+)$/);
  if (!match) return orderNumber;
  const short = match[1].replace(/^0+/, "");
  return short || "0";
}
