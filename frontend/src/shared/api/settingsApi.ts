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
  // Warstwa 5 M-035 — AD-Δ19 extended fields per bundle Stage 4 section-general.jsx.
  seoDescription: string | null;
  googleMapsUrl: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  updatedAt: string;
  // Warstwa 5 M-039 — AD-Δ25 operations fields. Backend NOT NULL (V204
  // defaults 30 / 0). Aktywuje InfoBar / Cart / KitchenPage / OperationsSection.
  defaultPreparationMinutes: number;
  minOrderAmount: number;
  // Manual close — null gdy restauracja nie jest ręcznie zamknięta.
  manualClosedReason: string | null;
  manualClosedUntil: string | null;
  // Faza 5 M1 — pola wciąż nie w backendzie (nie w bundle Operations).
  // Konsumenci robią graceful fallback. Patrz PHASE5_FINDINGS.
  freeDeliveryFrom?: number | null;
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
  seoDescription?: string | null;
  googleMapsUrl?: string | null;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  defaultPreparationMinutes: number;
  minOrderAmount: number;
  manualClosedReason?: string | null;
  manualClosedUntil?: string | null;
}

// Settings PUT is a full-object replace consumed by multiple section forms
// (General M-035 / Operations M-039). Each form spreads this base over the
// loaded DTO, then overrides only its own fields — preserving the rest.
export function settingsToPayload(s: SettingsDto): UpdateSettingsPayload {
  return {
    name: s.name,
    tagline: s.tagline,
    primaryColor: s.primaryColor,
    phone: s.phone,
    email: s.email,
    addressLine: s.addressLine,
    city: s.city,
    postalCode: s.postalCode,
    logoUrl: s.logoUrl,
    currency: s.currency,
    seoDescription: s.seoDescription,
    googleMapsUrl: s.googleMapsUrl,
    socialFacebook: s.socialFacebook,
    socialInstagram: s.socialInstagram,
    defaultPreparationMinutes: s.defaultPreparationMinutes,
    minOrderAmount: s.minOrderAmount,
    manualClosedReason: s.manualClosedReason,
    manualClosedUntil: s.manualClosedUntil,
  };
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
