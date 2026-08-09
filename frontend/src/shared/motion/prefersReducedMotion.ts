/**
 * Jedno źródło prawdy dla helperów motion, które robią coś w JS (rolka
 * cyfr, lot do koszyka). Animacje czysto CSS-owe łapie globalny guard
 * w styles/tokens.css i nie potrzebują tego pliku.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
