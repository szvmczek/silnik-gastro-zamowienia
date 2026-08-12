import type {
  AdminOrderDto,
  AdminOrderItemDto,
  EditOrderItemPayload,
  EditOrderPayload,
} from "@/shared/api/orderApi";
import type { PublicMenuDto, PublicProductDto } from "@/shared/api/menuApi";

/**
 * Roboczy stan pozycji w trybie edycji. Trzyma identyfikatory, bo to one
 * decydują, czy backend zachowa snapshot cenowy (pozycja nietknięta), czy
 * przeliczy linię po aktualnych cenach.
 */
export interface DraftItem {
  /** Klucz Reacta — stabilny przez cały czas edycji, także dla nowych pozycji. */
  key: string;
  orderItemId: number | null;
  productId: number;
  variantId: number | null;
  addonIds: number[];
  quantity: number;
  itemNote: string;
  /** Nazwy ze snapshotu — jedyne, co mamy, gdy produkt zniknął z menu. */
  fallbackName: string;
  fallbackVariantName: string | null;
}

let keySeq = 0;

export function nextDraftKey(): string {
  keySeq += 1;
  return `draft-${keySeq}`;
}

export function toDraft(item: AdminOrderItemDto): DraftItem {
  return {
    key: `item-${item.orderItemId}`,
    orderItemId: item.orderItemId,
    productId: item.productId,
    variantId: item.variantId,
    addonIds: item.addons.map((a) => a.addonId),
    quantity: item.quantity,
    itemNote: item.itemNote ?? "",
    fallbackName: item.productName,
    fallbackVariantName: item.variantName,
  };
}

export function toDrafts(order: AdminOrderDto): DraftItem[] {
  return order.items.map(toDraft);
}

export function toPayloadItem(draft: DraftItem): EditOrderItemPayload {
  const note = draft.itemNote.trim();
  return {
    orderItemId: draft.orderItemId,
    productId: draft.productId,
    variantId: draft.variantId,
    addonIds: [...draft.addonIds].sort((a, b) => a - b),
    quantity: draft.quantity,
    itemNote: note.length > 0 ? note : null,
  };
}

export function buildPayload(
  version: number,
  drafts: DraftItem[],
  customerNotes: string,
  cashChangeFrom: number | null,
): EditOrderPayload {
  const notes = customerNotes.trim();
  return {
    version,
    items: drafts.map(toPayloadItem),
    customerNotes: notes.length > 0 ? notes : null,
    cashChangeFrom,
  };
}

/** Płaska mapa produktów z publicznego menu — katalog do wybierania pozycji. */
export function indexMenu(menu: PublicMenuDto | undefined): Map<number, PublicProductDto> {
  const index = new Map<number, PublicProductDto>();
  for (const category of menu?.categories ?? []) {
    for (const product of category.products) {
      index.set(product.id, product);
    }
  }
  return index;
}

/** Etykieta pozycji: nazwa produktu z wariantem, z fallbackiem na snapshot. */
export function draftLabel(draft: DraftItem, product: PublicProductDto | undefined): string {
  if (!product) {
    return draft.fallbackVariantName
      ? `${draft.fallbackName} ${draft.fallbackVariantName}`
      : draft.fallbackName;
  }
  const variant = product.variants.find((v) => v.id === draft.variantId);
  return variant ? `${product.name} ${variant.name}` : product.name;
}
