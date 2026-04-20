import { apiClient } from "@/shared/api/client";

// ---- Public types ----

export interface PublicAddonDto {
  id: number;
  name: string;
  price: string;
  displayOrder: number;
}

export interface PublicAddonGroupDto {
  id: number;
  name: string;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  displayOrder: number;
  addons: PublicAddonDto[];
}

export interface PublicVariantDto {
  id: number;
  name: string;
  price: string;
  displayOrder: number;
}

export interface PublicProductDto {
  id: number;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: string | null;
  imageUrl: string | null;
  displayOrder: number;
  available: boolean;
  variants: PublicVariantDto[];
  addonGroups: PublicAddonGroupDto[];
}

export interface PublicCategoryDto {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  displayOrder: number;
  active: boolean;
  products: PublicProductDto[];
}

export interface PublicMenuDto {
  categories: PublicCategoryDto[];
}

export async function fetchPublicMenu(): Promise<PublicMenuDto> {
  const { data } = await apiClient.get<PublicMenuDto>("/public/menu");
  return data;
}

export async function fetchPublicProductBySlug(slug: string): Promise<PublicProductDto> {
  const { data } = await apiClient.get<PublicProductDto>(`/public/products/${slug}`);
  return data;
}

// ---- Admin category ----

export interface AdminCategoryDto {
  id: number;
  version: number;
  slug: string;
  name: string;
  description: string | null;
  displayOrder: number;
  active: boolean;
  productsCount: number;
}

export interface CreateCategoryPayload {
  name: string;
  description?: string | null;
  displayOrder: number;
  active: boolean;
}

export interface UpdateCategoryPayload {
  version: number;
  name: string;
  description?: string | null;
  displayOrder: number;
  active: boolean;
}

export async function fetchAdminCategories(): Promise<AdminCategoryDto[]> {
  const { data } = await apiClient.get<AdminCategoryDto[]>("/admin/categories");
  return data;
}

export async function createAdminCategory(payload: CreateCategoryPayload): Promise<AdminCategoryDto> {
  const { data } = await apiClient.post<AdminCategoryDto>("/admin/categories", payload);
  return data;
}

export async function updateAdminCategory(id: number, payload: UpdateCategoryPayload): Promise<AdminCategoryDto> {
  const { data } = await apiClient.put<AdminCategoryDto>(`/admin/categories/${id}`, payload);
  return data;
}

export async function deleteAdminCategory(id: number): Promise<void> {
  await apiClient.delete(`/admin/categories/${id}`);
}

// ---- Admin product ----

export interface AdminProductDto {
  id: number;
  version: number;
  categoryId: number;
  categorySlug: string;
  categoryName: string;
  slug: string;
  name: string;
  description: string | null;
  basePrice: string | null;
  imageUrl: string | null;
  displayOrder: number;
  available: boolean;
  variantsCount: number;
  addonGroupsCount: number;
}

export interface CreateProductPayload {
  categoryId: number;
  name: string;
  description?: string | null;
  basePrice?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  available: boolean;
}

export interface UpdateProductPayload {
  version: number;
  categoryId: number;
  name: string;
  description?: string | null;
  basePrice?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  available: boolean;
}

