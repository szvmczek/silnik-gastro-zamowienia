import { apiClient } from "@/shared/api/client";

// RODO documents (M-046). Dedicated endpoints — privacy/terms text is kept
// off the 60s-polled /public/settings.

export interface LegalContent {
  privacyPolicy: string | null;
  termsOfService: string | null;
}

export async function fetchPublicLegal(): Promise<LegalContent> {
  const { data } = await apiClient.get<LegalContent>("/public/legal");
  return data;
}

export async function fetchAdminLegal(): Promise<LegalContent> {
  const { data } = await apiClient.get<LegalContent>("/admin/legal");
  return data;
}

export async function updateAdminLegal(payload: LegalContent): Promise<LegalContent> {
  const { data } = await apiClient.put<LegalContent>("/admin/legal", payload);
  return data;
}
