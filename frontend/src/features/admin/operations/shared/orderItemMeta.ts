import type { OrderTrackingItemDto } from "@/shared/api/orderApi";

/**
 * Odpowiednik `cartLineMeta` (koszyk klienta) dla pozycji zamówienia z API.
 * Grupuje dodatki po `groupName` ze snapshotu, żeby „Sos do brzegów" nie
 * zlewał się z „Dodatki" — kuchnia musi widzieć DOKŁADNIE to, co klient
 * wyklikał, a nie samą nazwę produktu.
 *
 * Wariant NIE wchodzi do wyniku — karty operacyjne renderują go osobno
 * przy nazwie produktu.
 */
export function orderItemAddonLines(item: OrderTrackingItemDto): string[] {
  const byGroup = new Map<string, string[]>();
  for (const addon of item.addons) {
    const list = byGroup.get(addon.groupName) ?? [];
    list.push(addon.name.toLowerCase());
    byGroup.set(addon.groupName, list);
  }
  return [...byGroup].map(([groupName, names]) => `${groupName}: ${names.join(", ")}`);
}

/** Jednolinijkowy opis pozycji — ilość, produkt, wariant, dodatki. */
export function orderItemBrief(item: OrderTrackingItemDto): string {
  const head = `${item.quantity}× ${item.productName}${item.variantName ? ` ${item.variantName}` : ""}`;
  const addons = orderItemAddonLines(item);
  return addons.length > 0 ? `${head} (${addons.join("; ")})` : head;
}
