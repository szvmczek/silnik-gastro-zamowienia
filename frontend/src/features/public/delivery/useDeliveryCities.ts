import { useQuery } from "@tanstack/react-query";
import { fetchDeliveryCities } from "@/features/public/checkout/api";

/** Podpowiedzi do datalisty miast — te same na checkoucie i na menu. */
export function useDeliveryCities(enabled: boolean) {
  return useQuery({
    queryKey: ["public", "delivery-cities"],
    queryFn: fetchDeliveryCities,
    staleTime: 5 * 60_000,
    enabled,
  });
}
