import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
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
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={enabled ? "Wyłącz dźwięk powiadomień" : "Włącz dźwięk powiadomień"}
      title={enabled ? "Dźwięk: włączony" : "Dźwięk: wyłączony"}
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
}
