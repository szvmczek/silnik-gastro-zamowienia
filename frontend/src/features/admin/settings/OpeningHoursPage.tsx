import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";

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
  return DAY_ORDER.map((day) =>
    byDay.get(day) ?? { dayOfWeek: day, closed: true, openTime: null, closeTime: null }
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
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      days: DAY_ORDER.map((d) => ({ dayOfWeek: d, closed: false, openTime: "", closeTime: "" })),
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
        problem?.detail ?? problem?.title ?? "Nie udało się zapisać godzin otwarcia"
      );
    },
  });

  if (isLoading) return <div className="text-sm text-slate-500">Ładowanie godzin…</div>;
  if (isError || !data)
    return <div className="text-sm text-red-600">Nie udało się pobrać godzin otwarcia.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Godziny otwarcia</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ustaw godziny dla każdego dnia tygodnia. Zaznacz "Zamknięte", jeśli lokal nie
          przyjmuje gości.
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-6"
        noValidate
      >
        <Card>
          <CardHeader>
            <CardTitle>Tydzień</CardTitle>
            <CardDescription>Zmiany zapisują się jednym przyciskiem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => {
              const closed = currentDays?.[index]?.closed ?? false;
              const rowErrors = errors.days?.[index];
              return (
                <div
                  key={field.id}
                  className="grid grid-cols-1 items-center gap-3 rounded-md border border-slate-200 p-3 sm:grid-cols-[140px_auto_1fr_1fr]"
                >
                  <div className="font-medium text-slate-700">
                    {DAY_LABELS[field.dayOfWeek]}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={closed}
                      onChange={(e) =>
                        setValue(`days.${index}.closed`, e.target.checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                    Zamknięte
                  </label>
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
                      disabled={closed}
                      {...register(`days.${index}.openTime`)}
                    />
                    {rowErrors?.openTime && (
                      <p className="mt-1 text-xs text-red-600">
                        {rowErrors.openTime.message as string}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label className="sr-only" htmlFor={`closeTime-${index}`}>
                      Zamknięcie
                    </Label>
                    <Input
                      id={`closeTime-${index}`}
                      type="time"
                      disabled={closed}
                      {...register(`days.${index}.closeTime`)}
                    />
                    {rowErrors?.closeTime && (
                      <p className="mt-1 text-xs text-red-600">
                        {rowErrors.closeTime.message as string}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={!isDirty || mutation.isPending}
            onClick={() => data && reset(toFormValues(data))}
          >
            Przywróć
          </Button>
          <Button type="submit" disabled={!isDirty || mutation.isPending}>
            {mutation.isPending ? "Zapisywanie…" : "Zapisz zmiany"}
          </Button>
        </div>
      </form>
    </div>
  );
}
