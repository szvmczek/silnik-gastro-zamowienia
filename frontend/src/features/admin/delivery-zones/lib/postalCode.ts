const CANONICAL = /^\d{2}-\d{3}$/;
const DIGITS_5 = /^\d{5}$/;

export function formatPostalCode(raw: string): string | null {
  const compact = raw.replace(/\s+/g, "");
  if (CANONICAL.test(compact)) return compact;
  if (DIGITS_5.test(compact)) return `${compact.slice(0, 2)}-${compact.slice(2)}`;
  return null;
}

export function isValidPostalCode(raw: string): boolean {
  return formatPostalCode(raw) !== null;
}

export function parsePostalCodes(raw: string): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((token) => {
      const formatted = formatPostalCode(token);
      if (formatted) {
        if (!seen.has(formatted)) {
          seen.add(formatted);
          valid.push(formatted);
        }
      } else {
        invalid.push(token);
      }
    });
  return { valid, invalid };
}

export function maskPostalCodeInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 5);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}-${digits.slice(2)}`;
}
