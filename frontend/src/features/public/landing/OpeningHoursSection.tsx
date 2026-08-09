import type { DayOfWeek, OpeningHoursDto } from "@/shared/api/openingHoursApi";
import { cn } from "@/shared/lib/cn";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { SectionHeading } from "./SectionHeading";

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
  MONDAY: "poniedziałek",
  TUESDAY: "wtorek",
  WEDNESDAY: "środa",
  THURSDAY: "czwartek",
  FRIDAY: "piątek",
  SATURDAY: "sobota",
  SUNDAY: "niedziela",
};
const EN_DAY_MAP: Record<string, DayOfWeek> = {
  Monday: "MONDAY",
  Tuesday: "TUESDAY",
  Wednesday: "WEDNESDAY",
  Thursday: "THURSDAY",
  Friday: "FRIDAY",
  Saturday: "SATURDAY",
  Sunday: "SUNDAY",
};

function resolveTodayInWarsaw(): DayOfWeek | null {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Warsaw",
    weekday: "long",
  }).formatToParts(new Date());
  const weekday = parts.find((p) => p.type === "weekday")?.value;
  return weekday ? EN_DAY_MAP[weekday] ?? null : null;
}

function trim(value: string | null): string {
  return value ? value.slice(0, 5) : "";
}

interface Props {
  hours: OpeningHoursDto[] | undefined;
}

/**
 * Godziny otwarcia w układzie z paczki: dwie kolumny wierszy oddzielonych
 * cienką kreską, dzisiejszy dzień wyróżniony kropką i badge'em DZIŚ.
 */
export function OpeningHoursSection({ hours }: Props) {
  const byDay = new Map((hours ?? []).map((h) => [h.dayOfWeek, h]));
  const today = resolveTodayInWarsaw();
  const { data: settings } = usePublicSettings();

  return (
    <section id="hours" className="mt-24 border-t border-piec-ink/10">
      <PiecShell>
        <SectionHeading>Godziny otwarcia</SectionHeading>
        <div className="mt-5 grid max-w-[860px] gap-x-[72px] [grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr))]">
          {DAY_ORDER.map((day) => {
            const entry = byDay.get(day);
            const isToday = today === day;
            const isClosed = !entry || entry.closed;
            return (
              <div
                key={day}
                className="flex items-center justify-between gap-3 border-b border-piec-ink/10 py-3.5 text-[15.5px]"
              >
                <span
                  className={cn(
                    "flex items-center gap-2",
                    isToday ? "font-semibold text-piec-ink" : "text-piec-ink/65",
                  )}
                >
                  {isToday ? (
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
                  ) : null}
                  {DAY_LABELS[day]}
                  {isToday ? (
                    <span className="text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
                      dziś
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap font-semibold tabular-nums",
                    isClosed ? "text-piec-ink/50" : isToday ? "text-piec-ink" : "text-piec-ink/85",
                  )}
                >
                  {isClosed ? "zamknięte" : `${trim(entry.openTime)}–${trim(entry.closeTime)}`}
                </span>
              </div>
            );
          })}
        </div>
        {settings?.defaultPreparationMinutes ? (
          <p className="pb-4 pt-5 text-[13px] leading-[1.6] text-piec-ink/55">
            Zamówienia online przyjmujemy do {settings.defaultPreparationMinutes} minut przed
            zamknięciem.
          </p>
        ) : null}
      </PiecShell>
    </section>
  );
}
