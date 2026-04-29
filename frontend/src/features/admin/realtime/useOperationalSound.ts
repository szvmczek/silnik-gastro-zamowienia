import { useEffect } from "react";
import { playDeliverySound, playKitchenSound, playPickupSound } from "@/lib/sounds";
import { subscribeOrderFeed } from "./orderFeedEvents";

export type OperationalView = "kitchen" | "pickup" | "delivery" | "manager";

// Per-view audio dispatcher. Sits on top of the global useAdminOrderFeed
// SSE connection via orderFeedEvents — no extra EventSource. Manager view
// is a no-op subscription (kept for symmetry / readability).
export function useOperationalSound(view: OperationalView): void {
  useEffect(() => {
    if (view === "manager") return;

    const unsubscribe = subscribeOrderFeed((event) => {
      if (view === "kitchen") {
        if (event.kind === "created") playKitchenSound();
        return;
      }
      if (event.kind !== "status-changed") return;
      if (event.newStatus !== "READY") return;
      if (view === "pickup" && event.fulfillmentType === "PICKUP") {
        playPickupSound();
      } else if (view === "delivery" && event.fulfillmentType === "DELIVERY") {
        playDeliverySound();
      }
    });

    return unsubscribe;
  }, [view]);
}
