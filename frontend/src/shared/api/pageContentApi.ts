import { apiClient } from "@/shared/api/client";

export type SectionKey = "HERO" | "ABOUT";

export interface PageContentDto {
  sectionKey: SectionKey;
  title: string;
  body: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  active: boolean;
  updatedAt: string;
}

export interface UpdatePageContentPayload {
  title: string;
  body: string;
  imageUrl?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  active: boolean;
}

export type PageContentMap = Record<SectionKey, PageContentDto>;

export async function fetchPublicPageContent(): Promise<PageContentMap> {
  const { data } = await apiClient.get<PageContentMap>("/public/page-content");
  return data;
}

export async function fetchAdminPageContent(section: SectionKey): Promise<PageContentDto> {
  const { data } = await apiClient.get<PageContentDto>(
    `/admin/page-content/${section.toLowerCase()}`
  );
  return data;
}

export async function updateAdminPageContent(
  section: SectionKey,
  payload: UpdatePageContentPayload
): Promise<PageContentDto> {
  const { data } = await apiClient.put<PageContentDto>(
    `/admin/page-content/${section.toLowerCase()}`,
    payload
  );
  return data;
}
