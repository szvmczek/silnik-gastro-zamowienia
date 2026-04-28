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
      <div className="rounded-md border border-slate-200 bg-slate-50 p-2.5 text-[13px] text-slate-500">
        Sprawdzam dostępność dostawy…
      </div>
    );
  }
  if (!result) return null;

  if (result.status === "FREE") {
    return (
      <div className={cn(badgeBase, "border-emerald-200 bg-emerald-50 text-emerald-800")}>
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>
          Darmowa dostawa{result.zoneName ? <> — strefa: <strong>{result.zoneName}</strong></> : null}
        </span>
      </div>
    );
  }
  if (result.status === "PAID") {
    return (
      <div className={cn(badgeBase, "border-amber-200 bg-amber-50 text-amber-800")}>
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>
          Dostawa: <strong>{formatPrice(result.fee, currency)}</strong>
          {result.zoneName ? <> — strefa: <strong>{result.zoneName}</strong></> : null}
        </span>
      </div>
    );
  }
  return (
    <div className={cn(badgeBase, "border-rose-200 bg-rose-50 text-rose-800")}>
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
