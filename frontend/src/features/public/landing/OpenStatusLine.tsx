import { useQuery } from "@tanstack/react-query";
import { useIsRestaurantOpen } from "@/shared/hooks/useIsRestaurantOpen";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { fetchPublicOpeningHours, type DayOfWeek } from "@/shared/api/openingHoursApi";
import { cn } from "@/shared/lib/cn";

const WEEKDAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

function trimTime(value: string | null): string | null {
  return value ? value.slice(0, 5) : null;
}

/**
 * Linia statusu z paczki: pulsująca kropka + „Otwarte do 21:00 · odbiór
 * ~25 min" albo „Dziś już zamknięte — otwieramy jutro o 12:00".
 *
 * Czas przygotowania bierzemy z RestaurantSettings.defaultPreparationMinutes,
 * a nie z hardcoded „~25 min" jak paczka. Godzina następnego otwarcia
 * liczona z opening_hours — szukamy najbliższego dnia, który nie jest
 * zamknięty.
 */
export function OpenStatusLine({ className }: { className?: string }) {
  const { isOpen, isLoading, todayHours } = useIsRestaurantOpen();
  const { data: settings } = usePublicSettings();
  const { data: hours } = useQuery({
    queryKey: ["public", "opening-hours"],
    queryFn: fetchPublicOpeningHours,
    staleTime: 60_000,
  });

  if (isLoading) return null;

  const manualReason = settings?.manualClosedReason ?? null;
  const prepMinutes = settings?.defaultPreparationMinutes ?? null;

  if (isOpen && !manualReason) {
    const closesAt = trimTime(todayHours?.closeTime ?? null);
    const parts = [
      closesAt ? `Otwarte do ${closesAt}` : "Otwarte",
      prepMinutes ? `odbiór ~${prepMinutes} min` : null,
    ].filter(Boolean);
    return (
      <div
        className={cn("flex items-center gap-2.5 text-sm font-semibold text-piec-ink/90", className)}
      >
        <span
          aria-hidden="true"
          className="h-[9px] w-[9px] shrink-0 rounded-full bg-piec-ok animate-piec-dot"
        />
        {parts.join(" · ")}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5 text-sm font-semibold text-piec-warnSoft", className)}>
      <span aria-hidden="true" className="h-[9px] w-[9px] shrink-0 rounded-full bg-piec-warn" />
      {manualReason ?? `Dziś już zamknięte${nextOpening(hours) ?? ""}`}
    </div>
  );
}

/** „ — otwieramy jutro o 12:00" / „ — otwieramy w piątek o 12:00". */
function nextOpening(hours: { dayOfWeek: DayOfWeek; closed: boolean; openTime: string | null }[] | undefined) {
  if (!hours?.length) return null;
  const todayIndex = (new Date().getDay() + 6) % 7; // JS: niedziela = 0
  for (let step = 1; step <= 7; step += 1) {
    const day = WEEKDAY_ORDER[(todayIndex + step) % 7];
    const entry = hours.find((h) => h.dayOfWeek === day);
    if (!entry || entry.closed || !entry.openTime) continue;
    const when = step === 1 ? "jutro" : `w ${DAY_LOCATIVE[day]}`;
    return ` — otwieramy ${when} o ${trimTime(entry.openTime)}`;
  }
  return null;
}

const DAY_LOCATIVE: Record<DayOfWeek, string> = {
  MONDAY: "poniedziałek",
  TUESDAY: "wtorek",
  WEDNESDAY: "środę",
  THURSDAY: "czwartek",
  FRIDAY: "piątek",
  SATURDAY: "sobotę",
  SUNDAY: "niedzielę",
};
