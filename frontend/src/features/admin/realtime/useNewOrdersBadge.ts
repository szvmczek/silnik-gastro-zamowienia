import { useQueries } from "@tanstack/react-query";
import { fetchAdminOrders, type AdminOrdersQuery } from "@/shared/api/orderApi";

// Te same kształty zapytań co `NEW_QUERY` / `CONFIRMED_QUERY` w KitchenPage —
// identyczne queryKey znaczą, że TanStack dzieli wpisy cache między layout
// i Kuchnię. Na Kuchni hook nie kosztuje więc ani jednego requestu.
const NEW_QUERY: AdminOrdersQuery = { status: "NEW", size: 100 };
const CONFIRMED_QUERY: AdminOrdersQuery = { status: "CONFIRMED", size: 100 };

export interface NewOrdersBadge {
  /** Zamówienia, których kuchnia jeszcze nie wzięła na warsztat. */
  pendingCount: number;
}

/**
 * Licznik zamówień czekających na kuchnię dla nawigacji panelu.
 *
 * Badge świeci, dopóki zamówienie nie przejdzie do IN_PREPARATION — czyli do
 * kliknięcia „Rozpocznij przygotowanie". Samo otwarcie szczegółów niczego nie
 * gasi: liczy się realne wzięcie zamówienia do roboty, nie zerknięcie na nie.
 *
 * Dzięki temu licznik jest czystym odczytem z serwera — zero stanu po stronie
 * klienta, zero localStorage, więc i zero ryzyka rozjechania się z prawdą.
 * Odświeżanie niesie istniejące unieważnienie `["admin","orders","list"]`
 * z `useAdminOrderFeed` (AD-005), więc zmiana statusu z dowolnego ekranu (albo
 * z innego stanowiska, przez SSE) gasi badge natychmiast. 15 s poll zostaje
 * jako siatka bezpieczeństwa przy zerwanym strumieniu.
 */
export function useNewOrdersBadge(): NewOrdersBadge {
  const results = useQueries({
    queries: [
      {
        queryKey: ["admin", "orders", "list", NEW_QUERY] as const,
        queryFn: () => fetchAdminOrders(NEW_QUERY),
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
      },
      {
        queryKey: ["admin", "orders", "list", CONFIRMED_QUERY] as const,
        queryFn: () => fetchAdminOrders(CONFIRMED_QUERY),
        refetchInterval: 15_000,
        refetchIntervalInBackground: false,
      },
    ],
  });

  const pendingCount = results.reduce(
    (sum, result) => sum + (result.data?.content.length ?? 0),
    0,
  );

  return { pendingCount };
}
