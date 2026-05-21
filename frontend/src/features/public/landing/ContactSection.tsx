import type { SettingsDto } from "@/shared/api/settingsApi";
import { useAddressGeocode } from "@/shared/hooks/useAddressGeocode";

interface Props {
  settings: SettingsDto | undefined;
}

function buildAddressString(settings: SettingsDto): string | null {
  const parts = [settings.addressLine, settings.postalCode, settings.city].filter(
    (p): p is string => !!p && p.trim().length > 0
  );
  return parts.length > 0 ? parts.join(", ") : null;
}

/* ContactSection — F-007 retrofit pod bundle Stage 2 ContactMapSection.
   4-pole layout (Adres / Telefon / E-mail / Strefa dostawy) — Strefa
   dostawy pominięta świadomie AD-Δ6 (backend gap, post-MVP wire-up
   z delivery-zones feature). H2 "Zadzwoń albo zamów online." +
   accent dot. Map aspect 1:1 desktop / 4:3 mobile. */

export function ContactSection({ settings }: Props) {
  const addressString = settings ? buildAddressString(settings) : null;
  const geocode = useAddressGeocode(addressString);
  if (!settings) return null;

  const addressLine = settings.addressLine?.trim() ?? "";
  const cityPostal = [settings.postalCode, settings.city]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(" ");
  const hasAddress = addressLine.length > 0 || cityPostal.length > 0;

  return (
    <section
      id="contact"
      className="border-t border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] py-12 md:py-20"
    >
      <div className="public-shell">
        <div className="grid gap-8 md:grid-cols-2 md:gap-16">
          <div>
            <div className="t-kicker t-kicker--accent mb-3">KONTAKT</div>
            <h2 className="text-[28px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[rgb(var(--color-text-primary))] md:text-[40px]">
              Zadzwoń albo zamów online
              <span className="text-[rgb(var(--color-primary))]">.</span>
            </h2>

            <div className="mt-7 flex flex-col gap-5 md:mt-9 md:gap-6">
              {hasAddress ? (
                <div>
                  <div className="t-kicker mb-1.5">ADRES</div>
                  <div className="text-[15px] font-medium leading-[1.45] text-[rgb(var(--color-text-primary))] md:text-[16px]">
                    {addressLine ? <span>{addressLine}</span> : null}
                    {addressLine && cityPostal ? <br /> : null}
                    {cityPostal ? <span>{cityPostal}</span> : null}
                  </div>
                </div>
              ) : null}

              {settings.phone ? (
                <div>
                  <div className="t-kicker mb-1.5">TELEFON</div>
                  <a
                    href={`tel:${settings.phone}`}
                    className="font-mono text-[17px] font-semibold leading-none text-[rgb(var(--color-text-primary))] transition-colors hover:text-[rgb(var(--color-primary))] md:text-[20px]"
                  >
                    {settings.phone}
                  </a>
                </div>
              ) : null}

              {settings.email ? (
                <div>
                  <div className="t-kicker mb-1.5">E-MAIL</div>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-[14px] font-medium text-[rgb(var(--color-text-body))] transition-colors hover:text-[rgb(var(--color-primary))] md:text-[15px]"
                  >
                    {settings.email}
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            {geocode.data ? (
              <div className="overflow-hidden rounded-[12px] border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-page))]">
                <iframe
                  title="Mapa dojazdu"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    geocode.data.lon - 0.005
                  },${geocode.data.lat - 0.003},${geocode.data.lon + 0.005},${
                    geocode.data.lat + 0.003
                  }&layer=mapnik&marker=${geocode.data.lat},${geocode.data.lon}`}
                  className="aspect-[4/3] w-full border-0 md:aspect-square"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[12px] border border-dashed border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-page))] px-6 text-center text-[13px] text-[rgb(var(--color-text-muted))] md:aspect-square">
                {hasAddress
                  ? "Mapa niedostępna — zobacz adres obok."
                  : "Dodaj adres w panelu admina, aby pokazać mapę."}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
