// Tiny pub/sub between the single-mounted useAdminOrderFeed (which owns
// the SSE connection) and per-view useOperationalSound subscribers.
// Keeps SSE infrastructure unchanged while letting kitchen/pickup/delivery
// pages decide independently whether to play a sound.

export type OrderFulfillmentType = "PICKUP" | "DELIVERY";

export type OrderFeedEvent =
  | {
      kind: "created";
      orderId: number;
      orderNumber: string;
    }
  | {
      kind: "status-changed";
      orderId: number;
      orderNumber: string;
      newStatus: string;
      fulfillmentType: OrderFulfillmentType | null;
    };

type Listener = (event: OrderFeedEvent) => void;

const listeners = new Set<Listener>();

export function subscribeOrderFeed(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitOrderFeed(event: OrderFeedEvent): void {
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // Subscriber threw — keep dispatching to the rest.
    }
  }
}
