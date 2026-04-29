import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/shared/components/ui/Button";
import {
  updateOrderStatus,
  type AdminOrderDto,
  type AdminOrderListItemDto,
  type FulfillmentType,
  type OrderStatus,
  type OrderTrackingItemDto,
} from "@/shared/api/orderApi";
import { extractProblem } from "@/shared/api/client";
import { statusLabel } from "@/shared/components/OrderStatusBadge";

interface KitchenOrderCardProps {
  order: AdminOrderListItemDto;
  onOpenEta: () => void;
}

interface PrimaryAction {
  label: string;
  next: OrderStatus;
}

function primaryAction(status: OrderStatus): PrimaryAction | null {
  if (status === "NEW") return { label: "Przyjmij", next: "IN_PREPARATION" };
  if (status === "IN_PREPARATION") return { label: "Gotowe", next: "READY" };
  return null;
}

function fulfillmentBadge(t: FulfillmentType): { label: string; className: string } {
  return t === "DELIVERY"
    ? { label: "🚗 Dostawa", className: "bg-sky-100 text-sky-700" }
    : { label: "🏪 Odbiór", className: "bg-emerald-100 text-emerald-700" };
}

function relativeTime(iso: string): string {
  return formatDistanceToNow(new Date(iso), { locale: pl, addSuffix: true });
}

export function KitchenOrderCard({ order, onOpenEta }: KitchenOrderCardProps) {
  const queryClient = useQueryClient();
  const action = primaryAction(order.status);
  const badge = fulfillmentBadge(order.fulfillmentType);

  const mutation = useMutation({
    mutationFn: (next: OrderStatus) =>
      updateOrderStatus(order.id, { status: next, version: order.version }),
    onSuccess: (data: AdminOrderDto) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
      queryClient.setQueryData(["admin", "orders", "detail", data.id], data);
      toast.success(`${order.orderNumber} → ${statusLabel(data.status)}`);
    },
    onError: (err) => {
      const status = err instanceof AxiosError ? err.response?.status : undefined;
      if (status === 409) {
        toast.error("Ktoś inny zmienił zamówienie. Lista odświeżona.");
        queryClient.invalidateQueries({ queryKey: ["admin", "orders", "list"] });
        return;
      }
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zmienić statusu");
    },
  });

  return (
    <article className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-mono text-[20px] font-semibold tracking-tight text-slate-900">
            {order.orderNumber}
          </div>
          <div className="text-xs text-slate-500">{relativeTime(order.placedAt)}</div>
        </div>
        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
        >
          {badge.label}
        </span>
      </header>

      <ul className="mt-4 space-y-2 text-[14px] text-slate-900">
        {order.items.map((item, idx) => (
          <ItemLine key={idx} item={item} />
        ))}
      </ul>

      {order.customerNotes && (
        <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-[14px] text-amber-900">
          <span aria-hidden="true">📝 </span>
          <span className="whitespace-pre-line">{order.customerNotes}</span>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-[13px] text-slate-600">
        {order.etaMinutes !== null ? (
          <span className="font-medium text-slate-900">ETA: {order.etaMinutes} min</span>
        ) : (
          <span className="text-slate-400">ETA: —</span>
        )}
        <button
          type="button"
          onClick={onOpenEta}
          className="text-primary hover:underline"
        >
          {order.etaMinutes !== null ? "Zmień" : "Ustaw ETA"}
        </button>
      </div>

      {action && (
        <Button
          type="button"
          variant="primary"
          size="xl"
          className="mt-5 w-full"
          onClick={() => mutation.mutate(action.next)}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Zapisywanie…" : action.label}
        </Button>
      )}
    </article>
  );
}

function ItemLine({ item }: { item: OrderTrackingItemDto }) {
  return (
    <li>
      <div className="font-medium">
        {item.quantity}× {item.productName}
        {item.variantName && (
          <span className="text-slate-500"> {item.variantName}</span>
        )}
      </div>
      {item.addons.length > 0 && (
        <div className="ml-4 text-[13px] text-slate-500">
          + {item.addons.map((a) => a.name).join(", ")}
        </div>
      )}
    </li>
  );
}
