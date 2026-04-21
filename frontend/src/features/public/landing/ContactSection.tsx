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

export function ContactSection({ settings }: Props) {
  const addressString = settings ? buildAddressString(settings) : null;
  const geocode = useAddressGeocode(addressString);
  if (!settings) return null;
  const hasAddress = settings.addressLine || settings.city || settings.postalCode;

  return (
    <section id="contact" className="bg-slate-50 py-16">
      <div className="mx-auto max-w-4xl px-4">
        <h2 className="text-3xl font-semibold text-slate-900">Kontakt</h2>
        <p className="mt-2 text-sm text-slate-500">
          Odezwij się lub wpadnij osobiście — chętnie Cię ugościmy.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {settings.phone && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Telefon
              </div>
              <a
                href={`tel:${settings.phone}`}
                className="mt-1 block text-lg font-medium text-primary"
              >
                {settings.phone}
              </a>
            </div>
          )}
          {settings.email && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </div>
              <a
                href={`mailto:${settings.email}`}
                className="mt-1 block text-lg font-medium text-primary break-all"
              >
                {settings.email}
              </a>
            </div>
          )}
          {hasAddress && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 sm:col-span-2">
              <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Adres
              </div>
              <div className="mt-1 text-lg text-slate-700">
                {settings.addressLine && <div>{settings.addressLine}</div>}
                {(settings.postalCode || settings.city) && (
                  <div>
                    {[settings.postalCode, settings.city].filter(Boolean).join(" ")}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {geocode.data ? (
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <iframe
              title="Mapa dojazdu"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                geocode.data.lon - 0.005
              },${geocode.data.lat - 0.003},${geocode.data.lon + 0.005},${
                geocode.data.lat + 0.003
              }&layer=mapnik&marker=${geocode.data.lat},${geocode.data.lon}`}
              className="h-80 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
