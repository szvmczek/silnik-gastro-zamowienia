import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { getSoundEnabled, setSoundEnabled, playBeep } from "./soundPrefs";

export function SoundToggle() {
  const [enabled, setEnabled] = useState<boolean>(() => getSoundEnabled());

  const toggle = () => {
    const next = !enabled;
    setSoundEnabled(next);
    setEnabled(next);
    if (next) {
      // Fire a quick beep to (a) prime AudioContext under user gesture,
      // (b) confirm sound works.
      playBeep();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? "Wyłącz dźwięk powiadomień" : "Włącz dźwięk powiadomień"}
      title={enabled ? "Dźwięk: włączony" : "Dźwięk: wyłączony"}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
