import type { CartItem } from "./cartStore";

/**
 * Opis konfiguracji pozycji w formacie z paczki — rozmiar w osobnej linii,
 * dodatki pogrupowane po nazwie grupy: „Dodatki: boczek, ser".
 *
 * Grupowanie po CartAddon.groupName, które store trzyma od początku —
 * dzięki temu „Sos do brzegów" i „Dodatki" nie zlewają się w jedną listę.
 */
export function cartLineMeta(item: CartItem): string[] {
  const lines: string[] = [];
  if (item.variantName) lines.push(item.variantName);

  const byGroup = new Map<string, string[]>();
  for (const addon of item.addons) {
    const list = byGroup.get(addon.groupName) ?? [];
    list.push(addon.name.toLowerCase());
    byGroup.set(addon.groupName, list);
  }
  for (const [groupName, names] of byGroup) {
    lines.push(`${groupName}: ${names.join(", ")}`);
  }
  return lines;
}
