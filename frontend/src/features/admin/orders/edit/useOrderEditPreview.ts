import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { previewOrderEdit, type EditOrderPayload, type OrderEditPreviewDto } from "@/shared/api/orderApi";

const DEBOUNCE_MS = 300;

/**
 * Podgląd ceny na żywo. Cena leci z serwera przy każdej zmianie w edytorze
 * (CLAUDE.md §5 — front nigdy nie liczy kwot sam), z debounce'em, żeby
 * przytrzymany „+" przy ilości nie wystrzelił dziesięciu żądań.
 *
 * Poprzedni wynik zostaje na ekranie w trakcie przeliczania
 * (`placeholderData`), więc suma nie mruga na pusto przy każdym kliknięciu.
 */
export function useOrderEditPreview(orderId: number, payload: EditOrderPayload) {
  const serialized = JSON.stringify(payload);
  const [debounced, setDebounced] = useState(serialized);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(serialized), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [serialized]);

  return useQuery<OrderEditPreviewDto>({
    queryKey: ["admin", "orders", "edit-preview", orderId, debounced],
    queryFn: () => previewOrderEdit(orderId, JSON.parse(debounced) as EditOrderPayload),
    enabled: payload.items.length > 0,
    placeholderData: (previous) => previous,
    retry: false,
    // Podgląd zależy od aktualnych cen w menu, ale w trakcie jednej sesji
    // edycji nie ma sensu odpytywać go w kółko przy powrocie do karty.
    refetchOnWindowFocus: false,
    staleTime: 30_000,
  });
}
