import type { AdminOrderStatusHistoryDto } from "@/shared/api/orderApi";
import { formatDateTime } from "@/shared/lib/formatDate";
import { cn } from "@/shared/lib/cn";
import { statusLabel } from "@/shared/components/ui/OrderStatusBadge";

interface OrderStatusHistoryProps {
  history: AdminOrderStatusHistoryDto[];
}

export function OrderStatusHistory({ history }: OrderStatusHistoryProps) {
  if (history.length === 0) {
    return (
      <p className="text-sm text-[rgb(var(--color-text-muted))]">
        Brak historii statusów.
      </p>
    );
  }

  const sorted = [...history].sort(
    (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <ol className="relative space-y-5 pl-5">
      <span
        className="absolute bottom-2 left-[10px] top-2 w-px bg-[rgb(var(--color-border-subtle))]"
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
                  ? "bg-[rgb(var(--color-primary))] ring-2 ring-[rgb(var(--color-primary))]/30 motion-safe:[animation:dotpulse_1.5s_ease-in-out_infinite]"
                  : "bg-[rgb(var(--status-ready))]"
              )}
              aria-hidden="true"
            />
            <div className="text-sm font-semibold text-[rgb(var(--color-text-primary))]">
              {statusLabel(entry.status)}
            </div>
            <div className="font-mono text-xs text-[rgb(var(--color-text-muted))]">
              <time dateTime={entry.changedAt}>
                {formatDateTime(entry.changedAt)}
              </time>
              {entry.changedBy && (
                <>
                  {" · "}
                  <span className="text-[rgb(var(--color-text-body))]">
                    {entry.changedBy}
                  </span>
                </>
              )}
            </div>
            {entry.reason && (
              <p className="mt-1 whitespace-pre-line text-xs italic text-[rgb(var(--color-text-body))]">
                {entry.reason}
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
