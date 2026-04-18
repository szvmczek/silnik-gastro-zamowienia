import { fetchPublicSettings } from "@/shared/api/settingsApi";

const HEX_RE = /^#([0-9a-fA-F]{6})$/;

export function hexToRgbChannels(hex: string): string | null {
  const match = hex.match(HEX_RE);
  if (!match) return null;
  const value = match[1];
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export function applyPrimaryColor(hex: string): void {
  const channels = hexToRgbChannels(hex);
  if (!channels) return;
  document.documentElement.style.setProperty("--color-primary", channels);
}

export async function loadTheme(): Promise<void> {
  try {
    const settings = await fetchPublicSettings();
    applyPrimaryColor(settings.primaryColor);
  } catch {
    // keep default from index.css
  }
}
