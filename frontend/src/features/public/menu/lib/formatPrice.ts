/* Currency label dla wyświetlania w UI. Backend SettingsDto.currency
   trzyma ISO code (np. "PLN"); UI display zawsze "zł" dla PLN.
   Inne waluty (EUR/USD/...) fallback do ISO code. */
export const CURRENCY_LABEL = "zł";

export function formatPrice(
  value: string | number | null | undefined,
  currency: string = "PLN"
): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "";
  const formatted = num.toFixed(2).replace(".", ",");
  // PLN → "zł" (UX label), inne waluty rendered as ISO code (fallback)
  const label = currency === "PLN" ? CURRENCY_LABEL : currency;
  return `${formatted} ${label}`;
}

export function minVariantPrice(variants: { price: string }[]): string | null {
  if (!variants.length) return null;
  let min = Number(variants[0].price);
  for (const v of variants) {
    const p = Number(v.price);
    if (!Number.isNaN(p) && p < min) min = p;
  }
  return min.toFixed(2);
}
