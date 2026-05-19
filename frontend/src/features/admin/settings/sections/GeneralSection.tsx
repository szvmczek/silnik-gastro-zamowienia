import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import {
  fetchAdminSettings,
  updateAdminSettings,
  type SettingsDto,
  type UpdateSettingsPayload,
} from "@/shared/api/settingsApi";
import { extractProblem } from "@/shared/api/client";
import { applyPrimaryColor } from "@/shared/theme/themeLoader";
import { SaveBar } from "../components/SaveBar";

// Bundle ref: docs/design/v2-stage4/section-general.jsx (D-005 + D-008).
// 6 brand presets per D-008 — frontend constant, nie DTO field.
const BRAND_PRESETS = [
  { name: "Pomidorowy", hex: "#E63946" },
  { name: "Bazylia", hex: "#2A8A4E" },
  { name: "Dynia", hex: "#E07A1F" },
  { name: "Oliwka", hex: "#5A6B3A" },
  { name: "Indygo", hex: "#3B5BDB" },
  { name: "Grafit", hex: "#1F2937" },
] as const;

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;
const URL_RE = /^https?:\/\/.+/;

const optionalUrl = (max: number) =>
  z
    .union([z.literal(""), z.string().max(max).regex(URL_RE, "URL musi zaczynać się od http:// lub https://")])
    .transform((v) => (v === "" ? null : v));

const optionalString = (max: number) =>
  z
    .union([z.literal(""), z.string().max(max)])
    .transform((v) => (v === "" ? null : v));

const optionalEmail = z
  .union([z.literal(""), z.string().email("Nieprawidłowy email").max(200)])
  .transform((v) => (v === "" ? null : v));

const schema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(120),
  tagline: optionalString(200),
  seoDescription: optionalString(200),
  email: optionalEmail,
  phone: optionalString(40),
  addressLine: optionalString(200),
  city: optionalString(100),
  postalCode: optionalString(20),
  googleMapsUrl: optionalUrl(500),
  primaryColor: z.string().regex(HEX_RE, "Kolor musi być w formacie #RRGGBB"),
  logoUrl: optionalUrl(500),
  socialFacebook: optionalUrl(500),
  socialInstagram: optionalUrl(500),
  currency: z
    .string()
    .length(3, "Waluta musi mieć 3 znaki")
    .transform((v) => v.toUpperCase()),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

const toFormInput = (s: SettingsDto): FormInput => ({
  name: s.name,
  tagline: s.tagline ?? "",
  seoDescription: s.seoDescription ?? "",
  email: s.email ?? "",
  phone: s.phone ?? "",
  addressLine: s.addressLine ?? "",
  city: s.city ?? "",
  postalCode: s.postalCode ?? "",
  googleMapsUrl: s.googleMapsUrl ?? "",
  primaryColor: s.primaryColor,
  logoUrl: s.logoUrl ?? "",
  socialFacebook: s.socialFacebook ?? "",
  socialInstagram: s.socialInstagram ?? "",
  currency: s.currency,
});

