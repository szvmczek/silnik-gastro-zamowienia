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
  /** D-03: nominał, z którego wydać resztę. null = odliczona kwota. */
  cashChangeFrom?: number | null;
  items: CreateOrderItemRequest[];
}

export interface OrderConfirmationDto {
  orderNumber: string;
  trackingToken: string;
  total: string;
  deliveryFee: string;
  deliveryZoneName: string | null;
  cashChangeFrom: string | null;
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
  etaSetAt: string | null;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  placedAt: string;
  deliveryAddress: OrderTrackingAddressDto | null;
  items: OrderTrackingItemDto[];
  subtotal: string;
  deliveryFee: string;
  deliveryZoneName: string | null;
  total: string;
  /** D-03: null = klient płaci odliczoną kwotą. */
  cashChangeFrom: string | null;
}

export async function fetchOrderByToken(token: string): Promise<OrderTrackingDto> {
  const { data } = await apiClient.get<OrderTrackingDto>(`/public/orders/track/${token}`);
  return data;
}

// ---- Admin ----

export interface SpringPage<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface AdminOrderListItemDto {
  id: number;
  version: number;
  orderNumber: string;
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerPhone: string;
  // AD-022: list returns the operational-card detail shape so Kuchnia/Pickup/
  // Delivery render full cards from a single list query (no per-card detail
  // round-trip). items + items.addons fetched eagerly server-side.
  customerNotes: string | null;
  /** D-03: nominał, z którego wydać resztę. null = odliczona kwota. */
  cashChangeFrom: string | null;
  deliveryAddress: OrderTrackingAddressDto | null;
  items: OrderTrackingItemDto[];
  total: string;
  placedAt: string;
  etaMinutes: number | null;
  etaSetAt: string | null;
  itemsCount: number;
}

export interface AdminOrderStatusHistoryDto {
  status: OrderStatus;
  changedAt: string;
  changedBy: string | null;
  reason: string | null;
}

export interface AdminOrderDto {
  id: number;
  version: number;
  orderNumber: string;
  // AD-Δ13: backend wystawia pole od Warstwy 4 M-033. Frontend Order Detail
  // używa do linka "Otwórz tracker klienta →" do /track/{token}.
  trackingToken: string;
  status: OrderStatus;
  etaMinutes: number | null;
  etaSetAt: string | null;
  fulfillmentType: FulfillmentType;
  paymentMethod: PaymentMethod;
  placedAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  customerNotes: string | null;
  /** D-03: nominał, z którego wydać resztę. null = odliczona kwota. */
  cashChangeFrom: string | null;
  deliveryAddress: OrderTrackingAddressDto | null;
  items: OrderTrackingItemDto[];
  subtotal: string;
  deliveryFee: string;
  deliveryZoneName: string | null;
  total: string;
  statusHistory: AdminOrderStatusHistoryDto[];
}

export interface AdminDashboardSummaryDto {
  newToday: number;
  inPreparation: number;
  awaitingFulfillment: number;
}

export interface AdminDashboardStatsToday {
  orderCount: number;
  totalRevenue: string;
  averageOrderValue: string;
  deliveryCount: number;
  pickupCount: number;
  canceledCount: number;
}

export interface AdminDashboardActiveCounts {
  // Backend uses @JsonProperty("new") to map this through the Java
  // reserved keyword.
  new: number;
  inPreparation: number;
  readyForPickup: number;
  readyForDelivery: number;
  outForDelivery: number;
}

export interface AdminDashboardDailyStats {
  date: string;
  orderCount: number;
  revenue: string;
}

export interface AdminDashboardHourlyStats {
  hour: number;
  orderCount: number;
}

export interface AdminDashboardTopProductStats {
  productName: string;
  totalSold: number;
}

export interface AdminDashboardStatsDto {
  today: AdminDashboardStatsToday;
  activeCounts: AdminDashboardActiveCounts;
  last7Days: AdminDashboardDailyStats[];
  hourlyToday: AdminDashboardHourlyStats[];
  topProducts30Days: AdminDashboardTopProductStats[];
}

export interface AdminOrdersQuery {
  status?: OrderStatus | null;
  fulfillmentType?: FulfillmentType | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  page?: number;
  size?: number;
}

export interface AdminOrderStatusCounts {
  // byStatus carries an entry for every OrderStatus (0 when none) — the
  // backend pads the GROUP BY result server-side.
  byStatus: Record<OrderStatus, number>;
  total: number;
}

export interface UpdateOrderStatusPayload {
  version: number;
  status: OrderStatus;
  // Optional in DTO; required by frontend validation only when status=CANCELED
  // (AD-021). Backend stays liberal — accepts null/missing for any status.
  reason?: string | null;
}

export interface UpdateOrderEtaPayload {
  version: number;
  minutesFromNow: number;
}

export async function fetchAdminOrders(
  query: AdminOrdersQuery = {}
): Promise<SpringPage<AdminOrderListItemDto>> {
  const params: Record<string, string | number> = {};
  if (query.status) params.status = query.status;
  if (query.fulfillmentType) params.fulfillmentType = query.fulfillmentType;
  if (query.dateFrom) params.dateFrom = query.dateFrom;
  if (query.dateTo) params.dateTo = query.dateTo;
  if (query.page !== undefined) params.page = query.page;
  if (query.size !== undefined) params.size = query.size;
  const { data } = await apiClient.get<SpringPage<AdminOrderListItemDto>>("/admin/orders", {
    params,
  });
  return data;
}

export async function fetchAdminOrderCounts(
  query: Pick<AdminOrdersQuery, "fulfillmentType" | "dateFrom" | "dateTo"> = {}
): Promise<AdminOrderStatusCounts> {
  const params: Record<string, string> = {};
  if (query.fulfillmentType) params.fulfillmentType = query.fulfillmentType;
  if (query.dateFrom) params.dateFrom = query.dateFrom;
  if (query.dateTo) params.dateTo = query.dateTo;
  const { data } = await apiClient.get<AdminOrderStatusCounts>("/admin/orders/counts", {
    params,
  });
  return data;
}

export async function fetchAdminOrderById(id: number): Promise<AdminOrderDto> {
  const { data } = await apiClient.get<AdminOrderDto>(`/admin/orders/${id}`);
  return data;
}

export async function updateOrderStatus(
  id: number,
  payload: UpdateOrderStatusPayload
): Promise<AdminOrderDto> {
  const { data } = await apiClient.patch<AdminOrderDto>(`/admin/orders/${id}/status`, payload);
  return data;
}

export async function updateOrderEta(
  id: number,
  payload: UpdateOrderEtaPayload
): Promise<AdminOrderDto> {
  const { data } = await apiClient.patch<AdminOrderDto>(`/admin/orders/${id}/eta`, payload);
  return data;
}

export async function fetchDashboardSummary(): Promise<AdminDashboardSummaryDto> {
  const { data } = await apiClient.get<AdminDashboardSummaryDto>("/admin/dashboard/summary");
  return data;
}

export async function fetchDashboardStats(): Promise<AdminDashboardStatsDto> {
  const { data } = await apiClient.get<AdminDashboardStatsDto>("/admin/dashboard/stats");
  return data;
}
