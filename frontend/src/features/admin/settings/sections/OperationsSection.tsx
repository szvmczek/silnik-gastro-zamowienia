import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, Check } from "lucide-react";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import {
  fetchAdminSettings,
  settingsToPayload,
  updateAdminSettings,
  type SettingsDto,
  type UpdateSettingsPayload,
} from "@/shared/api/settingsApi";
import { extractProblem } from "@/shared/api/client";
import { Switch } from "@/shared/components/ui/Switch";
import { SaveBar } from "../components/SaveBar";

// Bundle ref: docs/design/v2-stage4/section-operations.jsx.
// 4 SectionCards: prep time (auto-ETA baseline) / min order / manual close /
// payment methods (static, D-007). Form → settingsToPayload spread + override.

const ETA_CHIPS = [15, 25, 35, 45];
const MIN_ORDER_CHIPS = [0, 25, 35, 50];
const PREVIEW_CART = 28; // bundle fixed example cart value

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function isoToLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function localInputToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

function zl(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

const schema = z
  .object({
    defaultPreparationMinutes: z.coerce
      .number()
      .int("Liczba całkowita")
      .min(5, "Minimum 5 minut")
      .max(120, "Maksimum 120 minut"),
    minOrderAmount: z.coerce
      .number()
      .min(0, "Nie może być ujemne")
      .max(500, "Maksimum 500 zł"),
    manualClosed: z.boolean(),
    manualClosedReason: z.string().max(200, "Maksimum 200 znaków"),
    manualClosedUntil: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.manualClosed && v.manualClosedReason.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Powód jest wymagany gdy restauracja jest zamknięta",
        path: ["manualClosedReason"],
      });
    }
  });

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

function toFormInput(s: SettingsDto): FormInput {
  return {
    defaultPreparationMinutes: s.defaultPreparationMinutes,
    minOrderAmount: s.minOrderAmount,
    manualClosed: s.manualClosedReason != null,
    manualClosedReason: s.manualClosedReason ?? "",
    manualClosedUntil: isoToLocalInput(s.manualClosedUntil),
  };
}

