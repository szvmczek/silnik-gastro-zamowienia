import type { SettingsDto } from "@/shared/api/settingsApi";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { formatPhoneDisplay } from "@/shared/lib/formatPhone";
import { SectionHeading } from "./SectionHeading";

interface Props {
  settings: SettingsDto | undefined;
}

/**
 * Kontakt w układzie z paczki: telefon jako wielki, klikalny numer
 * w akcencie i adres obok. Mapa świadomie usunięta — paczka jej nie ma,
 * a była to jedyna zależność od zewnętrznego Nominatim na landingu.
 * useAddressGeocode zostaje w repo, bez konsumenta na tej stronie.
 */
export function ContactSection({ settings }: Props) {
  if (!settings) return null;

  const addressLine = settings.addressLine?.trim() ?? "";
  const cityPostal = [settings.postalCode, settings.city]
    .map((p) => p?.trim())
    .filter(Boolean)
    .join(" ");
  const hasAddress = addressLine.length > 0 || cityPostal.length > 0;

  return (
    <section id="contact" className="mt-24 border-t border-piec-ink/10">
      <PiecShell>
        <SectionHeading>Kontakt</SectionHeading>
        <div className="mt-6 grid gap-8 pb-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))]">
          {settings.phone ? (
            <div>
              <p className="text-[12.5px] font-bold uppercase tracking-[2.5px] text-piec-ink/55">
                Telefon
              </p>
              <a
                href={`tel:${settings.phone}`}
                className="mt-2 inline-block font-display text-[clamp(38px,7vw,54px)] tracking-[2px] text-primary"
              >
                {formatPhoneDisplay(settings.phone)}
              </a>
              <p className="mt-1.5 text-[13.5px] leading-[1.6] text-piec-ink/55">
                Zamówienia telefoniczne — tak samo chętnie.
              </p>
            </div>
          ) : null}

          {hasAddress ? (
            <div>
              <p className="text-[12.5px] font-bold uppercase tracking-[2.5px] text-piec-ink/55">
                Adres
              </p>
              <p className="mt-2.5 font-display text-[clamp(24px,4vw,32px)] leading-[1.25] tracking-[1px]">
                {addressLine}
                {addressLine && cityPostal ? <br /> : null}
                {cityPostal}
              </p>
              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="mt-2 inline-block text-[13.5px] text-piec-ink/55 transition-colors hover:text-piec-ink/85"
                >
                  {settings.email}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </PiecShell>
    </section>
  );
}
