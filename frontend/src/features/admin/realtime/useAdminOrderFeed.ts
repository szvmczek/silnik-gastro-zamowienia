import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/shared/auth/authStore";
import { emitOrderFeed, type OrderFulfillmentType } from "./orderFeedEvents";

interface OrderCreatedPayload {
  orderId: number;
  orderNumber: string;
  total: string | number;
  placedAt: string;
}

interface OrderStatusChangedPayload {
  orderId: number;
  orderNumber: string;
  newStatus: string;
  fulfillmentType?: OrderFulfillmentType;
}

interface OrderEditedPayload {
  orderId: number;
  orderNumber: string;
  total: string | number;
  kind: "EDIT" | "UNDO";
}

const STREAM_PATH = "/api/admin/orders/stream";
const INITIAL_BACKOFF_MS = 1_000;
const MAX_BACKOFF_MS = 30_000;

export function useAdminOrderFeed(): void {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const reconnectTimer = useRef<number | null>(null);
  const backoffRef = useRef<number>(INITIAL_BACKOFF_MS);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let cancelled = false;

    const cleanup = () => {
      if (reconnectTimer.current !== null) {
        window.clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }
    };

    const connect = () => {
      if (cancelled) return;
      const token = useAuthStore.getState().token;
      if (!token) {
        // Not logged in — defer; the layout re-mounts after login.
        return;
      }
      const url = `${STREAM_PATH}?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      sourceRef.current = es;

      es.addEventListener("READY", () => {
        backoffRef.current = INITIAL_BACKOFF_MS;
      });

      es.addEventListener("ORDER_CREATED", (ev) => {
        const data = parsePayload<OrderCreatedPayload>((ev as MessageEvent).data);
        if (!data) return;
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
        // summary endpoint kept for backward compat (Faza 4 dashboard);
        // stats is the new Faza 4.5 manager dashboard query key.
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "stats"] });
        // Nowe zamówienie nie znika samo: to jedyne zdarzenie w panelu, którego
        // przegapienie kosztuje czas kuchni. Znika dopiero, gdy admin je
        // otworzy albo jawnie zamknie.
        toast.success(`Nowe zamówienie: ${data.orderNumber}`, {
          duration: Infinity,
          closeButton: true,
          action: {
            label: "Otwórz",
            onClick: () => navigate(`/admin/orders/${data.orderId}`),
          },
        });
        emitOrderFeed({
          kind: "created",
          orderId: data.orderId,
          orderNumber: data.orderNumber,
        });
      });

      es.addEventListener("ORDER_STATUS_CHANGED", (ev) => {
        const data = parsePayload<OrderStatusChangedPayload>((ev as MessageEvent).data);
        if (!data) return;
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
        queryClient.invalidateQueries({
          queryKey: ["admin", "orders", "detail", data.orderId],
        });
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "stats"] });
        emitOrderFeed({
          kind: "status-changed",
          orderId: data.orderId,
          orderNumber: data.orderNumber,
          newStatus: data.newStatus,
          fulfillmentType: data.fulfillmentType ?? null,
        });
      });

      // Treść zamówienia zmieniła się (edycja z panelu albo jej cofnięcie).
      // Kuchnia ma zobaczyć nowe pozycje natychmiast, ale bez dźwięku —
      // dlatego nie wołamy emitOrderFeed(), które steruje pikaniem widoków.
      es.addEventListener("ORDER_EDITED", (ev) => {
        const data = parsePayload<OrderEditedPayload>((ev as MessageEvent).data);
        if (!data) return;
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
        queryClient.invalidateQueries({
          queryKey: ["admin", "orders", "detail", data.orderId],
        });
        queryClient.invalidateQueries({ queryKey: ["admin", "dashboard", "stats"] });
        toast.info(
          data.kind === "UNDO"
            ? `Cofnięto zmianę w zamówieniu ${data.orderNumber}`
            : `Zmieniono zamówienie ${data.orderNumber}`,
        );
      });

      es.onerror = () => {
        if (cancelled) return;
        es.close();
        sourceRef.current = null;
        const delay = backoffRef.current;
        backoffRef.current = Math.min(delay * 2, MAX_BACKOFF_MS);
        reconnectTimer.current = window.setTimeout(connect, delay);
      };
    };

    connect();
    return () => {
      cancelled = true;
      cleanup();
    };
  }, [queryClient, navigate]);
}

function parsePayload<T>(raw: unknown): T | null {
  if (typeof raw !== "string") return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
