import { useQuery } from "@tanstack/react-query";
import { fetchDeliveryZones } from "@/features/public/checkout/api";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { SectionHeading } from "./SectionHeading";

/**
 * Kafle „Dostawa i odbiór" z paczki — D-01: budowane z aktywnych stref
 * przez GET /api/public/delivery/zones, nie z hardcoded tabeli.
 *
 * Kafel odbioru osobistego jest stały, bo odbiór nie jest strefą —
 * zawsze kosztuje 0 zł i zawsze jest pod adresem restauracji.
 */
export function DeliveryZonesSection() {
  const { data: settings } = usePublicSettings();
  const { data: zones } = useQuery({
    queryKey: ["public", "delivery-zones"],
    queryFn: fetchDeliveryZones,
    staleTime: 5 * 60_000,
  });

  const currency = settings?.currency;
  const freeFrom = settings?.freeDeliveryFrom ?? null;
  const minOrder = settings?.minOrderAmount ?? null;
  const prepMinutes = settings?.defaultPreparationMinutes ?? null;

  const pickupAddress = [settings?.addressLine, settings?.city].filter(Boolean).join(", ");
  const footnote = [
    minOrder ? `Dostawy od ${formatPrice(minOrder, currency)}.` : null,
    "Płatność gotówką — przy odbiorze albo kurierowi.",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="mt-24 border-t border-piec-ink/10">
      <PiecShell>
        <SectionHeading>Dostawa i odbiór</SectionHeading>
        <div className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr))]">
          {(zones ?? []).map((zone) => (
            <article
              key={zone.name}
              className="rounded-2xl border border-piec-ink/10 bg-piec-surface p-5"
            >
              <h3 className="text-[15px] font-semibold text-piec-ink/80">{zone.name}</h3>
              <p className="mt-1.5 font-display text-[32px] tracking-[1px]">
                {zone.fee > 0 ? formatPrice(zone.fee, currency) : "gratis"}
              </p>
              {/* Strefa obejmująca jedną miejscowość nie zyskuje nic na
                  wypisaniu jej nazwy drugi raz — tam wchodzi próg darmowej
                  dostawy. Przy kilku miejscowościach ważniejsze jest, gdzie
                  w ogóle dowozimy. */}
              <p className="mt-1 text-[13.5px] leading-[1.5] text-piec-ink/55">
                {zone.cities.length > 1
                  ? zone.cities.join(", ")
                  : freeFrom
                    ? `gratis przy zamówieniu od ${formatPrice(freeFrom, currency)}`
                    : zone.cities.join(", ")}
              </p>
            </article>
          ))}

          <article className="rounded-2xl border border-piec-ink/10 bg-piec-surface p-5">
            <h3 className="text-[15px] font-semibold text-piec-ink/80">Odbiór osobisty</h3>
            <p className="mt-1.5 font-display text-[32px] tracking-[1px] text-primary">
              {formatPrice(0, currency)}
            </p>
            <p className="mt-1 text-[13.5px] leading-[1.5] text-piec-ink/55">
              {[pickupAddress || null, prepMinutes ? `zwykle ${prepMinutes} minut` : null]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </article>
        </div>
        <p className="pb-4 pt-5 text-[13px] leading-[1.6] text-piec-ink/55">{footnote}</p>
      </PiecShell>
    </section>
  );
}
