import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { cn } from "@/shared/lib/cn";
import { useCartTotal } from "./cartStore";

/* FreeDeliveryProgress — sticky strip widoczny pod wrapper banner+nav (M-019)
   gdy klient ma w koszyku >0 i restauracja udostępnia próg darmowej dostawy.

   Graceful fallback (decyzja Q2 z plan mode):
   - threshold == null (Faza 5 M1 backend delta jeszcze nie zaaplikowana)
     → return null. Komponent automatycznie ożywa, gdy backend zacznie zwracać
     freeDeliveryFrom w SettingsDto.
   - subtotal <= 0 (pusty koszyk) → return null. Klient bez koszyka nie potrzebuje
     pasku motywującego.

   Bez własnego sticky — natural-flow. Pozycjonowanie sticky w M-019 (umieszczenie
   wewnątrz tej samej div.sticky top-0 z-50 co banner+nav, wrapper rośnie/kurczy
   się dynamicznie). */

interface Props {
  compact?: boolean;
}

function formatPLN(amount: number): string {
  return `${amount.toFixed(2).replace(".", ",")} zł`;
}

export function FreeDeliveryProgress({ compact = false }: Props) {
  const subtotal = useCartTotal();
  const { data: settings } = usePublicSettings();
  const threshold = settings?.freeDeliveryFrom;

  if (threshold == null || subtotal <= 0) return null;

  const remaining = Math.max(0, threshold - subtotal);
  const reached = remaining === 0;
  const pct = Math.min(100, (subtotal / threshold) * 100);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-wrap items-center gap-x-3.5 gap-y-1.5 border-b border-[rgb(var(--color-border-card))] transition-colors",
        reached ? "bg-[rgb(var(--color-primary-tint))]" : "bg-[rgb(var(--color-bg-card))]",
        compact ? "px-4 py-2.5" : "px-12 py-2.5"
      )}
    >
      <span aria-hidden="true" className="text-[14px]">
        {reached ? "🎉" : "🛵"}
      </span>
      <span
        className={cn(
          "text-[13px] font-medium leading-snug",
          reached
            ? "text-[rgb(var(--color-primary))]"
            : "text-[rgb(var(--color-text-primary))]"
        )}
      >
        {reached ? (
          <>
            Masz <strong className="font-semibold">darmową dostawę</strong>.
          </>
        ) : (
          <>
            Brakuje{" "}
            <strong className="font-mono font-semibold">
              {formatPLN(remaining)}
            </strong>{" "}
            do darmowej dostawy.
          </>
        )}
      </span>
      <div
        aria-hidden="true"
        className={cn(
          "h-1.5 flex-1 overflow-hidden rounded-[3px] bg-[rgb(var(--color-border-card))]",
          compact ? "min-w-[80px] basis-full" : "min-w-[120px] max-w-[360px]"
        )}
      >
        <div
          className="h-full bg-[rgb(var(--color-primary))] transition-[width] duration-[240ms] ease-[cubic-bezier(0.2,0.7,0.3,1)]"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[12px] tabular-nums text-[rgb(var(--color-text-muted))]">
        {formatPLN(subtotal).replace(" zł", "")} / {threshold} zł
      </span>
    </div>
  );
}
