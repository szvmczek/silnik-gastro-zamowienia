/**
 * Polska odmiana rzeczownika po liczebniku: 1 pozycja, 2-4 pozycje,
 * 5+ pozycji, z wyjątkiem nastek (12 pozycji, nie „12 pozycje").
 */
export function plural(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count);
  if (abs === 1) return one;
  const lastDigit = abs % 10;
  const lastTwo = abs % 100;
  const isFew = lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14);
  return isFew ? few : many;
}
