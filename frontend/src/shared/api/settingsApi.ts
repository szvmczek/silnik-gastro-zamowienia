import { apiClient } from "@/shared/api/client";

export interface SettingsDto {
  id: number;
  name: string;
  tagline: string | null;
  primaryColor: string;
  phone: string | null;
  email: string | null;
  addressLine: string | null;
  city: string | null;
  postalCode: string | null;
  logoUrl: string | null;
  currency: string;
  updatedAt: string;
  // Faza 5 M1 backend delta — pola opcjonalne, dopiero pojawią się gdy backend
  // zostanie zmigrowany (RestaurantSettings + DTO + endpoint). Konsumenci
  // (InfoBar M-014, FreeDeliveryProgress M-015, CartSidebar M-021,
  // CartBottomSheet M-022) robią graceful fallback: gdy pole == null/undefined
  // → moduł / sekcja się nie renderuje. Patrz docs/PHASES.md §Faza 5 → M1.
  minOrderAmount?: number | null;
  freeDeliveryFrom?: number | null;
  defaultPreparationMinutes?: number | null;
  deliveryFee?: number | null;
}

export interface UpdateSettingsPayload {
  name: string;
  tagline?: string | null;
  primaryColor: string;
  phone?: string | null;
  email?: string | null;
  addressLine?: string | null;
  city?: string | null;
  postalCode?: string | null;
  logoUrl?: string | null;
  currency: string;
}

export async function fetchPublicSettings(): Promise<SettingsDto> {
  const { data } = await apiClient.get<SettingsDto>("/public/settings");
  return data;
}

export async function fetchAdminSettings(): Promise<SettingsDto> {
  const { data } = await apiClient.get<SettingsDto>("/admin/settings");
  return data;
}

export async function updateAdminSettings(payload: UpdateSettingsPayload): Promise<SettingsDto> {
  const { data } = await apiClient.put<SettingsDto>("/admin/settings", payload);
  return data;
}
