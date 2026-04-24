import { Mail, MapPin, Phone } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
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

interface TileProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  title: string;
  titleHref?: string;
  subtitle?: string | null;
}

function ContactTile({ icon: Icon, title, titleHref, subtitle }: TileProps) {
  const titleNode = titleHref ? (
    <a
      href={titleHref}
      className="text-[15px] font-semibold text-slate-900 transition-colors hover:text-primary"
    >
      {title}
    </a>
  ) : (
    <div className="text-[15px] font-semibold text-slate-900">{title}</div>
  );
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
        <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
      </div>
      <div className="min-w-0">
        {titleNode}
        {subtitle ? (
          <div className="mt-0.5 text-[14px] text-slate-500">{subtitle}</div>
        ) : null}
      </div>
    </div>
  );
}

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
      className="border-t border-slate-200 bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
              Kontakt
            </div>
            <h2 className="mb-8 text-[28px] font-semibold leading-[1.1] tracking-tight text-slate-900 md:text-[40px] md:leading-[1.05]">
              Znajdziesz nas
            </h2>

            <div className="space-y-5">
              {hasAddress ? (
                <ContactTile
                  icon={MapPin}
                  title={addressLine || cityPostal || "Adres"}
                  subtitle={addressLine && cityPostal ? cityPostal : null}
                />
              ) : null}
              {settings.phone ? (
                <ContactTile
                  icon={Phone}
                  title={settings.phone}
                  titleHref={`tel:${settings.phone}`}
                  subtitle="Zadzwoń w godzinach otwarcia"
                />
              ) : null}
              {settings.email ? (
                <ContactTile
                  icon={Mail}
                  title={settings.email}
                  titleHref={`mailto:${settings.email}`}
                  subtitle="Odpowiadamy w ciągu 24 h"
                />
              ) : null}
            </div>
          </div>

          <div className="md:col-span-7">
            {geocode.data ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <iframe
                  title="Mapa dojazdu"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                    geocode.data.lon - 0.005
                  },${geocode.data.lat - 0.003},${geocode.data.lon + 0.005},${
                    geocode.data.lat + 0.003
                  }&layer=mapnik&marker=${geocode.data.lat},${geocode.data.lon}`}
                  className="aspect-[4/3] w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-[13px] text-slate-500">
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
