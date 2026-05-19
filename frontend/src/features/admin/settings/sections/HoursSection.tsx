import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Clock, Info } from "lucide-react";
import { Popover } from "radix-ui";
import {
  fetchAdminOpeningHours,
  updateAdminOpeningHours,
  type DayOfWeek,
  type OpeningHoursDto,
  type UpdateOpeningHoursPayload,
} from "@/shared/api/openingHoursApi";
import { extractProblem } from "@/shared/api/client";
import { Switch } from "@/shared/components/ui/Switch";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { SaveBar } from "../components/SaveBar";

// Bundle ref: docs/design/v2-stage4/section-hours.jsx.
// 7-day table z toggle + native HH:MM picker + copy-to popover (N14 A) +
// live preview row z DZIŚ highlight + Wyjątki świąteczne info banner.

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

interface DayMeta {
  short: string;
  long: string;
}

const DAY_META: Record<DayOfWeek, DayMeta> = {
  MONDAY: { short: "Pn", long: "Poniedziałek" },
  TUESDAY: { short: "Wt", long: "Wtorek" },
  WEDNESDAY: { short: "Śr", long: "Środa" },
  THURSDAY: { short: "Cz", long: "Czwartek" },
  FRIDAY: { short: "Pt", long: "Piątek" },
  SATURDAY: { short: "So", long: "Sobota" },
  SUNDAY: { short: "Nd", long: "Niedziela" },
};

const TIME_RE = /^\d{2}:\d{2}$/;

const dayEntrySchema = z
  .object({
    dayOfWeek: z.enum(DAY_ORDER as [DayOfWeek, ...DayOfWeek[]]),
    closed: z.boolean(),
    openTime: z.string(),
    closeTime: z.string(),
  })
  .superRefine((value, ctx) => {
    if (value.closed) return;
    if (!TIME_RE.test(value.openTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "HH:MM",
        path: ["openTime"],
      });
      return;
    }
    if (!TIME_RE.test(value.closeTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "HH:MM",
        path: ["closeTime"],
      });
      return;
    }
    // Domain rule (V5 migration): closeTime "00:00" = midnight end-of-day.
    const closesAtMidnight = value.closeTime === "00:00";
    const validRange = closesAtMidnight
      ? value.openTime !== "00:00"
      : value.openTime < value.closeTime;
    if (!validRange) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Zamknięcie musi być po otwarciu (00:00 = północ)",
        path: ["closeTime"],
      });
    }
  });

const formSchema = z.object({
  days: z.array(dayEntrySchema).length(7),
});

type FormValues = z.infer<typeof formSchema>;

function sortAndFill(rows: OpeningHoursDto[]): OpeningHoursDto[] {
  const byDay = new Map(rows.map((r) => [r.dayOfWeek, r]));
  return DAY_ORDER.map(
    (day) =>
      byDay.get(day) ?? {
        dayOfWeek: day,
        closed: true,
        openTime: null,
        closeTime: null,
      },
  );
}

function toFormValues(rows: OpeningHoursDto[]): FormValues {
  return {
    days: sortAndFill(rows).map((r) => ({
      dayOfWeek: r.dayOfWeek,
      closed: r.closed,
      openTime: r.openTime ?? "11:00",
      closeTime: r.closeTime ?? "23:00",
    })),
  };
}

// JS getDay: Sun=0,...,Sat=6. Map to DAY_ORDER index (Mon=0,...,Sun=6).
function todayDayOfWeek(): DayOfWeek {
  const js = new Date().getDay();
  // js 0 (Sun) -> 6, js 1..6 (Mon..Sat) -> 0..5
  const idx = js === 0 ? 6 : js - 1;
  return DAY_ORDER[idx];
}

