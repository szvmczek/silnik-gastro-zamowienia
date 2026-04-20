import { apiClient } from "@/shared/api/client";

// ---- Enums (mirror backend) ----

export type FulfillmentType = "DELIVERY" | "PICKUP";
export type PaymentMethod = "CASH_ON_DELIVERY" | "CASH_ON_PICKUP";
export type OrderStatus =
  | "NEW"
  | "CONFIRMED"
  | "IN_PREPARATION"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELED";

// ---- Place order ----

export interface AddressRequest {
  street: string;
  buildingNumber: string;
  apartmentNumber?: string | null;
  postalCode: string;
  city: string;
  notes?: string | null;
}

export interface CreateOrderItemRequest {
  productId: number;
  variantId?: number | null;
  addonIds?: number[];
  quantity: number;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  deliveryAddress?: AddressRequest | null;
  customerNotes?: string | null;
  items: CreateOrderItemRequest[];
}

export interface OrderConfirmationDto {
  orderNumber: string;
  trackingToken: string;
  total: string;
}

export async function placeOrder(payload: CreateOrderRequest): Promise<OrderConfirmationDto> {
  const { data } = await apiClient.post<OrderConfirmationDto>("/public/orders", payload);
  return data;
}

// ---- Tracking ----

export interface OrderTrackingAddonDto {
  groupName: string;
  name: string;
  unitPrice: string;
}

export interface OrderTrackingItemDto {
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  addons: OrderTrackingAddonDto[];
}

export interface OrderTrackingAddressDto {
  street: string;
  buildingNumber: string;
  apartmentNumber: string | null;
  postalCode: string;
  city: string;
  notes: string | null;
}

export interface OrderTrackingDto {
  orderNumber: string;
  status: OrderStatus;
  etaMinutes: number | null;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  placedAt: string;
  deliveryAddress: OrderTrackingAddressDto | null;
  items: OrderTrackingItemDto[];
  subtotal: string;
  total: string;
}

export async function fetchOrderByToken(token: string): Promise<OrderTrackingDto> {
  const { data } = await apiClient.get<OrderTrackingDto>(`/public/orders/track/${token}`);
  return data;
}
