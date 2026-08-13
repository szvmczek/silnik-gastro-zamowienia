import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import type { DeliveryCheckResponse } from "@/features/public/checkout/api";

/**
 * Wynik sprawdzenia strefy — wspólny dla checkoutu i paska na menu.
 * Sam nic nie liczy: dostaje gotową odpowiedź z `useDeliveryCheck`.
 */
export function DeliveryCheckResult({
  result,
  isFetching,
  currency,
  freeDeliveryFrom,
  unavailableNote,
  unavailableActions,
  className,
}: {
  result: DeliveryCheckResponse | undefined;
  isFetching: boolean;
  currency: string;
  /** Próg darmowej dostawy (D-01) — dopisek przy strefie płatnej. */
  freeDeliveryFrom?: number | null;
  /** Dodatkowe zdanie przy adresie poza strefą (np. o odbiorze osobistym). */
  unavailableNote?: ReactNode;
  unavailableActions?: ReactNode;
  className?: string;
}) {
  if (isFetching) {
    return <p className={cn("text-sm text-piec-ink/50", className)}>Sprawdzamy adres…</p>;
  }
  if (!result) return null;

  if (result.status === "UNAVAILABLE") {
    return (
      <div
        role="status"
        className={cn(
          "rounded-xl border border-piec-warn/40 bg-piec-warn/[0.08] px-3.5 py-3",
          className,
        )}
      >
        <p className="text-sm leading-[1.6] text-piec-warnSoft">
          Niestety nie dowozimy pod ten adres.
        </p>
        {unavailableNote ? (
          <p className="mt-1.5 text-[13.5px] leading-[1.6] text-piec-ink/60">{unavailableNote}</p>
        ) : null}
        {unavailableActions ? (
          <div className="mt-2 flex flex-wrap gap-3.5">{unavailableActions}</div>
        ) : null}
      </div>
    );
  }

  const paid = result.fee > 0;
  return (
    <div
      role="status"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border border-piec-ok/30 bg-piec-ok/[0.08] px-3.5 py-3",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="mt-[7px] h-2 w-2 flex-none rounded-full bg-piec-ok"
      />
      <span className="text-sm leading-[1.6] text-piec-okSoft">
        {paid
          ? `${result.zoneName} — dostawa ${formatPrice(result.fee, currency)}`
          : `${result.zoneName} — dostawa gratis`}
        {paid && freeDeliveryFrom ? (
          <span className="mt-0.5 block text-[13px] text-piec-ink/60">
            Gratis przy zamówieniu od {formatPrice(freeDeliveryFrom, currency)}.
          </span>
        ) : null}
      </span>
    </div>
  );
}

