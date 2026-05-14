// Relative-time formatter tuned for ETA context. The >120 min branch
// signals a stale ETA so the operator knows to refresh — that's why we
// don't just defer to Intl.RelativeTimeFormat which would render a
// neutral "2 godz. temu".
export function computeEtaRelativeTime(
  etaSetAt: string,
  now: number = Date.now()
): string {
  const minutes = Math.floor((now - new Date(etaSetAt).getTime()) / 60_000);
  if (minutes < 1) return "przed chwilą";
  if (minutes < 60) return `${minutes} min temu`;
  if (minutes < 120) return "ponad godzinę temu";
  return "dawno";
}