export function OperationsSection() {
  const queryClient = useQueryClient();
  const query = useQuery<SettingsDto>({
    queryKey: ["admin", "settings"],
    queryFn: fetchAdminSettings,
  });

  const form = useForm<FormInput, undefined, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      defaultPreparationMinutes: 30,
      minOrderAmount: 0,
      manualClosed: false,
      manualClosedReason: "",
      manualClosedUntil: "",
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = form;

  useEffect(() => {
    if (query.data) reset(toFormInput(query.data));
  }, [query.data, reset]);

  const prepMin = Number(watch("defaultPreparationMinutes")) || 0;
  const minOrder = Number(watch("minOrderAmount")) || 0;
  const manualClosed = watch("manualClosed");
  const reason = watch("manualClosedReason");
  const until = watch("manualClosedUntil");

  const mutation = useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateAdminSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "settings"], updated);
      queryClient.invalidateQueries({ queryKey: ["public", "settings"] });
      reset(toFormInput(updated));
      toast.success("Ustawienia operacyjne zapisane");
    },
    onError: (err) => {
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zapisać ustawień");
    },
  });

  const onSubmit = handleSubmit((values: FormOutput) => {
    if (!query.data) return;
    const closed = values.manualClosed && values.manualClosedReason.trim().length > 0;
    mutation.mutate({
      ...settingsToPayload(query.data),
      defaultPreparationMinutes: values.defaultPreparationMinutes,
      minOrderAmount: values.minOrderAmount,
      manualClosedReason: closed ? values.manualClosedReason.trim() : null,
      manualClosedUntil: closed ? localInputToIso(values.manualClosedUntil) : null,
    });
  });

  const handleCancel = () => {
    if (query.data) reset(toFormInput(query.data));
  };

  if (query.isPending) {
    return (
      <>
        <AdminTopbar title="Operacje" />
        <div className="p-8 text-[14px]" style={{ color: "rgb(var(--color-text-muted))" }}>
          Ładowanie ustawień…
        </div>
      </>
    );
  }
  if (query.isError) {
    return (
      <>
        <AdminTopbar title="Operacje" />
        <div
          className="m-8 rounded-md p-3 text-sm"
          style={{
            border: "1px solid rgb(var(--status-cancelled) / 0.3)",
            background: "rgb(var(--status-cancelled-tint))",
            color: "rgb(var(--status-cancelled))",
          }}
        >
          Nie udało się pobrać ustawień. Odśwież stronę.
        </div>
      </>
    );
  }

  // Live ETA preview
  const etaDate = new Date(Date.now() + prepMin * 60_000);
  const etaLabel = `${pad2(etaDate.getHours())}:${pad2(etaDate.getMinutes())}`;

  // Live min-order message preview (bundle: fixed example cart)
  const missing = Math.max(0, minOrder - PREVIEW_CART);

  return (
    <>
      <AdminTopbar
        title="Operacje"
        metadata="ETA, minimum, zamknięcie, płatności"
      />
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="mx-auto max-w-[880px] p-8">
            <p
              className="m-0 mb-6 max-w-[640px] text-[14px]"
              style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.55 }}
            >
              Ustawienia operacyjne wpływające na przyjmowanie zamówień:
              domyślne czasy ETA, ręczne wyłączenie restauracji, dostępne
              metody płatności.
            </p>

            {/* Prep time */}
            <Card
              title="Domyślny czas przygotowania"
              sub="Bazowa wartość ETA dla nowych zamówień. Możesz nadpisać per zamówienie w panelu — to tylko punkt startowy."
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-[240px_1fr]">
                <div>
                  <FieldLabel hint="5–120 min">Minuty</FieldLabel>
                  <BigNumberInput
                    suffix="min"
                    {...register("defaultPreparationMinutes")}
                    min={5}
                    max={120}
                    step={5}
                  />
                  {errors.defaultPreparationMinutes && (
                    <FieldError>
                      {errors.defaultPreparationMinutes.message}
                    </FieldError>
                  )}
                  <ChipRow
                    values={ETA_CHIPS}
                    active={prepMin}
                    onPick={(v) =>
                      setValue("defaultPreparationMinutes", v, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
                <PreviewBox label="Podgląd ETA">
                  <div
                    className="mb-2 text-[13px]"
                    style={{ color: "rgb(var(--color-text-body))" }}
                  >
                    Nowe zamówienie złożone teraz dostanie ETA:
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-[32px] font-bold"
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "rgb(var(--color-primary))",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {etaLabel}
                    </span>
                    <span
                      className="text-[12px]"
                      style={{ color: "rgb(var(--color-text-muted))" }}
                    >
                      (teraz + {prepMin} min)
                    </span>
                  </div>
                </PreviewBox>
              </div>
            </Card>

            <div className="h-4" />

            {/* Min order */}
            <Card
              title="Minimum zamówienia"
              sub="Klient nie może złożyć zamówienia poniżej tej kwoty. Zostaw 0 jeśli bez minimum."
            >
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-[240px_1fr]">
                <div>
                  <FieldLabel hint="0–500 zł">Kwota minimalna</FieldLabel>
                  <BigNumberInput
                    suffix="zł"
                    {...register("minOrderAmount")}
                    min={0}
                    max={500}
                    step={5}
                  />
                  {errors.minOrderAmount && (
                    <FieldError>{errors.minOrderAmount.message}</FieldError>
                  )}
                  <ChipRow
                    values={MIN_ORDER_CHIPS}
                    active={minOrder}
                    onPick={(v) =>
                      setValue("minOrderAmount", v, {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                  />
                </div>
                <PreviewBox label="Podgląd komunikatu">
                  {minOrder <= 0 ? (
                    <div
                      className="text-[13px]"
                      style={{ color: "rgb(var(--color-text-body))" }}
                    >
                      Bez minimum — klient może zamówić dowolną kwotę.
                    </div>
                  ) : (
                    <>
                      <div
                        className="mb-2 text-[13px]"
                        style={{ color: "rgb(var(--color-text-body))" }}
                      >
                        Klient z koszykiem {zl(PREVIEW_CART)} zobaczy:
                      </div>
                      <div
                        className="rounded-lg px-3.5 py-2.5 text-[13px] font-semibold"
                        style={{
                          background: "rgb(var(--color-primary-tint))",
                          border: "1px solid rgba(230,57,70,0.18)",
                          color: "rgb(var(--color-primary))",
                          lineHeight: 1.45,
                        }}
                      >
                        {missing > 0
                          ? `„Brakuje ${zl(missing)} do minimalnej kwoty ${zl(minOrder)}.”`
                          : `„Koszyk spełnia minimum ${zl(minOrder)}.”`}
                      </div>
                    </>
                  )}
                </PreviewBox>
              </div>
            </Card>

            <div className="h-4" />

            {/* Temporary close */}
            <Card noPad>
              <div className="p-[22px]" style={{ paddingBottom: manualClosed ? 16 : 22 }}>
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3
                      className="m-0 mb-1 text-[15px] font-bold"
                      style={{ color: "rgb(var(--color-text-primary))" }}
                    >
                      Tymczasowe zamknięcie
                    </h3>
                    <div
                      className="text-[13px]"
                      style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.5 }}
                    >
                      Wstrzymuje przyjmowanie zamówień. Klienci zobaczą banner z
                      powodem na stronie głównej, a przycisk „Zamów" zostanie
                      wyłączony.
                    </div>
                  </div>
                  <Switch
                    checked={manualClosed}
                    onCheckedChange={(v) =>
                      setValue("manualClosed", v, { shouldDirty: true, shouldValidate: true })
                    }
                    aria-label="Tymczasowe zamknięcie"
                  />
                </div>
              </div>

              {manualClosed && (
                <div
                  className="px-[22px] py-5"
                  style={{
                    borderTop: "1px solid rgb(var(--color-border-subtle))",
                    background: "rgba(220,38,38,0.04)",
                  }}
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel required hint="max 200 znaków">
                        Powód
                      </FieldLabel>
                      <textarea
                        rows={2}
                        maxLength={200}
                        {...register("manualClosedReason")}
                        placeholder="np. Awaria pieca — wracamy o 18:00"
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: 8,
                          border: "1px solid rgb(var(--color-border-card))",
                          background: "rgb(var(--color-bg-card))",
                          fontSize: 14,
                          fontFamily: "inherit",
                          color: "rgb(var(--color-text-primary))",
                          lineHeight: 1.55,
                          resize: "vertical",
                          minHeight: 68,
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      {errors.manualClosedReason && (
                        <FieldError>{errors.manualClosedReason.message}</FieldError>
                      )}
                    </div>
                    <div>
                      <FieldLabel hint="opcjonalne">
                        Otwarcie planowane na
                      </FieldLabel>
                      <input
                        type="datetime-local"
                        {...register("manualClosedUntil")}
                        style={{
                          width: "100%",
                          height: 40,
                          padding: "0 12px",
                          borderRadius: 8,
                          border: "1px solid rgb(var(--color-border-card))",
                          background: "rgb(var(--color-bg-card))",
                          fontSize: 14,
                          fontFamily: "var(--font-mono)",
                          color: "rgb(var(--color-text-primary))",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <p
                        className="mt-1.5 text-[12px]"
                        style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.5 }}
                      >
                        Jeśli zostawisz puste, restauracja będzie zamknięta dopóki
                        nie wyłączysz tego ręcznie.
                      </p>
                    </div>
                  </div>

                  {/* Banner preview */}
                  <div className="mt-[18px]">
                    <div
                      className="mb-2 text-[11px] font-semibold uppercase"
                      style={{
                        letterSpacing: "0.06em",
                        color: "rgb(var(--color-text-muted))",
                      }}
                    >
                      Tak będzie wyglądać banner na stronie
                    </div>
                    <div
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{
                        background: "linear-gradient(180deg, #FEE2E2, #FCA5A5)",
                        border: "1px solid #DC2626",
                        color: "#7F1D1D",
                      }}
                    >
                      <AlertTriangle size={18} strokeWidth={1.8} aria-hidden />
                      <div className="flex-1">
                        <div className="text-[13px] font-bold">
                          Restauracja jest tymczasowo zamknięta
                        </div>
                        <div className="text-[12px]" style={{ color: "#991B1B" }}>
                          {reason.trim() || "Powód pojawi się tutaj"}
                          {until ? ` · do ${formatUntilPreview(until)}` : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <div className="h-4" />

            {/* Payment methods — static D-007 */}
            <Card
              title="Metody płatności"
              sub="W MVP wszystkie zamówienia są opłacane przy odbiorze lub dostawie."
            >
              <div
                className="mb-2.5 text-[11px] font-bold uppercase"
                style={{
                  letterSpacing: "0.06em",
                  color: "rgb(var(--color-text-muted))",
                }}
              >
                Aktywne
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                {[
                  { label: "Gotówka przy odbiorze", tag: "PICKUP" },
                  { label: "Gotówka przy dostawie", tag: "DELIVERY" },
                ].map((m) => (
                  <div
                    key={m.tag}
                    className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold"
                    style={{
                      background: "rgb(var(--status-ready-tint))",
                      border: "1px solid rgba(16,185,129,0.25)",
                    }}
                  >
                    <Check
                      size={14}
                      strokeWidth={2.4}
                      style={{ color: "rgb(var(--status-ready))" }}
                      aria-hidden
                    />
                    <span style={{ color: "rgb(var(--color-text-primary))" }}>
                      {m.label}
                    </span>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: "rgba(16,185,129,0.15)",
                        color: "rgb(var(--status-ready))",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {m.tag}
                    </span>
                  </div>
                ))}
              </div>
              <p
                className="m-0 text-[13px]"
                style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.55 }}
              >
                Płatności online (BLIK, Przelewy24, karty) — będą dodane w
                przyszłej aktualizacji.
              </p>
            </Card>
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

function formatUntilPreview(local: string): string {
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return local;
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/* ───────── primitives ───────── */

function Card({
  title,
  sub,
  noPad,
  children,
}: {
  title?: string;
  sub?: string;
  noPad?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl"
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
        padding: noPad ? 0 : 22,
      }}
    >
      {title && (
        <h3
          className="m-0 text-[15px] font-bold"
          style={{ color: "rgb(var(--color-text-primary))" }}
        >
          {title}
        </h3>
      )}
      {sub && (
        <p
          className="m-0 mb-4 mt-1 text-[13px]"
          style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.5 }}
        >
          {sub}
        </p>
      )}
      {title && !sub && <div style={{ height: 16 }} />}
      {children}
    </section>
  );
}

