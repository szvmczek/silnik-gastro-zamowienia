import { useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Clock, Info } from "lucide-react";
import {
  fetchAdminOpeningHours,
  updateAdminOpeningHours,
  type DayOfWeek,
  type OpeningHoursDto,
} from "@/shared/api/openingHoursApi";
import { extractProblem } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Switch } from "@/shared/components/ui/Switch";
import { cn } from "@/shared/lib/cn";
import { SettingsShell } from "./components/SettingsShell";

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

const TIME_RE = /^\d{2}:\d{2}$/;

const entrySchema = z
  .object({
    dayOfWeek: z.enum(DAY_ORDER as [DayOfWeek, ...DayOfWeek[]]),
    closed: z.boolean(),
    openTime: z.string().optional(),
    closeTime: z.string().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.closed) return;
    if (!value.openTime || !TIME_RE.test(value.openTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wymagane HH:MM",
        path: ["openTime"],
      });
      return;
    }
    if (!value.closeTime || !TIME_RE.test(value.closeTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Wymagane HH:MM",
        path: ["closeTime"],
      });
      return;
    }
    // Domain rule: closeTime "00:00" means midnight end-of-day.
    // Any other case requires openTime < closeTime strictly.
    const closesAtMidnight = value.closeTime === "00:00";
    const validRange = closesAtMidnight
      ? value.openTime !== "00:00"
      : value.openTime < value.closeTime;
    if (!validRange) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Zamknięcie musi być później niż otwarcie (00:00 oznacza północ)",
        path: ["closeTime"],
      });
    }
  });

const schema = z.object({
  days: z.array(entrySchema).length(7),
});

type FormValues = z.infer<typeof schema>;

function sortAndFill(rows: OpeningHoursDto[]): OpeningHoursDto[] {
  const byDay = new Map(rows.map((r) => [r.dayOfWeek, r]));
  return DAY_ORDER.map(
    (day) =>
      byDay.get(day) ?? {
        dayOfWeek: day,
        closed: true,
        openTime: null,
        closeTime: null,
      }
  );
}

function toFormValues(rows: OpeningHoursDto[]): FormValues {
  return {
    days: sortAndFill(rows).map((r) => ({
      dayOfWeek: r.dayOfWeek,
      closed: r.closed,
      openTime: r.openTime ?? "",
      closeTime: r.closeTime ?? "",
    })),
  };
}

export function OpeningHoursPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "opening-hours"],
    queryFn: fetchAdminOpeningHours,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      days: DAY_ORDER.map((d) => ({
        dayOfWeek: d,
        closed: false,
        openTime: "",
        closeTime: "",
      })),
    },
  });

  const { fields } = useFieldArray({ control, name: "days" });
  const currentDays = watch("days");

  useEffect(() => {
    if (data) reset(toFormValues(data));
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateAdminOpeningHours({
        days: values.days.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          closed: d.closed,
          openTime: d.closed ? null : d.openTime || null,
          closeTime: d.closed ? null : d.closeTime || null,
        })),
      }),
    onSuccess: (rows) => {
      queryClient.setQueryData(["admin", "opening-hours"], rows);
      queryClient.invalidateQueries({ queryKey: ["public", "opening-hours"] });
      reset(toFormValues(rows));
      toast.success("Godziny otwarcia zapisane");
    },
    onError: (error) => {
      const problem = extractProblem(error);
      toast.error(
        problem?.detail ??
          problem?.title ??
          "Nie udało się zapisać godzin otwarcia"
      );
    },
  });

  if (isLoading) {
    return (
      <SettingsShell>
        <div className="text-sm text-slate-500">Ładowanie godzin…</div>
      </SettingsShell>
    );
  }
  if (isError || !data) {
    return (
      <SettingsShell>
        <div className="text-sm text-rose-600">
          Nie udało się pobrać godzin otwarcia.
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell description="Ustaw godziny dla każdego dnia tygodnia. Wyświetlają się w hero, sekcji Godziny otwarcia i blokują checkout poza nimi.">
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-5"
        noValidate
      >
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <header className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
              <Clock className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
                Tydzień
              </h2>
              <p className="mt-0.5 text-[13px] text-slate-500">
                Przełącznik decyduje, czy lokal działa danego dnia.
              </p>
            </div>
          </header>

          <ul className="divide-y divide-slate-100 -mx-2">
            {fields.map((field, index) => {
              const closed = currentDays?.[index]?.closed ?? false;
              const open = !closed;
              const rowErrors = errors.days?.[index];
              return (
                <li
                  key={field.id}
                  className="grid grid-cols-1 items-center gap-4 px-2 py-4 sm:grid-cols-[140px_180px_1fr]"
                >
                  <div className="text-[14px] font-medium text-slate-900">
                    {DAY_LABELS[field.dayOfWeek]}
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Controller
                      control={control}
                      name={`days.${index}.closed`}
                      render={({ field: closedField }) => (
                        <Switch
                          checked={!closedField.value}
                          onCheckedChange={(next) => closedField.onChange(!next)}
                          aria-label={`${DAY_LABELS[field.dayOfWeek]}: ${
                            open ? "otwarte" : "zamknięte"
                          }`}
                        />
                      )}
                    />
                    <span
                      className={cn(
                        "text-[13px]",
                        open ? "text-slate-900" : "text-slate-400"
                      )}
                    >
                      {open ? "Otwarte" : "Zamknięte"}
                    </span>
                  </div>

                  {open ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <div>
                        <Label
                          className="sr-only"
                          htmlFor={`openTime-${index}`}
                        >
                          Otwarcie
                        </Label>
                        <Input
                          id={`openTime-${index}`}
                          type="time"
                          className="w-28 font-mono text-center"
                          error={Boolean(rowErrors?.openTime)}
                          {...register(`days.${index}.openTime`)}
                        />
                      </div>
                      <span className="text-[13px] text-slate-400">—</span>
                      <div>
                        <Label
                          className="sr-only"
                          htmlFor={`closeTime-${index}`}
                        >
                          Zamknięcie
                        </Label>
                        <Input
                          id={`closeTime-${index}`}
                          type="time"
                          className="w-28 font-mono text-center"
                          error={Boolean(rowErrors?.closeTime)}
                          {...register(`days.${index}.closeTime`)}
                        />
                      </div>
                      {(rowErrors?.openTime || rowErrors?.closeTime) && (
                        <p className="basis-full text-[12px] text-rose-600">
                          {(rowErrors.closeTime?.message as string) ??
                            (rowErrors.openTime?.message as string)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-[13px] text-slate-400">
                      Zamknięte cały dzień
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <div className="flex items-start gap-3 rounded-md border border-sky-200 bg-sky-50 p-4 text-[13px] text-sky-900">
          <Info className="mt-0.5 h-4 w-4 flex-none" />
          <div>
            <strong className="font-semibold">Tylko regularny tydzień.</strong>{" "}
            Wyjątki świąteczne i specjalne godziny będą dostępne w kolejnej
            wersji panelu.
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            disabled={!isDirty || mutation.isPending}
            onClick={() => data && reset(toFormValues(data))}
          >
            Przywróć
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isDirty || mutation.isPending}
          >
            {mutation.isPending ? (
              "Zapisywanie…"
            ) : (
              <>
                <Check className="h-4 w-4" />
                Zapisz zmiany
              </>
            )}
          </Button>
        </div>
      </form>
    </SettingsShell>
  );
}
