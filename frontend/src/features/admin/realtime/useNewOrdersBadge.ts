import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders, type AdminOrdersQuery } from "@/shared/api/orderApi";
import { useNewOrdersStore } from "./newOrdersStore";

// Ten sam kształt zapytania co `NEW_QUERY` w KitchenPage — identyczny queryKey
// znaczy, że TanStack dzieli jeden cache wpis między layout i Kuchnię. Na
// Kuchni hook nie kosztuje więc ani jednego dodatkowego requestu.
const NEW_QUERY: AdminOrdersQuery = { status: "NEW", size: 100 };

export interface NewOrdersBadge {
  /** Nowe zamówienia, których admin jeszcze nie otworzył. */
  unseenCount: number;
}

/**
 * Licznik nowych zamówień dla nawigacji panelu. Odświeżany przez to samo
 * unieważnienie `["admin","orders","list"]`, które robi już `useAdminOrderFeed`
 * na zdarzeniu SSE (AD-005) — plus 15 s poll jako siatka bezpieczeństwa, gdy
 * strumień jest zerwany. Zero nowego plumbingu danych.
 */
export function useNewOrdersBadge(): NewOrdersBadge {
  const { data } = useQuery({
    queryKey: ["admin", "orders", "list", NEW_QUERY] as const,
    queryFn: () => fetchAdminOrders(NEW_QUERY),
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });

  const seenOrderIds = useNewOrdersStore((s) => s.seenOrderIds);

  const newIds = useMemo(() => (data?.content ?? []).map((o) => o.id), [data]);

  const unseenCount = useMemo(
    () => newIds.filter((id) => !seenOrderIds.includes(id)).length,
    [newIds, seenOrderIds],
  );

  return { unseenCount };
}
