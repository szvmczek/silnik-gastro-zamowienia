/* Category emoji mapping per slug — F-001 retrofit Warstwa 3a fix-up.
   Backend `PublicCategoryDto` nie wystawia emoji/icon. Bundle Stage 2
   (CategoryChips, MenuPage heading, UpsellSection rows) renderuje emoji
   per kategoria. Mapping hardcoded po stronie frontu — łatwo zastąpić
   backend field gdy się pojawi.

   Slugi łączone (np. "frytki-dodatki", "piwo-napoje") rozcinamy po
   `-` lub `_`, wygrywa pierwsze trafienie. Unknown slug → 🍽️. */

const EMOJI_MAP: Record<string, string> = {
  pizza: "🍕",
  pizze: "🍕",
  salatka: "🥗",
  salatki: "🥗",
  sałatka: "🥗",
  sałatki: "🥗",
  napoj: "🥤",
  napoje: "🥤",
  deser: "🍰",
  desery: "🍰",
  przystawka: "🥖",
  przystawki: "🥖",
  kebab: "🥙",
  makaron: "🍝",
  makarony: "🍝",
  burger: "🍔",
  burgery: "🍔",
  zupa: "🍲",
  zupy: "🍲",
  danie: "🍽️",
  dania: "🍽️",
  kurczak: "🍗",
  kurczaki: "🍗",
  zapiekanka: "🥪",
  zapiekanki: "🥪",
  piwo: "🍺",
  frytki: "🍟",
  dodatki: "🍟",
};

const FALLBACK_EMOJI = "🍽️";

export function getCategoryEmoji(slug: string | null | undefined): string {
  if (!slug) return FALLBACK_EMOJI;
  const normalized = slug.toLowerCase().trim();
  if (EMOJI_MAP[normalized]) return EMOJI_MAP[normalized];
  const parts = normalized.split(/[-_]/);
  for (const part of parts) {
    if (EMOJI_MAP[part]) return EMOJI_MAP[part];
  }
  return FALLBACK_EMOJI;
}