export function GeneralSection() {
  const queryClient = useQueryClient();
  const query = useQuery<SettingsDto>({
    queryKey: ["admin", "settings"],
    queryFn: fetchAdminSettings,
  });

  const form = useForm<FormInput, undefined, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: toFormInput({
      id: 1,
      name: "",
      tagline: null,
      primaryColor: "#E63946",
      phone: null,
      email: null,
      addressLine: null,
      city: null,
      postalCode: null,
      logoUrl: null,
      currency: "PLN",
      seoDescription: null,
      googleMapsUrl: null,
      socialFacebook: null,
      socialInstagram: null,
      updatedAt: "",
    }),
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

  const liveColor = watch("primaryColor") ?? "#E63946";
  const liveName = watch("name") || "Pizza Demo";
  const liveTagline = watch("tagline") || "Smacznie i szybko. Dostawa do 35 minut.";
  const liveCity = watch("city") || "Łomianki";
  const previewBrandInitial = (liveName.trim().charAt(0) || "P").toUpperCase();
  const previewBgValid = HEX_RE.test(liveColor);

  const mutation = useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateAdminSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "settings"], updated);
      queryClient.invalidateQueries({ queryKey: ["public", "settings"] });
      applyPrimaryColor(updated.primaryColor);
      reset(toFormInput(updated));
      toast.success("Ustawienia zapisane");
    },
    onError: (err) => {
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zapisać ustawień");
    },
  });

  const onSubmit = handleSubmit((values: FormOutput) => {
    mutation.mutate({
      name: values.name,
      tagline: values.tagline,
      primaryColor: values.primaryColor,
      phone: values.phone,
      email: values.email,
      addressLine: values.addressLine,
      city: values.city,
      postalCode: values.postalCode,
      logoUrl: values.logoUrl,
      currency: values.currency,
      seoDescription: values.seoDescription,
      googleMapsUrl: values.googleMapsUrl,
      socialFacebook: values.socialFacebook,
      socialInstagram: values.socialInstagram,
    });
  });

  const handleCancel = () => {
    if (query.data) reset(toFormInput(query.data));
  };

  if (query.isPending) {
    return (
      <>
        <AdminTopbar title="Ogólne" />
        <div className="p-8 text-[14px]" style={{ color: "rgb(var(--color-text-muted))" }}>
          Ładowanie ustawień…
        </div>
      </>
    );
  }
  if (query.isError || !query.data) {
    return (
      <>
        <AdminTopbar title="Ogólne" />
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

  const previewBg = previewBgValid ? liveColor : "#E63946";

  return (
    <>
      <AdminTopbar
        title="Ogólne"
        metadata="Identyfikacja, kontakt, marka, grafiki"
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
              style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.55 }}
            >
              Podstawowe informacje o restauracji — pokazują się w nagłówku, stopce, na karcie kontaktowej i w wynikach wyszukiwania.
            </p>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
              <div className="flex min-w-0 flex-col gap-4">
                {/* Identyfikacja */}
                <Card title="Identyfikacja">
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <Field label="Nazwa restauracji" required error={errors.name?.message as string}>
                      <Input {...register("name")} />
                    </Field>
                    <Field
                      label="Slogan"
                      hint="1 linia, max 200 znaków"
                      error={errors.tagline?.message as string}
                    >
                      <Input {...register("tagline")} maxLength={200} />
                    </Field>
                  </div>
                  <div className="mt-3.5">
                    <Field
                      label="Krótki opis"
                      hint="Pokazany w meta description, do SEO"
                      error={errors.seoDescription?.message as string}
                    >
                      <Textarea
                        {...register("seoDescription")}
                        rows={3}
                        maxLength={200}
                      />
                    </Field>
                  </div>
                </Card>

                {/* Kontakt */}
                <Card title="Kontakt">
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <Field label="Email kontaktowy" required error={errors.email?.message as string}>
                      <Input type="email" {...register("email")} />
                    </Field>
                    <Field label="Telefon" required error={errors.phone?.message as string}>
                      <Input mono {...register("phone")} />
                    </Field>
                  </div>
                  <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-[1fr_140px_180px]">
                    <Field label="Ulica i numer" error={errors.addressLine?.message as string}>
                      <Input {...register("addressLine")} />
                    </Field>
                    <Field label="Kod pocztowy" error={errors.postalCode?.message as string}>
                      <Input mono {...register("postalCode")} />
                    </Field>
                    <Field label="Miasto" error={errors.city?.message as string}>
                      <Input {...register("city")} />
                    </Field>
                  </div>
                  <div className="mt-3.5">
                    <Field
                      label="Link Google Maps"
                      hint="Wklej link Google Maps lub współrzędne"
                      error={errors.googleMapsUrl?.message as string}
                    >
                      <Input mono {...register("googleMapsUrl")} placeholder="https://maps.app.goo.gl/…" />
                    </Field>
                  </div>
                </Card>

                {/* Marka — kolor */}
                <Card
                  title="Marka — kolor"
                  sub="Kolor główny używany w przyciskach, linkach, badge'ach i wyróżnieniach na całym landingu i panelu klienta."
                >
                  <div className="max-w-[360px]">
                    <Field label="Kolor HEX" error={errors.primaryColor?.message}>
                      <div className="flex items-center gap-2.5">
                        <div
                          aria-hidden
                          className="h-10 w-10 shrink-0 rounded-lg"
                          style={{
                            background: previewBg,
                            border: "1px solid rgba(0,0,0,0.08)",
                          }}
                        />
                        <Input
                          mono
                          uppercase
                          {...register("primaryColor")}
                          maxLength={7}
                        />
                      </div>
                    </Field>
                  </div>

                  <div className="mt-[18px]">
                    <FieldLabel hint="Kliknij, aby ustawić">
                      Predefiniowane palety
                    </FieldLabel>
                    <div className="grid grid-cols-6 gap-3 pb-1.5">
                      {BRAND_PRESETS.map((sw) => {
                        const active = liveColor.toUpperCase() === sw.hex.toUpperCase();
                        return (
                          <button
                            key={sw.hex}
                            type="button"
                            onClick={() =>
                              setValue("primaryColor", sw.hex, {
                                shouldDirty: true,
                                shouldValidate: true,
                              })
                            }
                            className="flex min-w-0 flex-col items-center gap-2 bg-transparent p-0"
                            style={{ cursor: "pointer", border: "none" }}
                            aria-label={`Wybierz kolor ${sw.name}`}
                          >
                            <div
                              className="aspect-square w-14 max-w-full rounded-lg"
                              style={{
                                background: sw.hex,
                                border: active
                                  ? "2px solid rgb(var(--color-text-primary))"
                                  : "1px solid rgba(0,0,0,0.08)",
                                boxShadow: active ? "inset 0 0 0 2px #fff" : "none",
                                boxSizing: "border-box",
                              }}
                            />
                            <div
                              className="w-full truncate text-center text-[11px]"
                              style={{
                                color: "rgb(var(--color-text-muted))",
                                fontWeight: active ? 600 : 500,
                                lineHeight: 1.3,
                              }}
                            >
                              {sw.name}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Inline live preview row */}
                  <div
                    className="mt-[22px] rounded-xl p-[18px]"
                    style={{
                      background: "rgb(var(--color-bg-section))",
                      border: "1px solid rgb(var(--color-border-subtle))",
                    }}
                  >
                    <div
                      className="mb-3 text-[11px] font-semibold uppercase"
                      style={{
                        letterSpacing: "0.06em",
                        color: "rgb(var(--color-text-muted))",
                      }}
                    >
                      Podgląd komponentów na żywo
                    </div>
                    <div className="flex flex-wrap items-center gap-3.5">
                      <button
                        type="button"
                        className="h-[38px] rounded-lg px-[18px] text-[14px] font-semibold text-white"
                        style={{ background: previewBg, border: "none", cursor: "pointer" }}
                      >
                        Zamów teraz
                      </button>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="text-[14px] font-semibold underline"
                        style={{ color: previewBg, textUnderlineOffset: 3 }}
                      >
                        Zobacz menu
                      </a>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-bold"
                        style={{ background: previewBg + "1F", color: previewBg }}
                      >
                        <span
                          aria-hidden
                          className="inline-block h-1.5 w-1.5 rounded-full"
                          style={{ background: previewBg }}
                        />
                        Hit
                      </span>
                      <span
                        className="inline-flex items-center rounded-full bg-white px-2.5 py-1 text-[12px] font-bold"
                        style={{ border: `1px solid ${previewBg}`, color: previewBg }}
                      >
                        Nowość
                      </span>
                      <div
                        className="ml-auto flex w-[220px] items-center gap-2.5 rounded-xl bg-white p-3"
                        style={{
                          border: "1px solid rgb(var(--color-border-card))",
                        }}
                      >
                        <div
                          className="grid h-14 w-14 shrink-0 place-items-center rounded-lg text-[28px]"
                          style={{
                            background: `linear-gradient(135deg, ${previewBg}1A, ${previewBg}33)`,
                          }}
                          aria-hidden
                        >
                          🍕
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-bold">Margherita</div>
                          <div
                            className="mb-1 text-[11px]"
                            style={{ color: "rgb(var(--color-text-muted))" }}
                          >
                            32 cm
                          </div>
                          <div
                            className="text-[13px] font-semibold"
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: previewBg,
                            }}
                          >
                            32,00 zł
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Grafiki */}
                <Card title="Grafiki">
                  <Field
                    label="Logo URL"
                    hint="kwadrat, min. 256×256px, PNG/SVG"
                    error={errors.logoUrl?.message as string}
                  >
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <Input mono {...register("logoUrl")} placeholder="https://…" />
                      </div>
                      <div
                        className="grid h-24 w-24 shrink-0 place-items-center rounded-xl text-[44px] font-bold text-white"
                        style={{
                          background: previewBg,
                          fontFamily: "ui-serif, Georgia, serif",
                          border: "1px solid rgba(0,0,0,0.08)",
                        }}
                        aria-hidden
                      >
                        {previewBrandInitial}
                      </div>
                    </div>
                  </Field>
                  <p
                    className="mt-3 text-[12px]"
                    style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.5 }}
                  >
                    Hero image URL edytujesz w{" "}
                    <a
                      href="/admin/settings/content"
                      style={{ color: "rgb(var(--color-primary))", textDecoration: "underline" }}
                    >
                      Treści strony → Hero
                    </a>
                    .
                  </p>
                </Card>

                {/* Social */}
                <Card
                  title="Media społecznościowe"
                  sub="Opcjonalne. Linki pojawiają się w stopce strony."
                >
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <Field label="Facebook" error={errors.socialFacebook?.message as string}>
                      <Input mono {...register("socialFacebook")} placeholder="https://facebook.com/…" />
                    </Field>
                    <Field label="Instagram" error={errors.socialInstagram?.message as string}>
                      <Input mono {...register("socialInstagram")} placeholder="https://instagram.com/…" />
                    </Field>
                  </div>
                </Card>
              </div>

              {/* Right rail: sticky live mini preview */}
              <div className="hidden lg:block">
                <div className="sticky top-2">
                  <div
                    className="mb-2.5 text-[11px] font-semibold uppercase"
                    style={{
                      letterSpacing: "0.06em",
                      color: "rgb(var(--color-text-muted))",
                    }}
                  >
                    Podgląd na stronie
                  </div>
                  <div
                    className="overflow-hidden rounded-xl bg-white"
                    style={{ border: "1px solid rgb(var(--color-border-card))" }}
                  >
                    {/* Fake browser chrome */}
                    <div
                      className="flex h-7 items-center gap-1.5 px-2.5"
                      style={{
                        background: "#F5F2EA",
                        borderBottom: "1px solid rgb(var(--color-border-subtle))",
                      }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: "#E5E1D6" }} />
                      <span className="h-2 w-2 rounded-full" style={{ background: "#E5E1D6" }} />
                      <span className="h-2 w-2 rounded-full" style={{ background: "#E5E1D6" }} />
                      <span
                        className="ml-3 text-[11px]"
                        style={{
                          color: "rgb(var(--color-text-faint))",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        pizzademo.pl
                      </span>
                    </div>
                    {/* Nav */}
                    <div
                      className="flex items-center gap-2.5 px-4 py-3"
                      style={{ borderBottom: "1px solid rgb(var(--color-border-subtle))" }}
                    >
                      <div
                        className="grid h-7 w-7 place-items-center rounded text-[14px] font-bold text-white"
                        style={{
                          background: previewBg,
                          fontFamily: "ui-serif, Georgia, serif",
                        }}
                      >
                        {previewBrandInitial}
                      </div>
                      <div className="text-[13px] font-bold truncate">{liveName}</div>
                      <div className="ml-auto shrink-0 text-[11px]" style={{ color: "rgb(var(--color-text-muted))" }}>
                        Menu · Kontakt
                      </div>
                    </div>
                    {/* Hero */}
                    <div
                      className="relative aspect-[16/10] p-5 text-white"
                      style={{
                        background: `linear-gradient(135deg, #2A1A14 0%, #5A2818 60%, ${previewBg} 130%)`,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                      }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)",
                        }}
                      />
                      <div
                        className="relative mb-1 text-[10px] uppercase"
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {liveCity} · od 2018
                      </div>
                      <div
                        className="relative mb-1.5 text-[22px] font-extrabold leading-[1.1]"
                        style={{ letterSpacing: "-0.015em" }}
                      >
                        {liveName}
                      </div>
                      <div
                        className="relative mb-2.5 max-w-[220px] text-[11px]"
                        style={{ color: "rgba(255,255,255,0.85)" }}
                      >
                        {liveTagline}
                      </div>
                      <button
                        type="button"
                        className="relative h-[30px] self-start rounded-lg px-3.5 text-[12px] font-semibold text-white"
                        style={{ background: previewBg, border: "none", cursor: "pointer" }}
                      >
                        Zobacz menu
                      </button>
                    </div>
                    {/* Card */}
                    <div className="px-3.5 py-3.5">
                      <div
                        className="mb-1.5 text-[10px] uppercase"
                        style={{
                          color: "rgb(var(--color-text-muted))",
                          letterSpacing: "0.06em",
                        }}
                      >
                        Z menu
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-[18px]"
                          style={{
                            background: `linear-gradient(135deg, ${previewBg}1A, ${previewBg}33)`,
                          }}
                          aria-hidden
                        >
                          🍕
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[12px] font-bold">Margherita</div>
                          <div
                            className="truncate text-[11px]"
                            style={{ color: "rgb(var(--color-text-muted))" }}
                          >
                            Pomidor, mozzarella, bazylia
                          </div>
                        </div>
                        <div
                          className="text-[12px] font-bold"
                          style={{
                            fontFamily: "var(--font-mono)",
                            color: previewBg,
                          }}
                        >
                          32,00 zł
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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

