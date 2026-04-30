export interface TimerEscalation {
  color: string;
  pulse: boolean;
}

export function timerEscalation(
  placedAtIso: string,
  nowMs: number = Date.now(),
): TimerEscalation {
  const elapsedMin = (nowMs - new Date(placedAtIso).getTime()) / 60_000;
  if (elapsedMin < 5) return { color: "text-slate-500", pulse: false };
  if (elapsedMin < 10) return { color: "text-amber-600", pulse: false };
  return { color: "text-red-600", pulse: true };
}
