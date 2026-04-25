import type { AdminOrderStatusHistoryDto } from "@/shared/api/orderApi";
import { formatDateTime } from "@/shared/lib/formatDate";
import { cn } from "@/shared/lib/cn";
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
    <ol className="relative space-y-5 pl-5">
      <span
        className="absolute bottom-2 left-[10px] top-2 w-px bg-slate-200"
        aria-hidden="true"
      />
      {sorted.map((entry, idx) => {
        const isLatest = idx === 0;
        return (
          <li
            key={`${entry.status}-${entry.changedAt}-${idx}`}
            className="relative"
          >
            <span
              className={cn(
                "absolute -left-4 top-1 h-3 w-3 rounded-full",
                isLatest
                  ? "bg-primary ring-2 ring-primary/30"
                  : "bg-emerald-500"
              )}
              aria-hidden="true"
            />
            <div className="text-sm font-medium text-slate-900">
              {statusLabel(entry.status)}
            </div>
            <div className="text-xs text-slate-500">
              <time dateTime={entry.changedAt}>
                {formatDateTime(entry.changedAt)}
              </time>
              {entry.changedBy && (
                <>
                  {" · "}
                  <span className="text-slate-600">{entry.changedBy}</span>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
