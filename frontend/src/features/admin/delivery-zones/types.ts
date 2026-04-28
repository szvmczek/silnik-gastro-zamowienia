export type DeliveryZoneType = "FREE" | "PAID" | "UNAVAILABLE";

export interface DeliveryZoneAreaDto {
  id: number;
  city: string;
  postalCode: string | null;
}

export interface DeliveryZoneDto {
  id: number;
  name: string;
  type: DeliveryZoneType;
  deliveryFee: number;
  active: boolean;
  displayOrder: number;
  areas: DeliveryZoneAreaDto[];
}

export interface CreateDeliveryZoneRequest {
  name: string;
  type: DeliveryZoneType;
  deliveryFee: number;
  active?: boolean;
}

export interface UpdateDeliveryZoneRequest {
  name?: string;
  type?: DeliveryZoneType;
  deliveryFee?: number;
  active?: boolean;
}

export interface CreateAreaRequest {
  city: string;
  postalCode: string | null;
}