export function HoursSection() {
  const queryClient = useQueryClient();
  const query = useQuery<OpeningHoursDto[]>({
    queryKey: ["admin", "opening-hours"],
    queryFn: fetchAdminOpeningHours,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      days: DAY_ORDER.map((day) => ({
        dayOfWeek: day,
        closed: day === "SUNDAY",
        openTime: "11:00",
        closeTime: "23:00",
      })),
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = form;

  const { fields } = useFieldArray({ control, name: "days" });

  useEffect(() => {
    if (query.data) reset(toFormValues(query.data));
  }, [query.data, reset]);

  const today = useMemo(() => todayDayOfWeek(), []);
  const watchedDays = watch("days");

  const mutation = useMutation({
    mutationFn: (payload: UpdateOpeningHoursPayload) =>
      updateAdminOpeningHours(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "opening-hours"], updated);
      queryClient.invalidateQueries({ queryKey: ["public", "opening-hours"] });
      reset(toFormValues(updated));
      toast.success("Godziny otwarcia zapisane");
    },
    onError: (err) => {
      toast.error(
        extractProblem(err)?.detail ?? "Nie udało się zapisać godzin otwarcia",
      );
    },
  });

  const onSubmit = handleSubmit((values) => {
    const payload: UpdateOpeningHoursPayload = {
      days: values.days.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        closed: d.closed,
        openTime: d.closed ? null : d.openTime,
        closeTime: d.closed ? null : d.closeTime,
      })),
    };
    mutation.mutate(payload);
  });

  const handleCancel = () => {
    if (query.data) reset(toFormValues(query.data));
  };

  const copyToDays = (sourceIdx: number, targetDays: DayOfWeek[]) => {
    const src = getValues(`days.${sourceIdx}`);
    const allDays = getValues("days");
    const updated = allDays.map((d, i) => {
      if (i === sourceIdx) return d;
      if (!targetDays.includes(d.dayOfWeek)) return d;
      return {
        ...d,
        closed: src.closed,
        openTime: src.openTime,
        closeTime: src.closeTime,
      };
    });
    setValue("days", updated, { shouldDirty: true, shouldValidate: true });
    const labels = targetDays.map((d) => DAY_META[d].long).join(", ");
    toast.success(`Skopiowano na: ${labels}`);
  };

  if (query.isPending) {
    return (
      <>
        <AdminTopbar title="Godziny otwarcia" />
        <div
          className="p-8 text-[14px]"
          style={{ color: "rgb(var(--color-text-muted))" }}
        >
          Ładowanie godzin…
        </div>
      </>
    );
  }
  if (query.isError) {
    return (
      <>
        <AdminTopbar title="Godziny otwarcia" />
        <div
          className="m-8 rounded-md p-3 text-sm"
          style={{
            border: "1px solid rgb(var(--status-cancelled) / 0.3)",
            background: "rgb(var(--status-cancelled-tint))",
            color: "rgb(var(--status-cancelled))",
          }}
        >
          Nie udało się pobrać godzin. Odśwież stronę.
        </div>
      </>
    );
  }

  return (
    <>
      <AdminTopbar
        title="Godziny otwarcia"
        metadata="Harmonogram tygodniowy"
      />
      <form
        onSubmit={onSubmit}
        className="flex min-h-0 flex-1 flex-col"
        noValidate
      >
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="mx-auto max-w-[1080px] p-8">
            <p
              className="m-0 mb-6 max-w-[640px] text-[14px]"
              style={{
                color: "rgb(var(--color-text-muted))",
                lineHeight: 1.55,
              }}
            >
              Standardowy harmonogram tygodniowy. Dni oznaczone jako zamknięte
              nie przyjmują zamówień. Wyjątki świąteczne pojawią się w kolejnym
              wydaniu.
            </p>

            {/* Hours table */}
            <section
              className="rounded-xl"
              style={{
                background: "rgb(var(--color-bg-card))",
                border: "1px solid rgb(var(--color-border-card))",
                padding: 4,
              }}
            >
              <div
                className="grid items-center gap-3 px-[18px] py-3 text-[11px] font-bold uppercase"
                style={{
                  gridTemplateColumns: "180px 80px 220px 1fr",
                  borderBottom: "1px solid rgb(var(--color-border-subtle))",
                  color: "rgb(var(--color-text-muted))",
                  letterSpacing: "0.06em",
                }}
              >
                <span>Dzień</span>
                <span>Otwarte</span>
                <span>Godziny</span>
                <span></span>
              </div>

              {fields.map((field, idx) => {
                const day = field.dayOfWeek;
                const isToday = day === today;
                const closed = watchedDays[idx]?.closed ?? false;
                const error = errors.days?.[idx];
                return (
                  <div
                    key={field.id}
                    className="grid items-center gap-3 px-[18px] py-3.5"
                    style={{
                      gridTemplateColumns: "180px 80px 220px 1fr",
                      borderBottom:
                        idx < fields.length - 1
                          ? "1px solid rgb(var(--color-border-subtle))"
                          : "none",
                      background: isToday
                        ? "rgba(230,57,70,0.04)"
                        : "transparent",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="grid h-7 w-7 place-items-center rounded-md text-[11px] font-bold"
                        style={{
                          background: isToday
                            ? "rgb(var(--color-primary))"
                            : "rgb(var(--color-bg-section))",
                          color: isToday
                            ? "#fff"
                            : "rgb(var(--color-text-muted))",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {DAY_META[day].short}
                      </span>
                      <span
                        className="text-[14px] font-semibold"
                        style={{
                          color: closed
                            ? "rgb(var(--color-text-muted))"
                            : "rgb(var(--color-text-primary))",
                        }}
                      >
                        {DAY_META[day].long}
                        {isToday && (
                          <span
                            className="ml-1.5 text-[10px] font-bold uppercase"
                            style={{
                              letterSpacing: "0.06em",
                              color: "rgb(var(--color-primary))",
                            }}
                          >
                            · dziś
                          </span>
                        )}
                      </span>
                    </div>

                    <Controller
                      control={control}
                      name={`days.${idx}.closed`}
                      render={({ field: f }) => (
                        <Switch
                          checked={!f.value}
                          onCheckedChange={(open) => f.onChange(!open)}
                        />
                      )}
                    />

                    <div className="flex items-center gap-2">
                      <TimeInput
                        {...register(`days.${idx}.openTime`)}
                        disabled={closed}
                        ariaLabel={`${DAY_META[day].long} — otwarcie`}
                      />
                      <span
                        className="text-[13px]"
                        style={{ color: "rgb(var(--color-text-faint))" }}
                      >
                        —
                      </span>
                      <TimeInput
                        {...register(`days.${idx}.closeTime`)}
                        disabled={closed}
                        ariaLabel={`${DAY_META[day].long} — zamknięcie`}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      {error?.closeTime?.message && (
                        <span
                          className="text-[11px]"
                          style={{ color: "rgb(var(--status-cancelled))" }}
                        >
                          {error.closeTime.message}
                        </span>
                      )}
                      {!closed ? (
                        <CopyToPopover
                          sourceDay={day}
                          onCopy={(days) => copyToDays(idx, days)}
                        />
                      ) : (
                        <span
                          className="rounded-full px-2.5 py-1 text-[12px] font-semibold"
                          style={{
                            background: "rgb(var(--color-bg-section))",
                            color: "rgb(var(--color-text-muted))",
                          }}
                        >
                          Zamknięte
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Live preview row */}
            <div className="mt-6">
              <div
                className="mb-2.5 text-[11px] font-bold uppercase"
                style={{
                  letterSpacing: "0.06em",
                  color: "rgb(var(--color-text-muted))",
                }}
              >
                Tak będzie wyglądać na stronie
              </div>
              <div
                className="grid max-w-[760px] overflow-hidden rounded-xl bg-white"
                style={{
                  gridTemplateColumns: "repeat(7, 1fr)",
                  border: "1px solid rgb(var(--color-border-card))",
                }}
              >
                {watchedDays.map((d, i) => {
                  const isTodayChip = d.dayOfWeek === today;
                  return (
                    <div
                      key={d.dayOfWeek}
                      className="text-center"
                      style={{
                        padding: "14px 10px",
                        borderRight:
                          i < watchedDays.length - 1
                            ? "1px solid rgb(var(--color-border-subtle))"
                            : "none",
                        background: isTodayChip
                          ? "rgb(var(--color-primary))"
                          : "transparent",
                        color: isTodayChip
                          ? "#fff"
                          : "rgb(var(--color-text-primary))",
                      }}
                    >
                      <div
                        className="mb-1 text-[11px] font-bold uppercase"
                        style={{
                          letterSpacing: "0.06em",
                          color: isTodayChip
                            ? "rgba(255,255,255,0.85)"
                            : "rgb(var(--color-text-muted))",
                        }}
                      >
                        {DAY_META[d.dayOfWeek].short}
                      </div>
                      <div
                        className="text-[13px] font-semibold"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color: isTodayChip
                            ? "#fff"
                            : d.closed
                              ? "rgb(var(--color-text-faint))"
                              : "rgb(var(--color-text-primary))",
                        }}
                      >
                        {d.closed ? "—" : `${d.openTime}–${d.closeTime}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Wyjątki świąteczne info banner */}
            <div
              className="mt-6 flex max-w-[760px] items-start gap-3 rounded-xl px-4 py-3.5"
              style={{
                background: "rgba(244, 162, 97, 0.08)",
                border: "1px solid rgba(244, 162, 97, 0.25)",
              }}
            >
              <Info
                size={16}
                strokeWidth={1.6}
                style={{ color: "#9A5A1F", marginTop: 2 }}
                aria-hidden
              />
              <div
                className="text-[13px]"
                style={{ color: "#7A4818", lineHeight: 1.5 }}
              >
                <strong style={{ fontWeight: 700 }}>
                  Wyjątki świąteczne
                </strong>{" "}
                (np. zamknięcie 25 grudnia, zmiany w okresie świątecznym) —
                będą dostępne w sekcji <em>Limity zamówień</em> w jednym z
                kolejnych wydań.
              </div>
            </div>
          </div>
        </div>
        <SaveBar
          isDirty={isDirty}
          pending={mutation.isPending}
          onCancel={handleCancel}
          onSave={onSubmit}
        />
      </form>
    </>
  );
}

/* ───────── primitives ───────── */

interface TimeInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  ariaLabel: string;
}

const TimeInput = ((props: TimeInputProps) => {
  const { disabled, ariaLabel, style, className, ...rest } = props;
  return (
    <div
      className={className}
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <input
        type="time"
        aria-label={ariaLabel}
        disabled={disabled}
        {...rest}
        style={{
          height: 36,
          padding: "0 32px 0 10px",
          borderRadius: 8,
          border: "1px solid rgb(var(--color-border-card))",
          background: disabled
            ? "rgb(var(--color-bg-section))"
            : "rgb(var(--color-bg-card))",
          color: disabled
            ? "rgb(var(--color-text-faint))"
            : "rgb(var(--color-text-primary))",
          fontFamily: "var(--font-mono)",
          fontSize: 14,
          fontWeight: 600,
          minWidth: 100,
          outline: "none",
          cursor: disabled ? "not-allowed" : "text",
          ...style,
        }}
      />
      <Clock
        size={12}
        strokeWidth={1.6}
        style={{
          position: "absolute",
          right: 10,
          color: disabled
            ? "rgb(var(--color-text-faint))"
            : "rgb(var(--color-text-muted))",
          pointerEvents: "none",
        }}
        aria-hidden
      />
    </div>
  );
}) as React.FC<TimeInputProps & { ref?: React.Ref<HTMLInputElement> }>;
// react-hook-form passes ref via register; spread the ...rest including ref.
// Type cast for forwarding ref through plain function component.

interface CopyToPopoverProps {
  sourceDay: DayOfWeek;
  onCopy: (days: DayOfWeek[]) => void;
}

function CopyToPopover({ sourceDay, onCopy }: CopyToPopoverProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<DayOfWeek>>(new Set());

  const otherDays = DAY_ORDER.filter((d) => d !== sourceDay);

  const toggle = (day: DayOfWeek) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(otherDays));
  const selectNone = () => setSelected(new Set());

  const apply = () => {
    if (selected.size === 0) return;
    onCopy(DAY_ORDER.filter((d) => selected.has(d)));
    setOpen(false);
    setSelected(new Set());
  };

  return (
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setSelected(new Set());
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          className="h-[30px] rounded-md px-3 text-[12px] font-medium"
          style={{
            border: "1px solid rgb(var(--color-border-card))",
            background: "transparent",
            color: "rgb(var(--color-text-body))",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Skopiuj na inne dni
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={6}
          className="z-50 w-[280px] rounded-xl shadow-lg"
          style={{
            background: "rgb(var(--color-bg-card))",
            border: "1px solid rgb(var(--color-border-card))",
            padding: 14,
          }}
        >
          <div
            className="mb-2 text-[11px] font-bold uppercase"
            style={{
              letterSpacing: "0.06em",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            Skopiuj z {DAY_META[sourceDay].long}
          </div>
          <div className="mb-3 flex flex-col gap-1">
            {otherDays.map((d) => {
              const checked = selected.has(d);
              return (
                <label
                  key={d}
                  className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px]"
                  style={{
                    color: "rgb(var(--color-text-body))",
                    background: checked
                      ? "rgb(var(--color-primary-tint))"
                      : "transparent",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(d)}
                    className="h-4 w-4 cursor-pointer accent-[rgb(var(--color-primary))]"
                  />
                  <span className="font-medium">{DAY_META[d].long}</span>
                </label>
              );
            })}
          </div>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="flex-1 rounded-md py-1.5 text-[11px] font-semibold"
              style={{
                border: "1px solid rgb(var(--color-border-card))",
                background: "transparent",
                color: "rgb(var(--color-text-body))",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Zaznacz wszystkie
            </button>
            <button
              type="button"
              onClick={selectNone}
              className="flex-1 rounded-md py-1.5 text-[11px] font-semibold"
              style={{
                border: "1px solid rgb(var(--color-border-card))",
                background: "transparent",
                color: "rgb(var(--color-text-body))",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Wyczyść
            </button>
          </div>
          <button
            type="button"
            onClick={apply}
            disabled={selected.size === 0}
            className="h-9 w-full rounded-md text-[13px] font-semibold text-white"
            style={{
              border: "none",
              background:
                selected.size === 0 ? "#D4D0C2" : "rgb(var(--color-primary))",
              cursor: selected.size === 0 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Skopiuj na wybrane ({selected.size})
          </button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
