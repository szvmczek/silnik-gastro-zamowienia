import type { DayOfWeek, OpeningHoursDto } from "@/shared/api/openingHoursApi";
import { cn } from "@/shared/lib/cn";

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

interface Props {
  hours: OpeningHoursDto[] | undefined;
}

/* OpeningHoursSection — F-007 retrofit pod bundle Stage 2 HoursSection.
   Centered max-w-720, table z border-radius 12px, każdy wiersz padding
   16px 24px (desktop) / 14px 16px (mobile). DZIŚ row bg primary-tint
   z DZIŚ label primary bg white text. */

export function OpeningHoursSection({ hours }: Props) {
  const byDay = new Map((hours ?? []).map((h) => [h.dayOfWeek, h]));
  const today = resolveTodayInWarsaw();

  return (
    <section
      id="hours"
      className="border-t border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-page))] py-12 md:py-20"
    >
      <div className="mx-auto max-w-[720px] px-4 md:px-8">
        <div className="mb-7 text-center md:mb-9">
          <div className="t-kicker t-kicker--accent mb-3">GODZINY OTWARCIA</div>
          <h2 className="text-[26px] font-extrabold leading-[1.1] tracking-[-0.025em] text-[rgb(var(--color-text-primary))] md:text-[40px]">
            Kiedy zapraszamy
            <span className="text-[rgb(var(--color-primary))]">.</span>
          </h2>
        </div>
        <div className="overflow-hidden rounded-[12px] border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))]">
          {DAY_ORDER.map((day, i) => {
            const entry = byDay.get(day);
            const isToday = today === day;
            const isClosed = !entry || entry.closed;
            const isLast = i === DAY_ORDER.length - 1;
            return (
              <div
                key={day}
                className={cn(
                  "flex items-center justify-between gap-4 px-4 py-3.5 md:px-6 md:py-4",
                  !isLast && "border-b border-[rgb(var(--color-border-card))]",
                  isToday && "bg-[rgb(var(--color-primary-tint))]"
                )}
              >
                <span
                  className={cn(
                    "inline-flex items-center gap-2 text-[14px] leading-none md:text-[15px]",
                    isToday
                      ? "font-semibold text-[rgb(var(--color-primary))]"
                      : "font-medium text-[rgb(var(--color-text-primary))]"
                  )}
                >
                  {DAY_LABELS[day]}
                  {isToday ? (
                    <span className="rounded-[3px] bg-[rgb(var(--color-primary))] px-1.5 py-1 font-mono text-[10px] font-bold uppercase leading-none tracking-[0.06em] text-white">
                      dziś
                    </span>
                  ) : null}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap font-mono text-[14px] tabular-nums md:text-[15px]",
                    isToday
                      ? "font-semibold text-[rgb(var(--color-primary))]"
                      : "font-medium text-[rgb(var(--color-text-body))]"
                  )}
                >
                  {isClosed
                    ? "Zamknięte"
                    : `${entry.openTime} – ${entry.closeTime}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
