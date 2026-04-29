import { getSoundEnabled } from "@/features/admin/realtime/soundPrefs";

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx = new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

function playTone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = "sine",
): void {
  const audioCtx = getContext();
  if (!audioCtx) return;

  const start = () => {
    const now = audioCtx.currentTime;
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    oscillator.start(now);
    oscillator.stop(now + durationMs / 1000);
  };

  if (audioCtx.state === "suspended") {
    audioCtx.resume().then(start).catch(() => {});
    return;
  }
  try {
    start();
  } catch {
    // Browser blocked playback (no user gesture yet) — silently no-op.
  }
}

// Three distinct sound profiles per operational view (handoff sec 3).
// Each respects the global SoundToggle.
export function playKitchenSound(): void {
  if (!getSoundEnabled()) return;
  playTone(880, 100);
  setTimeout(() => playTone(880, 100), 150);
}

export function playPickupSound(): void {
  if (!getSoundEnabled()) return;
  playTone(523, 300, "triangle");
}

export function playDeliverySound(): void {
  if (!getSoundEnabled()) return;
  playTone(330, 400, "triangle");
}
