import { Link } from "react-router-dom";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { Kicker } from "@/shared/components/typography/Kicker";

export function PublicFooter() {
  const { data: settings } = usePublicSettings();
  const year = new Date().getFullYear();
  const name = settings?.name ?? "Restauracja";
  const phone = settings?.phone ?? null;
  const email = settings?.email ?? null;
  const addressLine = settings?.addressLine ?? null;
  const cityLine =
    settings?.postalCode || settings?.city
      ? [settings?.postalCode, settings?.city].filter(Boolean).join(" ")
      : null;
  const hasContact = Boolean(phone || email || addressLine || cityLine);

  return (
    <footer className="border-t border-[rgb(var(--color-border-subtle))] bg-[rgb(var(--color-bg-card))] pb-24 pt-12 md:pb-12">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        {hasContact && (
          <div className="mb-10 grid gap-10 md:grid-cols-3">
            <div>
              <Kicker className="mb-3 block">Kontakt</Kicker>
              <ul className="space-y-1.5 text-[14px] text-[rgb(var(--color-text-body))]">
                {phone && (
                  <li>
                    <a
                      href={`tel:${phone}`}
                      className="hover:text-[rgb(var(--color-text-primary))]"
                    >
                      {phone}
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="hover:text-[rgb(var(--color-text-primary))]"
                    >
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            </div>
            {(addressLine || cityLine) && (
              <div>
                <Kicker className="mb-3 block">Adres</Kicker>
                <address className="not-italic space-y-1 text-[14px] text-[rgb(var(--color-text-body))]">
                  {addressLine && <div>{addressLine}</div>}
                  {cityLine && <div>{cityLine}</div>}
                </address>
              </div>
            )}
            <div>
              <Kicker className="mb-3 block">Informacje</Kicker>
              <ul className="space-y-1.5 text-[14px] text-[rgb(var(--color-text-muted))]">
                <li>Regulamin</li>
                <li>Polityka prywatności</li>
              </ul>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[rgb(var(--color-border-subtle))] pt-6 text-[13px] text-[rgb(var(--color-text-muted))] md:flex-row">
          <div>
            © {year} {name}. Wszystkie prawa zastrzeżone.
          </div>
          <div className="flex items-center gap-5">
            <span className="cursor-default">Regulamin</span>
            <span className="cursor-default">Polityka prywatności</span>
            <Link
              to="/admin/login"
              className="text-[12px] text-[rgb(var(--color-text-faint))] transition-colors hover:text-[rgb(var(--color-text-muted))]"
            >
              Panel
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
