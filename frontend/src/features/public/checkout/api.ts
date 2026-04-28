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
