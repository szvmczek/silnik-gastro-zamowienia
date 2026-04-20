import { useQuery } from "@tanstack/react-query";
import { fetchPublicMenu, fetchPublicProductBySlug } from "@/shared/api/menuApi";

export function usePublicMenu() {
  return useQuery({
    queryKey: ["public", "menu"],
    queryFn: fetchPublicMenu,
    staleTime: 60_000,
  });
}

export function usePublicProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["public", "product", slug],
    queryFn: () => fetchPublicProductBySlug(slug as string),
    enabled: Boolean(slug),
    staleTime: 60_000,
  });
}
