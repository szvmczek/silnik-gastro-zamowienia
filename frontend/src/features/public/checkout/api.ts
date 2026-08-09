import { apiClient } from "@/shared/api/client";

export type DeliveryCheckStatus = "FREE" | "PAID" | "UNAVAILABLE";

export interface DeliveryCheckResponse {
  status: DeliveryCheckStatus;
  fee: number;
  zoneName: string | null;
}

export interface DeliveryCity {
  display: string;
}

export async function checkDelivery(
  city: string,
  postalCode: string,
): Promise<DeliveryCheckResponse> {
  const { data } = await apiClient.post<DeliveryCheckResponse>("/public/delivery/check", {
    city,
    postalCode,
  });
  return data;
}

export async function fetchDeliveryCities(): Promise<DeliveryCity[]> {
  const { data } = await apiClient.get<DeliveryCity[]>("/public/delivery/cities");
  return data;
}

/** Kafle „Dostawa i odbiór" na landingu — D-01: dane realnie ze stref. */
export interface DeliveryZonePublic {
  name: string;
  type: Exclude<DeliveryCheckStatus, "UNAVAILABLE">;
  fee: number;
  cities: string[];
}

export async function fetchDeliveryZones(): Promise<DeliveryZonePublic[]> {
  const { data } = await apiClient.get<DeliveryZonePublic[]>("/public/delivery/zones");
  return data;
}
