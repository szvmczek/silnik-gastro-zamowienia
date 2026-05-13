import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import {
  fetchPublicOpeningHours,
  type DayOfWeek,
} from "@/shared/api/openingHoursApi";

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Poniedziałek",
  TUESDAY: "Wtorek",
  WEDNESDAY: "Środa",
  THURSDAY: "Czwartek",
  FRIDAY: "Piątek",
  SATURDAY: "Sobota",
  SUNDAY: "Niedziela",
};

export function PublicFooter() {
  const { data: settings } = usePublicSettings();
  const { data: hours } = useQuery({
    queryKey: ["public", "opening-hours"],
    queryFn: fetchPublicOpeningHours,
    staleTime: 60_000,
  });

  const year = new Date().getFullYear();
  const name = settings?.name ?? "Restauracja";
  const tagline = settings?.tagline ?? null;
  const phone = settings?.phone ?? null;
  const email = settings?.email ?? null;
  const addressLine = settings?.addressLine ?? null;
  const cityLine =
    settings?.postalCode || settings?.city
      ? [settings?.postalCode, settings?.city].filter(Boolean).join(" ")
      : null;
  const hasContact = Boolean(phone || email || addressLine || cityLine);

  return (
    <footer className="bg-[rgb(var(--color-bg-dark))] pb-24 pt-12 text-[rgb(var(--color-text-on-dark))] md:pb-8 md:pt-16">
      <div className="mx-auto max-w-6xl px-4 md:px-12">
        <div className="mb-10 grid grid-cols-1 gap-8 md:mb-12 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-16">
          {/* Col 1 — Brand */}
          <div>
            <div className="text-[28px] font-black leading-none tracking-[-0.02em]">
              {name}
              <span className="text-[rgb(var(--color-primary))]">.</span>
            </div>
            {tagline ? (
              <p className="mt-4 max-w-[320px] text-[14px] leading-[1.55] text-white/70">
                {tagline}
              </p>
            ) : null}
          </div>

          {/* Col 2 — Kontakt (merged Adres) */}
          {hasContact ? (
            <div>
              <span className="t-kicker mb-3.5 block text-white/50">Kontakt</span>
              <ul className="space-y-2 text-[14px] leading-[1.4]">
                {phone ? (
                  <li>
                    <a
                      href={`tel:${phone}`}
                      className="font-mono text-white transition-colors hover:text-[rgb(var(--color-primary))]"
                    >
                      {phone}
                    </a>
                  </li>
                ) : null}
                {email ? (
                  <li>
                    <a
                      href={`mailto:${email}`}
                      className="text-white/70 transition-colors hover:text-white"
                    >
                      {email}
                    </a>
                  </li>
                ) : null}
                {addressLine || cityLine ? (
                  <li className="text-white/70">
                    {addressLine}
                    {addressLine && cityLine ? <br /> : null}
                    {cityLine}
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}

          {/* Col 3 — Godziny (7-day grid) */}
          {hours ? (
            <div>
              <span className="t-kicker mb-3.5 block text-white/50">Godziny</span>
              <ul className="space-y-1.5 font-mono text-[13px] leading-[1.4] tabular-nums">
                {DAY_ORDER.map((day) => {
                  const entry = hours.find((h) => h.dayOfWeek === day);
                  const isClosed = !entry || entry.closed;
                  return (
                    <li
                      key={day}
                      className="flex items-baseline justify-between gap-3"
                    >
                      <span className="truncate text-white/90">
                        {DAY_LABELS[day]}
                      </span>
                      <span className="whitespace-nowrap text-white/70">
                        {isClosed
                          ? "Zamknięte"
                          : `${entry.openTime}–${entry.closeTime}`}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          {/* Col 4 — Informacje */}
          <div>
            <span className="t-kicker mb-3.5 block text-white/50">Informacje</span>
            <ul className="space-y-2 text-[14px] leading-[1.4] text-white/70">
              <li>Regulamin</li>
              <li>Polityka prywatności</li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-[12px] text-white/50 md:flex-row">
          <div>
            © {year} {name}. Wszystkie prawa zastrzeżone.
          </div>
          <Link
            to="/admin/login"
            className="text-[12px] text-white/40 transition-colors hover:text-white/70"
          >
            Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
