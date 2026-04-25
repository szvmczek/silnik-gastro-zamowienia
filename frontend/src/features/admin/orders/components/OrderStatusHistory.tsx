import type { AdminOrderStatusHistoryDto } from "@/shared/api/orderApi";
import { formatDateTime } from "@/shared/lib/formatDate";
import { statusLabel } from "@/shared/components/OrderStatusBadge";

interface OrderStatusHistoryProps {
  history: AdminOrderStatusHistoryDto[];
}

export function OrderStatusHistory({ history }: OrderStatusHistoryProps) {
  if (history.length === 0) {
    return <p className="text-sm text-slate-500">Brak historii statusów.</p>;
  }

  const sorted = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <ol className="space-y-3">
      {sorted.map((entry, idx) => (
        <li
          key={`${entry.status}-${entry.changedAt}-${idx}`}
          className="flex gap-3"
        >
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          <div className="flex-1">
            <div className="text-sm font-medium text-slate-900">
              {statusLabel(entry.status)}
            </div>
            <div className="text-xs text-slate-500">
              {formatDateTime(entry.changedAt)}
              {entry.changedBy && (
                <>
                  {" · "}
                  <span className="text-slate-600">{entry.changedBy}</span>
                </>
              )}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
