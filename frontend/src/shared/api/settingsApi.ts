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
