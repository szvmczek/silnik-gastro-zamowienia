import { Badge } from "@/shared/components/ui/Badge";
import type { OrderStatus } from "@/shared/api/orderApi";

type StatusBadgeVariant =
  | "status-new"
  | "status-confirmed"
  | "status-prep"
  | "status-ready"
  | "status-out"
  | "status-delivered"
  | "status-cancelled";

const mapping: Record<OrderStatus, { variant: StatusBadgeVariant; label: string }> = {
  NEW: { variant: "status-new", label: "Nowe" },
  CONFIRMED: { variant: "status-confirmed", label: "Potwierdzone" },
  IN_PREPARATION: { variant: "status-prep", label: "W przygotowaniu" },
  READY: { variant: "status-ready", label: "Gotowe" },
  OUT_FOR_DELIVERY: { variant: "status-out", label: "W drodze" },
  DELIVERED: { variant: "status-delivered", label: "Dostarczone" },
  CANCELED: { variant: "status-cancelled", label: "Anulowane" },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: "sm" | "lg";
}

export function OrderStatusBadge({ status, size = "sm" }: OrderStatusBadgeProps) {
  const { variant, label } = mapping[status];
  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
}

export function statusLabel(status: OrderStatus): string {
  return mapping[status].label;
}
