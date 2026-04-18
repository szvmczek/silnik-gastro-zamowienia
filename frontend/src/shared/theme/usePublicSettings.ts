import { useQuery } from "@tanstack/react-query";
import { fetchPublicSettings, type SettingsDto } from "@/shared/api/settingsApi";

export function usePublicSettings() {
  return useQuery<SettingsDto>({
    queryKey: ["public", "settings"],
    queryFn: fetchPublicSettings,
    staleTime: 60_000,
  });
}
