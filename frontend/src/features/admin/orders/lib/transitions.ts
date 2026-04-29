import type { FulfillmentType, OrderStatus } from "@/shared/api/orderApi";

const TERMINAL: OrderStatus[] = ["DELIVERED", "CANCELED"];

export function isTerminal(status: OrderStatus): boolean {
  return TERMINAL.includes(status);
}

export function canTransitionTo(
  from: OrderStatus,
  to: OrderStatus,
  fulfillmentType: FulfillmentType
): boolean {
  if (to === from) return false;
  if (isTerminal(from)) return false;
  if (to === "CANCELED") return true;
  switch (from) {
    case "NEW":
      // AD-023: NEW -> IN_PREPARATION skips the optional CONFIRMED step
      // for the kitchen single-tap workflow.
      return to === "CONFIRMED" || to === "IN_PREPARATION";
    case "CONFIRMED":
      return to === "IN_PREPARATION";
    case "IN_PREPARATION":
      return to === "READY";
    case "READY":
      return fulfillmentType === "DELIVERY"
        ? to === "OUT_FOR_DELIVERY"
        : to === "DELIVERED";
    case "OUT_FOR_DELIVERY":
      return fulfillmentType === "DELIVERY" && to === "DELIVERED";
    default:
      return false;
  }
}

const ALL_STATUSES: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "IN_PREPARATION",
  "READY",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export function nextAllowedStatuses(
  from: OrderStatus,
  fulfillmentType: FulfillmentType
): OrderStatus[] {
  return ALL_STATUSES.filter((to) => canTransitionTo(from, to, fulfillmentType));
}
