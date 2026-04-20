export function formatPrice(value: string | number | null | undefined, currency = "PLN"): string {
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return "";
  const formatted = num.toFixed(2).replace(".", ",");
  return `${formatted} ${currency}`;
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
