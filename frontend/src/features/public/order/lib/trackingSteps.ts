import type { FulfillmentType, OrderStatus } from "@/shared/api/orderApi";

export interface TrackingStep {
  label: string;
  /** Statusy z bazy, które ten krok reprezentuje. */
  statuses: OrderStatus[];
  hint?: string;
  /** Nagłówek banera nad osią — komunikat stanu na pierwszy rzut oka. */
  headline: string;
  /** Zdanie kontekstu pod nagłówkiem banera. */
  detail: string;
}

/**
 * D-05 — mapowanie statusów na cztery kroki widoczne dla klienta,
 * zależne od typu realizacji.
 *
 * Backend ma sześć statusów (AD-008), z których dwa nie mają sensu
 * dla klienta w tej postaci: CONFIRMED to opcjonalna ścieżka
 * back-office, a READY znaczy co innego przy dostawie („czeka na
 * kuriera") niż przy odbiorze („przyjdź po odbiór") — i właśnie przy
 * odbiorze jest najważniejszym momentem całego zamówienia.
 *
 * CANCELED celowo nie jest krokiem osi — to osobny stan, renderowany
 * przez TrackingPage jako karta zamiast osi.
 */
const DELIVERY_STEPS: TrackingStep[] = [
  {
    label: "Przyjęte",
    statuses: ["NEW", "CONFIRMED"],
    headline: "Mamy Twoje zamówienie",
    detail: "Przyjęliśmy je do realizacji. Za chwilę trafi na piec.",
  },
  {
    label: "W przygotowaniu",
    statuses: ["IN_PREPARATION"],
    headline: "Robimy Twoje jedzenie",
    detail: "Zamówienie jest w kuchni.",
  },
  {
    label: "W drodze",
    statuses: ["READY", "OUT_FOR_DELIVERY"],
    headline: "Jedzie do Ciebie",
    detail: "Kurier wyruszył pod wskazany adres.",
  },
  {
    label: "Dostarczone",
    statuses: ["DELIVERED"],
    headline: "Dostarczone",
    detail: "Smacznego!",
  },
];

const PICKUP_STEPS: TrackingStep[] = [
  {
    label: "Przyjęte",
    statuses: ["NEW", "CONFIRMED"],
    headline: "Mamy Twoje zamówienie",
    detail: "Przyjęliśmy je do realizacji. Za chwilę trafi na piec.",
  },
  {
    label: "W przygotowaniu",
    statuses: ["IN_PREPARATION"],
    headline: "Robimy Twoje jedzenie",
    detail: "Zamówienie jest w kuchni.",
  },
  {
    label: "Gotowe do odbioru",
    statuses: ["READY"],
    hint: "Możesz przyjeżdżać — czeka na Ciebie.",
    headline: "Gotowe do odbioru",
    detail: "Możesz przyjeżdżać — czeka na Ciebie.",
  },
  {
    label: "Odebrane",
    statuses: ["DELIVERED"],
    headline: "Odebrane",
    detail: "Smacznego!",
  },
];

export function trackingSteps(fulfillmentType: FulfillmentType): TrackingStep[] {
  return fulfillmentType === "PICKUP" ? PICKUP_STEPS : DELIVERY_STEPS;
}

/** Indeks kroku odpowiadającego statusowi; -1 dla CANCELED. */
export function currentStepIndex(
  status: OrderStatus,
  fulfillmentType: FulfillmentType,
): number {
  return trackingSteps(fulfillmentType).findIndex((step) => step.statuses.includes(status));
}
