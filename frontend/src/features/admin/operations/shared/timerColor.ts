export interface TimerEscalation {
  color: string;
  pulse: boolean;
}

/* Timer escalation colors per elapsed time since order placed.
   <5 min — neutral muted, 5–10 min — amber warning, >10 min — red + pulse.
   Tokens v2: text-faint / status-new / status-cancelled. */
export function timerEscalation(
  placedAtIso: string,
  nowMs: number = Date.now(),
): TimerEscalation {
  const elapsedMin = (nowMs - new Date(placedAtIso).getTime()) / 60_000;
  if (elapsedMin < 5)
    return { color: "text-[rgb(var(--color-text-muted))]", pulse: false };
  if (elapsedMin < 10)
    return { color: "text-[rgb(var(--status-new))]", pulse: false };
  return { color: "text-[rgb(var(--status-cancelled))]", pulse: true };
}
