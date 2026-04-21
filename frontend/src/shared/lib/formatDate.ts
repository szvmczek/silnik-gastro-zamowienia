const DEFAULT_LOCALE = "pl-PL";
const RESTAURANT_TIMEZONE = "Europe/Warsaw";

export function formatDateTime(iso: string, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: RESTAURANT_TIMEZONE,
  }).format(new Date(iso));
}

export function formatDate(iso: string, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeZone: RESTAURANT_TIMEZONE,
  }).format(new Date(iso));
}

export function formatTime(iso: string, locale = DEFAULT_LOCALE): string {
  return new Intl.DateTimeFormat(locale, {
    timeStyle: "short",
    timeZone: RESTAURANT_TIMEZONE,
  }).format(new Date(iso));
}
