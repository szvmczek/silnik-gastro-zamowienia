import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { fetchPublicOpeningHours, type DayOfWeek } from "@/shared/api/openingHoursApi";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { PiecShell } from "./PiecShell";

const CLOSED_DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "poniedziałki",
  TUESDAY: "wtorki",
  WEDNESDAY: "środy",
  THURSDAY: "czwartki",
  FRIDAY: "piątki",
  SATURDAY: "soboty",
  SUNDAY: "niedziele",
};

/**
 * Stopka z paczki: dwie ciche linijki zamiast czterech kolumn. Treść
 * budowana z API — nazwa, adres i telefon z ustawień, dni zamknięte
 * wyliczone z godzin otwarcia.
 *
 * Linki do regulaminu i polityki prywatności nie ma ich w paczce, ale
 * zostają — RODO weszło w M-047 i nie usuwamy tego przy redesignie.
 */
export function PiecFooter() {
  const { data: settings } = usePublicSettings();
  const { data: hours } = useQuery({
    queryKey: ["public", "opening-hours"],
    queryFn: fetchPublicOpeningHours,
    staleTime: 60_000,
  });

  const addressLine = [
    settings?.addressLine,
    [settings?.postalCode, settings?.city].filter(Boolean).join(" ") || null,
  ]
    .filter(Boolean)
    .join(", ");

  const identity = [settings?.name, addressLine || null, settings?.phone ? `tel. ${settings.phone}` : null]
    .filter(Boolean)
    .join(" · ");

  const closedDays = (hours ?? [])
    .filter((h) => h.closed)
    .map((h) => CLOSED_DAY_LABELS[h.dayOfWeek]);

  const facts = [
    "Płatność gotówką",
    settings?.minOrderAmount
      ? `Dostawy od ${formatPrice(settings.minOrderAmount, settings.currency)}`
      : null,
    closedDays.length ? `W ${closedDays.join(" i ")} zamknięte` : null,
  ].filter(Boolean);

  return (
    <footer className="mt-14 border-t border-piec-ink/10">
      <PiecShell className="py-5 text-[13px] leading-[1.7] text-piec-ink/45">
        <p>{identity}</p>
        {facts.length ? <p>{facts.join(" · ")}</p> : null}
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
          <Link to="/terms" className="transition-colors hover:text-piec-ink/80">
            Regulamin
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-piec-ink/80">
            Polityka prywatności
          </Link>
          <Link to="/admin/login" className="ml-auto transition-colors hover:text-piec-ink/80">
            Panel
          </Link>
        </p>
      </PiecShell>
    </footer>
  );
}
