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

export function OpeningHoursSection({ hours }: Props) {
  const byDay = new Map((hours ?? []).map((h) => [h.dayOfWeek, h]));
  const today = resolveTodayInWarsaw();

  return (
    <section id="hours" className="border-t border-slate-200 bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-4 md:px-8">
        <div className="mb-8 md:mb-10">
          <div className="mb-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-slate-400">
            Godziny otwarcia
          </div>
          <h2 className="text-[28px] font-semibold leading-[1.1] tracking-tight text-slate-900 md:text-[40px] md:leading-[1.05]">
            Kiedy zapraszamy
          </h2>
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-2.5 text-[14px] md:max-w-[460px]">
          {DAY_ORDER.map((day) => {
            const entry = byDay.get(day);
            const isToday = today === day;
            const isClosed = !entry || entry.closed;
            return (
              <div key={day} className="contents">
                <div
                  className={cn(
                    "flex items-center gap-2",
                    isToday
                      ? "font-semibold text-slate-900"
                      : "text-slate-600"
                  )}
                >
                  {isToday ? (
                    <span
                      aria-hidden="true"
                      className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"
                    />
                  ) : null}
                  <span>{DAY_LABELS[day]}</span>
                  {isToday ? (
                    <span className="ml-1 font-mono text-[11px] font-medium tracking-[0.18em] text-primary">
                      DZIŚ
                    </span>
                  ) : null}
                </div>
                <div
                  className={cn(
                    "text-right font-mono text-[13px] tabular-nums",
                    isToday
                      ? "font-semibold text-slate-900"
                      : "text-slate-500"
                  )}
                >
                  {isClosed
                    ? "Zamknięte"
                    : `${entry.openTime} – ${entry.closeTime}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
