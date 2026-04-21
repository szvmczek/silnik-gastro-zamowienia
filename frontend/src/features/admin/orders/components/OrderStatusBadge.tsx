import { Badge } from "@/shared/components/ui/Badge";
import type { OrderStatus } from "@/shared/api/orderApi";

type Variant = "default" | "primary" | "info" | "success" | "warning" | "danger" | "muted";

const mapping: Record<OrderStatus, { variant: Variant; label: string }> = {
  NEW: { variant: "primary", label: "Nowe" },
  CONFIRMED: { variant: "info", label: "Potwierdzone" },
  IN_PREPARATION: { variant: "warning", label: "W przygotowaniu" },
  READY: { variant: "success", label: "Gotowe" },
  OUT_FOR_DELIVERY: { variant: "warning", label: "W drodze" },
  DELIVERED: { variant: "muted", label: "Dostarczone" },
  CANCELED: { variant: "danger", label: "Anulowane" },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const { variant, label } = mapping[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function statusLabel(status: OrderStatus): string {
  return mapping[status].label;
}
