import { apiClient } from "@/shared/api/client";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface OpeningHoursDto {
  dayOfWeek: DayOfWeek;
  closed: boolean;
  openTime: string | null;
  closeTime: string | null;
}

export interface UpdateOpeningHoursPayload {
  days: OpeningHoursDto[];
}

export async function fetchPublicOpeningHours(): Promise<OpeningHoursDto[]> {
  const { data } = await apiClient.get<OpeningHoursDto[]>("/public/opening-hours");
  return data;
}

export async function fetchAdminOpeningHours(): Promise<OpeningHoursDto[]> {
  const { data } = await apiClient.get<OpeningHoursDto[]>("/admin/opening-hours");
  return data;
}

export async function updateAdminOpeningHours(
  payload: UpdateOpeningHoursPayload
): Promise<OpeningHoursDto[]> {
  const { data } = await apiClient.put<OpeningHoursDto[]>("/admin/opening-hours", payload);
  return data;
}
