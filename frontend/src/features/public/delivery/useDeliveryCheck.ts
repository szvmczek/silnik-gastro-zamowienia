import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { checkDelivery, type DeliveryCheckResponse } from "@/features/public/checkout/api";

const POSTAL_REGEX = /^\d{2}-\d{3}$/;

export function useDeliveryCheck(
  city: string,
  postalCode: string,
  enabled: boolean,
): { data: DeliveryCheckResponse | undefined; isFetching: boolean } {
  const [debounced, setDebounced] = useState({ city: "", postalCode: "" });

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced({ city: city.trim(), postalCode: postalCode.trim() });
    }, 300);
    return () => clearTimeout(t);
  }, [city, postalCode]);

  const ready =
    enabled &&
    debounced.city.length > 0 &&
    POSTAL_REGEX.test(debounced.postalCode);

  const query = useQuery({
    queryKey: ["public", "delivery-check", debounced.city, debounced.postalCode],
    queryFn: () => checkDelivery(debounced.city, debounced.postalCode),
    enabled: ready,
    staleTime: 30_000,
  });

  return { data: ready ? query.data : undefined, isFetching: query.isFetching };
}
