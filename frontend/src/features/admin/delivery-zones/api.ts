import { apiClient } from "@/shared/api/client";
import type {
  CreateAreaRequest,
  CreateDeliveryZoneRequest,
  DeliveryZoneAreaDto,
  DeliveryZoneDto,
  UpdateDeliveryZoneRequest,
} from "./types";

const BASE = "/admin/delivery-zones";

export async function fetchZones(): Promise<DeliveryZoneDto[]> {
  const { data } = await apiClient.get<DeliveryZoneDto[]>(BASE);
  return data;
}

export async function createZone(req: CreateDeliveryZoneRequest): Promise<DeliveryZoneDto> {
  const { data } = await apiClient.post<DeliveryZoneDto>(BASE, req);
  return data;
}

export async function updateZone(
  id: number,
  req: UpdateDeliveryZoneRequest,
): Promise<DeliveryZoneDto> {
  const { data } = await apiClient.patch<DeliveryZoneDto>(`${BASE}/${id}`, req);
  return data;
}

export async function deleteZone(id: number): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function addArea(zoneId: number, req: CreateAreaRequest): Promise<DeliveryZoneAreaDto> {
  const { data } = await apiClient.post<DeliveryZoneAreaDto>(`${BASE}/${zoneId}/areas`, req);
  return data;
}

export async function deleteArea(zoneId: number, areaId: number): Promise<void> {
  await apiClient.delete(`${BASE}/${zoneId}/areas/${areaId}`);
}