interface CardProps {
  title: string;
  sub?: string;
  children: React.ReactNode;
}

function Card({ title, sub, children }: CardProps) {
  return (
    <section
      className="rounded-xl p-[22px]"
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
      }}
    >
      <h3
        className="m-0 text-[15px] font-bold"
        style={{ color: "rgb(var(--color-text-primary))" }}
      >
        {title}
      </h3>
      {sub && (
        <p
          className="m-0 mb-4 mt-1 text-[13px]"
          style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.5 }}
        >
          {sub}
        </p>
      )}
      {!sub && <div style={{ height: 16 }} />}
      {children}
    </section>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, hint, required, error, children }: FieldProps) {
  return (
    <div>
      <FieldLabel hint={hint} required={required}>
        {label}
      </FieldLabel>
      {children}
      {error && (
        <p
          className="mt-1 text-[12px]"
          style={{ color: "rgb(var(--status-cancelled))" }}
        >
          {error}
        </p>
      )}
    </div>
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
          <span
            className="ml-0.5"
            style={{ color: "rgb(var(--color-primary))" }}
            aria-hidden
          >
            *
          </span>
        )}
      </span>
      {hint && (
        <span
          className="text-[12px]"
          style={{ color: "rgb(var(--color-text-faint))" }}
        >
          · {hint}
        </span>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
  uppercase?: boolean;
}

const Input = ((props: InputProps) => {
  const { mono, uppercase, className, style, ...rest } = props;
  return (
    <input
      {...rest}
      className={className}
      style={{
        width: "100%",
        height: 40,
        padding: "0 12px",
        borderRadius: 8,
        border: "1px solid rgb(var(--color-border-card))",
        background: "rgb(var(--color-bg-card))",
        fontSize: 14,
        color: "rgb(var(--color-text-primary))",
        fontFamily: mono ? "var(--font-mono)" : "inherit",
        textTransform: uppercase ? "uppercase" : undefined,
        outline: "none",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}) as React.FC<InputProps>;

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = ((props: TextareaProps) => {
  const { className, style, rows = 3, ...rest } = props;
  return (
    <textarea
      {...rest}
      rows={rows}
      className={className}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: "1px solid rgb(var(--color-border-card))",
        background: "rgb(var(--color-bg-card))",
        fontSize: 14,
        color: "rgb(var(--color-text-primary))",
        fontFamily: "inherit",
        lineHeight: 1.55,
        resize: "vertical",
        minHeight: 24 * rows + 20,
        outline: "none",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}) as React.FC<TextareaProps>;
