import { fetchPublicSettings } from "@/shared/api/settingsApi";

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

/** Ciemny atrament z paczki — tekst na jasnym akcencie. */
const INK_ON_LIGHT = "#1A1109";
/** Kremowy z paczki — tekst na ciemnym akcencie. */
const INK_ON_DARK = "#F3E9DC";

export function hexToRgbChannels(hex: string): string | null {
  const match = hex.match(HEX_RE);
  if (!match) return null;
  const value = match[1];
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Relatywna luminancja wg WCAG 2.x. Używamy jej tylko do wyboru koloru
 * tekstu NA akcencie — design v3 maluje przyciski i pigułki kolorem
 * z ustawień, więc dla ciemnego akcentu ciemny napis z paczki (#1A1109)
 * byłby nieczytelny.
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (raw: number) => {
    const c = raw / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: number, b: number): number {
  const [hi, lo] = a >= b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Zwraca ten z dwóch atramentów paczki, który daje wyższy kontrast na
 * podanym akcencie. Wybór przez porównanie, nie przez próg luminancji —
 * próg wywraca się na kolorach ze środka skali (np. szarość #808080).
 * Dla bursztynu z seeda (#E9A13B) wychodzi ciemny atrament, czyli 1:1
 * z paczką.
 */
export function readableInkOn(hex: string): string {
  const channels = hexToRgbChannels(hex);
  if (!channels) return INK_ON_LIGHT;
  const [r, g, b] = channels.split(" ").map(Number);
  const accent = relativeLuminance(r, g, b);

  const dark = hexToRgbChannels(INK_ON_LIGHT)!.split(" ").map(Number);
  const light = hexToRgbChannels(INK_ON_DARK)!.split(" ").map(Number);
  const onDarkInk = contrastRatio(accent, relativeLuminance(dark[0], dark[1], dark[2]));
  const onLightInk = contrastRatio(accent, relativeLuminance(light[0], light[1], light[2]));

  return onDarkInk >= onLightInk ? INK_ON_LIGHT : INK_ON_DARK;
}

export function applyPrimaryColor(hex: string): void {
  const channels = hexToRgbChannels(hex);
  if (!channels) return;
  const root = document.documentElement;
  root.style.setProperty("--color-primary", channels);
  root.style.setProperty("--color-on-primary", readableInkOn(hex));
}

export async function loadTheme(): Promise<void> {
  try {
    const settings = await fetchPublicSettings();
    applyPrimaryColor(settings.primaryColor);
  } catch {
    // keep default from index.css
  }
}