function FieldLabel({
  children,
  hint,
  required,
}: {
  children: React.ReactNode;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-1.5 flex items-baseline gap-1.5">
      <span
        className="text-[13px] font-semibold"
        style={{ color: "rgb(var(--color-text-body))" }}
      >
        {children}
        {required && (
          <span className="ml-0.5" style={{ color: "rgb(var(--color-primary))" }} aria-hidden>
            *
          </span>
        )}
      </span>
      {hint && (
        <span className="text-[12px]" style={{ color: "rgb(var(--color-text-faint))" }}>
          · {hint}
        </span>
      )}
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-[12px]" style={{ color: "rgb(var(--status-cancelled))" }}>
      {children}
    </p>
  );
}

interface BigNumberInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  suffix: string;
}

const BigNumberInput = ((props: BigNumberInputProps) => {
  const { suffix, style, ...rest } = props;
  return (
    <div style={{ position: "relative" }}>
      <input
        type="number"
        {...rest}
        style={{
          width: "100%",
          height: 44,
          padding: "0 64px 0 16px",
          borderRadius: 8,
          border: "1px solid rgb(var(--color-border-card))",
          background: "rgb(var(--color-bg-card))",
          fontFamily: "var(--font-mono)",
          fontSize: 18,
          fontWeight: 600,
          color: "rgb(var(--color-text-primary))",
          outline: "none",
          boxSizing: "border-box",
          ...style,
        }}
      />
      <span
        className="text-[13px]"
        style={{
          position: "absolute",
          right: 16,
          top: 13,
          color: "rgb(var(--color-text-muted))",
          pointerEvents: "none",
        }}
      >
        {suffix}
      </span>
    </div>
  );
}) as React.FC<BigNumberInputProps>;

function ChipRow({
  values,
  active,
  onPick,
}: {
  values: number[];
  active: number;
  onPick: (v: number) => void;
}) {
  return (
    <div className="mt-2 flex gap-1.5">
      {values.map((v) => {
        const isActive = v === active;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onPick(v)}
            className="h-[26px] rounded-md px-2.5 text-[11px] font-semibold"
            style={{
              fontFamily: "var(--font-mono)",
              border: `1px solid ${
                isActive
                  ? "rgb(var(--color-primary))"
                  : "rgb(var(--color-border-card))"
              }`,
              background: isActive
                ? "rgb(var(--color-primary-tint))"
                : "rgb(var(--color-bg-card))",
              color: isActive
                ? "rgb(var(--color-primary))"
                : "rgb(var(--color-text-muted))",
              cursor: "pointer",
            }}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}

function PreviewBox({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl px-5 py-[18px]"
      style={{
        background:
          "linear-gradient(135deg, rgb(var(--color-bg-section)), #FFFFFF)",
        border: "1px solid rgb(var(--color-border-subtle))",
      }}
    >
      <div
        className="mb-2 text-[11px] font-semibold uppercase"
        style={{
          letterSpacing: "0.06em",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}
