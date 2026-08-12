import type { OrderTrackingItemDto } from "@/shared/api/orderApi";
import { orderItemNoteLine } from "./orderItemMeta";

/**
 * Notatka klienta do pojedynczej pozycji. Ten sam żółty język wizualny co
 * banner `customerNotes` na kartach operacyjnych — z tego samego powodu:
 * to instrukcja od klienta, której przegapienie kosztuje reklamację.
 * Renderuje się tylko wtedy, gdy notatka istnieje.
 */
export function ItemNoteLine({ item }: { item: OrderTrackingItemDto }) {
  const note = orderItemNoteLine(item);
  if (!note) return null;
  // Element inline-owy (span z display:block), bo część kart renderuje
  // opis pozycji wewnątrz <span> — <div> łamałby tam poprawność HTML.
  return (
    <span
      style={{
        display: "block",
        marginTop: 4,
        padding: "4px 8px",
        background: "#FFF8E1",
        border: "1px solid #FCD34D",
        borderLeft: "3px solid rgb(var(--status-new))",
        borderRadius: 5,
        fontSize: 13,
        fontWeight: 500,
        lineHeight: 1.35,
        color: "#78350F",
      }}
    >
      📝 {note}
    </span>
  );
}
