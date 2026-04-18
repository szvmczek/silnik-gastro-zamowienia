import type { DayOfWeek, OpeningHoursDto } from "@/shared/api/openingHoursApi";

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

interface Props {
  hours: OpeningHoursDto[] | undefined;
}

export function OpeningHoursSection({ hours }: Props) {
  const byDay = new Map((hours ?? []).map((h) => [h.dayOfWeek, h]));

  return (
    <section id="hours" className="bg-white py-16">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-semibold text-slate-900">Godziny otwarcia</h2>
        <p className="mt-2 text-sm text-slate-500">
          Zapraszamy w wybrane dni tygodnia.
        </p>
        <ul className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200">
          {DAY_ORDER.map((day) => {
            const entry = byDay.get(day);
            return (
              <li key={day} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium text-slate-700">{DAY_LABELS[day]}</span>
                <span className="text-sm text-slate-600">
                  {!entry || entry.closed
                    ? "Zamknięte"
                    : `${entry.openTime} – ${entry.closeTime}`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