export interface AdminProductsFilter {
  categoryId?: number;
  available?: boolean;
  page?: number;
  size?: number;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function fetchAdminProducts(
  filter: AdminProductsFilter = {}
): Promise<PageResponse<AdminProductDto>> {
  const params: Record<string, string> = {};
  if (filter.categoryId !== undefined) params.categoryId = String(filter.categoryId);
  if (filter.available !== undefined) params.available = String(filter.available);
  if (filter.page !== undefined) params.page = String(filter.page);
  if (filter.size !== undefined) params.size = String(filter.size);
  const { data } = await apiClient.get<PageResponse<AdminProductDto>>("/admin/products", { params });
  return data;
}

export async function fetchAdminProduct(id: number): Promise<AdminProductDto> {
  const { data } = await apiClient.get<AdminProductDto>(`/admin/products/${id}`);
  return data;
}

export async function createAdminProduct(payload: CreateProductPayload): Promise<AdminProductDto> {
  const { data } = await apiClient.post<AdminProductDto>("/admin/products", payload);
  return data;
}

export async function updateAdminProduct(id: number, payload: UpdateProductPayload): Promise<AdminProductDto> {
  const { data } = await apiClient.put<AdminProductDto>(`/admin/products/${id}`, payload);
  return data;
}

export async function deleteAdminProduct(id: number): Promise<void> {
  await apiClient.delete(`/admin/products/${id}`);
}

export async function patchAdminProductAvailability(
  id: number,
  available: boolean
): Promise<AdminProductDto> {
  const { data } = await apiClient.patch<AdminProductDto>(`/admin/products/${id}/availability`, {
    available,
  });
  return data;
}

// ---- Admin variant ----

export interface AdminVariantDto {
  id: number;
  version: number;
  productId: number;
  name: string;
  price: string;
  displayOrder: number;
}

export interface CreateVariantPayload {
  name: string;
  price: string;
  displayOrder: number;
}

export interface UpdateVariantPayload {
  version: number;
  name: string;
  price: string;
  displayOrder: number;
}

export async function fetchAdminVariants(productId: number): Promise<AdminVariantDto[]> {
  const { data } = await apiClient.get<AdminVariantDto[]>(`/admin/products/${productId}/variants`);
  return data;
}

export async function createAdminVariant(
  productId: number,
  payload: CreateVariantPayload
): Promise<AdminVariantDto> {
  const { data } = await apiClient.post<AdminVariantDto>(
    `/admin/products/${productId}/variants`,
    payload
  );
  return data;
}

export async function updateAdminVariant(
  id: number,
  payload: UpdateVariantPayload
): Promise<AdminVariantDto> {
  const { data } = await apiClient.put<AdminVariantDto>(`/admin/variants/${id}`, payload);
  return data;
}

export async function deleteAdminVariant(id: number): Promise<void> {
  await apiClient.delete(`/admin/variants/${id}`);
}

// ---- Admin addon group + addon ----

export interface AdminAddonDto {
  id: number;
  version: number;
  addonGroupId: number;
  name: string;
  price: string;
  displayOrder: number;
}

export interface AdminAddonGroupDto {
  id: number;
  version: number;
  name: string;
  minSelect: number;
  maxSelect: number;
  required: boolean;
  usedByProducts: number;
  addons: AdminAddonDto[];
}

export interface CreateAddonGroupPayload {
  name: string;
  minSelect: number;
  maxSelect: number;
  required: boolean;
}

export interface UpdateAddonGroupPayload {
  version: number;
  name: string;
  minSelect: number;
  maxSelect: number;
  required: boolean;
}

export interface CreateAddonPayload {
  name: string;
  price: string;
  displayOrder: number;
}

export interface UpdateAddonPayload {
  version: number;
  name: string;
  price: string;
  displayOrder: number;
}

export async function fetchAdminAddonGroups(): Promise<AdminAddonGroupDto[]> {
  const { data } = await apiClient.get<AdminAddonGroupDto[]>("/admin/addon-groups");
  return data;
}

export async function fetchAdminAddonGroup(id: number): Promise<AdminAddonGroupDto> {
  const { data } = await apiClient.get<AdminAddonGroupDto>(`/admin/addon-groups/${id}`);
  return data;
}

export async function createAdminAddonGroup(
  payload: CreateAddonGroupPayload
): Promise<AdminAddonGroupDto> {
  const { data } = await apiClient.post<AdminAddonGroupDto>("/admin/addon-groups", payload);
  return data;
}

export async function updateAdminAddonGroup(
  id: number,
  payload: UpdateAddonGroupPayload
): Promise<AdminAddonGroupDto> {
  const { data } = await apiClient.put<AdminAddonGroupDto>(`/admin/addon-groups/${id}`, payload);
  return data;
}

export async function deleteAdminAddonGroup(id: number): Promise<void> {
  await apiClient.delete(`/admin/addon-groups/${id}`);
}

export async function createAdminAddon(
  addonGroupId: number,
  payload: CreateAddonPayload
): Promise<AdminAddonDto> {
  const { data } = await apiClient.post<AdminAddonDto>(
    `/admin/addon-groups/${addonGroupId}/addons`,
    payload
  );
  return data;
}

export async function updateAdminAddon(
  id: number,
  payload: UpdateAddonPayload
): Promise<AdminAddonDto> {
  const { data } = await apiClient.put<AdminAddonDto>(`/admin/addons/${id}`, payload);
  return data;
}

export async function deleteAdminAddon(id: number): Promise<void> {
  await apiClient.delete(`/admin/addons/${id}`);
}

// ---- Product ↔ addon group link ----

export interface ProductAddonGroupLinkDto {
  id: number;
  productId: number;
  addonGroupId: number;
  addonGroupName: string;
  displayOrder: number;
}

export interface AttachAddonGroupPayload {
  addonGroupId: number;
  displayOrder: number;
}

export async function fetchProductAddonGroupLinks(
  productId: number
): Promise<ProductAddonGroupLinkDto[]> {
  const { data } = await apiClient.get<ProductAddonGroupLinkDto[]>(
    `/admin/products/${productId}/addon-groups`
  );
  return data;
}

export async function attachAddonGroupToProduct(
  productId: number,
  payload: AttachAddonGroupPayload
): Promise<ProductAddonGroupLinkDto> {
  const { data } = await apiClient.post<ProductAddonGroupLinkDto>(
    `/admin/products/${productId}/addon-groups`,
    payload
  );
  return data;
}

export async function detachAddonGroupFromProduct(
  productId: number,
  addonGroupId: number
): Promise<void> {
  await apiClient.delete(`/admin/products/${productId}/addon-groups/${addonGroupId}`);
}
