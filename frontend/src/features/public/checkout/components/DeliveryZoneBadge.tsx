import { CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import type { DeliveryCheckResponse } from "../api";

interface Props {
  result: DeliveryCheckResponse | undefined;
  loading: boolean;
  currency: string;
}

export function DeliveryZoneBadge({ result, loading, currency }: Props) {
  if (loading) {
    return (
      <div className="rounded-md border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-section))] p-2.5 text-[13px] text-[rgb(var(--color-text-muted))]">
        Sprawdzam dostępność dostawy…
      </div>
    );
  }
  if (!result) return null;

  if (result.status === "FREE") {
    return (
      <div className={cn(badgeBase, "border-[rgb(var(--status-ready))]/30 bg-[rgb(var(--status-ready-tint))] text-[rgb(var(--status-ready))]")}>
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>
          Darmowa dostawa{result.zoneName ? <> — strefa: <strong>{result.zoneName}</strong></> : null}
        </span>
      </div>
    );
  }
  if (result.status === "PAID") {
    return (
      <div className={cn(badgeBase, "border-[rgb(var(--color-primary))]/30 bg-[rgb(var(--color-primary-tint))] text-[rgb(var(--color-primary))]")}>
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>
          Dostawa: <strong>{formatPrice(result.fee, currency)}</strong>
          {result.zoneName ? <> — strefa: <strong>{result.zoneName}</strong></> : null}
        </span>
      </div>
    );
  }
  return (
    <div className={cn(badgeBase, "border-[rgb(var(--status-cancelled))]/30 bg-[rgb(var(--status-cancelled-tint))] text-[rgb(var(--status-cancelled))]")}>
      <XCircle className="h-4 w-4 shrink-0" />
      <span>
        {result.zoneName
          ? <>Adres jest w strefie <strong>{result.zoneName}</strong> — niedostępna dla dostawy</>
          : "Niestety nie dostarczamy pod ten adres"}
      </span>
    </div>
  );
}

const badgeBase =
  "flex items-start gap-2 rounded-md border p-2.5 text-[13px]";
