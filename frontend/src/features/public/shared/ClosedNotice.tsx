import { useQuery } from "@tanstack/react-query";
import { useIsRestaurantOpen } from "@/shared/hooks/useIsRestaurantOpen";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { fetchPublicOpeningHours } from "@/shared/api/openingHoursApi";
import { formatPhoneDisplay } from "@/shared/lib/formatPhone";
import { PiecShell } from "./PiecShell";

const DAY_MAP: Record<string, string> = {
  Monday: "MONDAY",
  Tuesday: "TUESDAY",
  Wednesday: "WEDNESDAY",
  Thursday: "THURSDAY",
  Friday: "FRIDAY",
  Saturday: "SATURDAY",
  Sunday: "SUNDAY",
};

function todayInWarsaw(): string | null {
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Warsaw",
    weekday: "long",
  })
    .formatToParts(new Date())
    .find((p) => p.type === "weekday")?.value;
  return weekday ? (DAY_MAP[weekday] ?? null) : null;
}

/**
 * Baner „Teraz zamknięte" z ekranów 10-11 planszy. Menu zostaje otwarte
 * do przeglądania — blokujemy dopiero złożenie zamówienia w checkoucie.
 *
 * Dane z tych samych zapytań, co reszta strony (opening-hours + settings),
 * odświeżanych przez TanStack Query — bez osobnego pollingu.
 */
export function ClosedNotice() {
  const { isOpen, isLoading } = useIsRestaurantOpen();
  const { data: settings } = usePublicSettings();
  const { data: hours } = useQuery({
    queryKey: ["public", "opening-hours"],
    queryFn: fetchPublicOpeningHours,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const manualReason = settings?.manualClosedReason ?? null;
  if (isLoading || (isOpen && !manualReason)) return null;

  const today = todayInWarsaw();
  const todayHours = hours?.find((h) => h.dayOfWeek === today);
  const detail = manualReason
    ? manualReason
    : todayHours && !todayHours.closed
      ? `Menu jest otwarte do przeglądania. Dziś przyjmujemy zamówienia ${todayHours.openTime?.slice(0, 5)}–${todayHours.closeTime?.slice(0, 5)}.`
      : "Menu jest otwarte do przeglądania. Dziś nie przyjmujemy zamówień.";

  return (
    <div className="border-b border-piec-warn/30 bg-piec-warnBg">
      <PiecShell className="flex flex-wrap items-center gap-3.5 py-4">
        <span
          aria-hidden="true"
          className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border-[1.5px] border-piec-warn/60"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" className="text-piec-warn" />
            <path
              d="M12 7.5V12L15 14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="text-piec-warn"
            />
          </svg>
        </span>
        <div className="min-w-[180px] flex-1">
          <p className="text-[15px] font-bold">Teraz zamknięte</p>
          <p className="mt-px text-[13.5px] leading-[1.5] text-piec-warnSoft">{detail}</p>
        </div>
        {settings?.phone ? (
          <a
            href={`tel:${settings.phone}`}
            className="flex min-h-[44px] items-center whitespace-nowrap rounded-full border-[1.5px] border-primary/60 px-4 text-[13.5px] font-bold text-primary"
          >
            Zadzwoń: {formatPhoneDisplay(settings.phone)}
          </a>
        ) : null}
      </PiecShell>
    </div>
  );
}
