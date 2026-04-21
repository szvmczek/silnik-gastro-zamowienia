import { useQuery } from "@tanstack/react-query";

export interface GeocodeResult {
  lat: number;
  lon: number;
}

interface NominatimResponse {
  lat: string;
  lon: string;
}

async function geocode(address: string): Promise<GeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as NominatimResponse[];
  if (!Array.isArray(data) || data.length === 0) return null;
  const lat = Number.parseFloat(data[0].lat);
  const lon = Number.parseFloat(data[0].lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}

export function useAddressGeocode(address: string | null | undefined) {
  return useQuery<GeocodeResult | null>({
    queryKey: ["geocode", address],
    queryFn: () => geocode(address!),
    enabled: !!address && address.trim().length > 0,
    staleTime: Infinity,
    gcTime: 24 * 60 * 60 * 1000,
    retry: false,
  });
}
