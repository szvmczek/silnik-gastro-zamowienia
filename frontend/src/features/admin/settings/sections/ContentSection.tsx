import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import {
  fetchAdminPageContent,
  updateAdminPageContent,
  type PageContentDto,
  type UpdatePageContentPayload,
} from "@/shared/api/pageContentApi";
import { extractProblem } from "@/shared/api/client";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { Switch } from "@/shared/components/ui/Switch";
import { cn } from "@/shared/lib/cn";
import { SaveBar } from "../components/SaveBar";

// Bundle ref: docs/design/v2-stage4/section-content.jsx.
// HERO / ABOUT tabs, each = own PageContent entity (separate query + form +
// mutation). Right pane = sticky live landing preview that mirrors form.

type ContentTab = "hero" | "about";

const URL_RE = /^https?:\/\/.+/;

/* ───────── CTA direction (HERO only) — frontend abstraction over ctaHref ───────── */
type CtaDirection = "menu" | "phone" | "url";

function detectDirection(href: string | null | undefined): CtaDirection {
  if (!href) return "menu";
  if (href.startsWith("tel:")) return "phone";
  if (URL_RE.test(href)) return "url";
  return "menu";
}

/* ═══════════════ Hero editor ═══════════════ */

const heroSchema = z.object({
  active: z.boolean(),
  title: z.string().min(1, "Tytuł jest wymagany").max(200),
  // N18 spec said max 160; bumped to 200 — seed HERO body is 168 chars,
  // a hard 160 would block save of existing content.
  subtitle: z.string().min(1, "Podtytuł jest wymagany").max(200),
  ctaLabel: z
    .union([z.literal(""), z.string().max(60)])
    .transform((v) => (v === "" ? null : v)),
  imageUrl: z
    .union([z.literal(""), z.string().max(500).regex(URL_RE, "URL musi zaczynać się od http:// lub https://")])
    .transform((v) => (v === "" ? null : v)),
});

type HeroFormInput = z.input<typeof heroSchema>;
type HeroFormOutput = z.output<typeof heroSchema>;

function HeroEditor() {
  const queryClient = useQueryClient();
  const settings = usePublicSettings();
  const phone = settings.data?.phone ?? null;

  const query = useQuery<PageContentDto>({
    queryKey: ["admin", "page-content", "HERO"],
    queryFn: () => fetchAdminPageContent("HERO"),
  });

  const [direction, setDirection] = useState<CtaDirection>("menu");
  const [customUrl, setCustomUrl] = useState("");
  const [directionDirty, setDirectionDirty] = useState(false);

  const form = useForm<HeroFormInput, undefined, HeroFormOutput>({
    resolver: zodResolver(heroSchema),
    defaultValues: { active: true, title: "", subtitle: "", ctaLabel: "", imageUrl: "" },
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
    if (!query.data) return;
    const d = query.data;
    reset({
      active: d.active,
      title: d.title,
      subtitle: d.body,
      ctaLabel: d.ctaLabel ?? "",
      imageUrl: d.imageUrl ?? "",
    });
    const dir = detectDirection(d.ctaHref);
    setDirection(dir);
    setCustomUrl(dir === "url" ? (d.ctaHref ?? "") : "");
    setDirectionDirty(false);
  }, [query.data, reset]);

  const liveTitle = watch("title") || "Pizza Demo";
  const liveSubtitle = watch("subtitle") || "Smacznie i szybko. Dostawa do 35 minut.";
  const liveCtaLabel = watch("ctaLabel") || "Zobacz menu";
  const liveActive = watch("active");

  const mutation = useMutation({
    mutationFn: (payload: UpdatePageContentPayload) =>
      updateAdminPageContent("HERO", payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "page-content", "HERO"], updated);
      queryClient.invalidateQueries({ queryKey: ["public", "page-content"] });
      toast.success("Sekcja Hero zapisana");
    },
    onError: (err) => {
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zapisać sekcji Hero");
    },
  });

  const resolveCtaHref = (): string | null => {
    if (direction === "menu") return "/menu";
    if (direction === "phone") return phone ? `tel:${phone}` : null;
    return customUrl.trim() || null;
  };

  const onSubmit = handleSubmit((values: HeroFormOutput) => {
    mutation.mutate({
      title: values.title,
      body: values.subtitle,
      imageUrl: values.imageUrl,
      ctaLabel: values.ctaLabel,
      ctaHref: resolveCtaHref(),
      active: values.active,
    });
  });

  const handleCancel = () => {
    if (query.data) {
      const d = query.data;
      reset({
        active: d.active,
        title: d.title,
        subtitle: d.body,
        ctaLabel: d.ctaLabel ?? "",
        imageUrl: d.imageUrl ?? "",
      });
      const dir = detectDirection(d.ctaHref);
      setDirection(dir);
      setCustomUrl(dir === "url" ? (d.ctaHref ?? "") : "");
      setDirectionDirty(false);
    }
  };

  if (query.isPending) return <EditorLoading />;
  if (query.isError) return <EditorError />;

  const dirty = isDirty || directionDirty;

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-[1fr_420px]">
          <div className="flex min-w-0 flex-col gap-4">
            <Card title="Sekcja Hero">
              <ActiveRow
                hint="Po wyłączeniu strona pominie sekcję Hero."
                checked={watch("active")}
                onChange={(v) => setValue("active", v, { shouldDirty: true })}
              />
              <Divider />
              <Field label="Title" required error={errors.title?.message}>
                <Input {...register("title")} />
              </Field>
              <div className="mt-3.5">
                <Field
                  label="Subtitle"
                  hint="1-2 wiersze, max 200 znaków"
                  required
                  error={errors.subtitle?.message}
                >
                  <Textarea rows={2} maxLength={200} {...register("subtitle")} />
                </Field>
              </div>
            </Card>

            <Card title="Call to action">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <Field label="Tekst przycisku" error={errors.ctaLabel?.message as string}>
                  <Input {...register("ctaLabel")} maxLength={60} />
                </Field>
                <div>
                  <FieldLabel>Kierunek</FieldLabel>
                  <div className="flex flex-col gap-2">
                    <RadioOption
                      label="Menu (przejście do menu)"
                      checked={direction === "menu"}
                      onSelect={() => {
                        setDirection("menu");
                        setDirectionDirty(true);
                      }}
                    />
                    <RadioOption
                      label="Telefon (tel:)"
                      checked={direction === "phone"}
                      disabled={!phone}
                      disabledHint="Najpierw uzupełnij telefon w Ustawieniach"
                      onSelect={() => {
                        setDirection("phone");
                        setDirectionDirty(true);
                      }}
                    />
                    <RadioOption
                      label="Custom URL"
                      checked={direction === "url"}
                      onSelect={() => {
                        setDirection("url");
                        setDirectionDirty(true);
                      }}
                    />
                  </div>
                  {direction === "url" && (
                    <div className="mt-2">
                      <Input
                        mono
                        value={customUrl}
                        placeholder="https://…"
                        onChange={(e) => {
                          setCustomUrl(e.target.value);
                          setDirectionDirty(true);
                        }}
                      />
                      {customUrl.trim() !== "" && !URL_RE.test(customUrl.trim()) && (
                        <p
                          className="mt-1 text-[12px]"
                          style={{ color: "rgb(var(--status-cancelled))" }}
                        >
                          URL musi zaczynać się od http:// lub https://
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>

            <Card title="Tło">
              <Field
                label="Background image URL"
                hint="16:9, min. 1920×1080px"
                error={errors.imageUrl?.message as string}
              >
                <Input mono {...register("imageUrl")} placeholder="https://…" />
              </Field>
              <div
                className="mt-3 w-full overflow-hidden rounded-xl"
                style={{
                  aspectRatio: "16 / 9",
                  background:
                    "linear-gradient(135deg, #2A1A14 0%, #5A2818 60%, #E63946 130%)",
                  border: "1px solid rgb(var(--color-border-card))",
                  position: "relative",
                }}
                aria-hidden
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)",
                  }}
                />
              </div>
            </Card>
          </div>

          <PreviewPane tab="hero">
            <HeroPreviewBody
              title={liveTitle}
              subtitle={liveSubtitle}
              ctaLabel={liveCtaLabel}
              active={liveActive}
            />
          </PreviewPane>
        </div>
      </div>
      <SaveBar
        isDirty={dirty}
        pending={mutation.isPending}
        onCancel={handleCancel}
        onSave={onSubmit}
      />
    </form>
  );
}

/* ═══════════════ About editor ═══════════════ */

const aboutSchema = z.object({
  active: z.boolean(),
  title: z.string().min(1, "Tytuł jest wymagany").max(200),
  body: z.string().min(1, "Treść jest wymagana").max(5000, "Maksymalnie 5000 znaków"),
  imageUrl: z
    .union([z.literal(""), z.string().max(500).regex(URL_RE, "URL musi zaczynać się od http:// lub https://")])
    .transform((v) => (v === "" ? null : v)),
});

type AboutFormInput = z.input<typeof aboutSchema>;
type AboutFormOutput = z.output<typeof aboutSchema>;

function AboutEditor() {
  const queryClient = useQueryClient();
  const query = useQuery<PageContentDto>({
    queryKey: ["admin", "page-content", "ABOUT"],
    queryFn: () => fetchAdminPageContent("ABOUT"),
  });

  const form = useForm<AboutFormInput, undefined, AboutFormOutput>({
    resolver: zodResolver(aboutSchema),
    defaultValues: { active: true, title: "", body: "", imageUrl: "" },
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
    if (!query.data) return;
    const d = query.data;
    reset({
      active: d.active,
      title: d.title,
      body: d.body,
      imageUrl: d.imageUrl ?? "",
    });
  }, [query.data, reset]);

  const liveTitle = watch("title") || "Nasza historia";
  const liveBody = watch("body") || "Lokalna pizzeria…";
  const liveActive = watch("active");

  const mutation = useMutation({
    mutationFn: (payload: UpdatePageContentPayload) =>
      updateAdminPageContent("ABOUT", payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "page-content", "ABOUT"], updated);
      queryClient.invalidateQueries({ queryKey: ["public", "page-content"] });
      toast.success("Sekcja O nas zapisana");
    },
    onError: (err) => {
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zapisać sekcji O nas");
    },
  });

  const onSubmit = handleSubmit((values: AboutFormOutput) => {
    mutation.mutate({
      title: values.title,
      body: values.body,
      imageUrl: values.imageUrl,
      ctaLabel: null,
      ctaHref: null,
      active: values.active,
    });
  });

  const handleCancel = () => {
    if (query.data) {
      const d = query.data;
      reset({
        active: d.active,
        title: d.title,
        body: d.body,
        imageUrl: d.imageUrl ?? "",
      });
    }
  };

  if (query.isPending) return <EditorLoading />;
  if (query.isError) return <EditorError />;

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-6 p-8 lg:grid-cols-[1fr_420px]">
          <div className="flex min-w-0 flex-col gap-4">
            <Card title="Sekcja O nas">
              <ActiveRow
                hint="Sekcja pojawia się pod menu."
                checked={watch("active")}
                onChange={(v) => setValue("active", v, { shouldDirty: true })}
              />
              <Divider />
              <Field label="Title" required error={errors.title?.message}>
                <Input {...register("title")} />
              </Field>
              <div className="mt-3.5">
                <Field
                  label="Body"
                  hint="5-10 wierszy, plain text"
                  required
                  error={errors.body?.message}
                >
                  <Textarea rows={8} maxLength={5000} {...register("body")} />
                </Field>
              </div>
            </Card>

            <Card title="Zdjęcie">
              <Field
                label="Image URL"
                hint="4:3, min. 1200×900px"
                error={errors.imageUrl?.message as string}
              >
                <Input mono {...register("imageUrl")} placeholder="https://…" />
              </Field>
              <div
                className="mt-3 w-full overflow-hidden rounded-xl"
                style={{
                  aspectRatio: "4 / 3",
                  background:
                    "linear-gradient(135deg, #5A2818 0%, #8B4513 60%, #D4A574 130%)",
                  border: "1px solid rgb(var(--color-border-card))",
                  position: "relative",
                }}
                aria-hidden
              >
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)",
                  }}
                />
              </div>
            </Card>
          </div>

          <PreviewPane tab="about">
            <AboutPreviewBody title={liveTitle} body={liveBody} active={liveActive} />
          </PreviewPane>
        </div>
      </div>
      <SaveBar
        isDirty={isDirty}
        pending={mutation.isPending}
        onCancel={handleCancel}
        onSave={onSubmit}
      />
    </form>
  );
}

/* ═══════════════ Section shell with tabs ═══════════════ */

export function ContentSection() {
  const [tab, setTab] = useState<ContentTab>("hero");

  return (
    <>
      <AdminTopbar title="Treści strony" metadata="Hero i sekcja O nas" />
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="px-8 pt-6">
          <p
            className="m-0 mb-4 max-w-[640px] text-[14px]"
            style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.55 }}
          >
            Sekcje na landingu publicznym — Hero w nagłówku i About wśród sekcji
            informacyjnych. Zmiany pojawiają się natychmiast po zapisie.
          </p>
          <div
            className="flex"
            style={{ borderBottom: "1px solid rgb(var(--color-border-subtle))" }}
          >
            <TabButton active={tab === "hero"} onClick={() => setTab("hero")}>
              Hero
            </TabButton>
            <TabButton active={tab === "about"} onClick={() => setTab("about")}>
              O nas
            </TabButton>
          </div>
        </div>
        {tab === "hero" ? <HeroEditor /> : <AboutEditor />}
      </div>
    </>
  );
}

/* ───────── primitives ───────── */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2.5 text-[14px]"
      style={{
        border: "none",
        background: "transparent",
        fontWeight: active ? 700 : 500,
        color: active
          ? "rgb(var(--color-text-primary))"
          : "rgb(var(--color-text-muted))",
        borderBottom: active
          ? "2px solid rgb(var(--color-primary))"
          : "2px solid transparent",
        marginBottom: -1,
        cursor: "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}

function EditorLoading() {
  return (
    <div className="p-8 text-[14px]" style={{ color: "rgb(var(--color-text-muted))" }}>
      Ładowanie treści…
    </div>
  );
}

function EditorError() {
  return (
    <div
      className="m-8 rounded-md p-3 text-sm"
      style={{
        border: "1px solid rgb(var(--status-cancelled) / 0.3)",
        background: "rgb(var(--status-cancelled-tint))",
        color: "rgb(var(--status-cancelled))",
      }}
    >
      Nie udało się pobrać treści. Odśwież stronę.
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section
      className="rounded-xl p-[22px]"
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
      }}
    >
      <h3
        className="m-0 mb-4 text-[15px] font-bold"
        style={{ color: "rgb(var(--color-text-primary))" }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function Divider() {
  return (
    <hr
      className="my-4"
      style={{ border: 0, borderTop: "1px solid rgb(var(--color-border-subtle))" }}
    />
  );
}

function ActiveRow({
  hint,
  checked,
  onChange,
}: {
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div
          className="text-[13px] font-semibold"
          style={{ color: "rgb(var(--color-text-primary))" }}
        >
          Aktywne
        </div>
        <div
          className="text-[12px]"
          style={{ color: "rgb(var(--color-text-muted))" }}
        >
          {hint}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function RadioOption({
  label,
  checked,
  disabled,
  disabledHint,
  onSelect,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  disabledHint?: string;
  onSelect: () => void;
}) {
  return (
    <label
      title={disabled ? disabledHint : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px]",
        disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer",
      )}
      style={{
        border: `1px solid ${
          checked
            ? "rgb(var(--color-primary))"
            : "rgb(var(--color-border-card))"
        }`,
        background: checked
          ? "rgb(var(--color-primary-tint))"
          : "rgb(var(--color-bg-card))",
      }}
      onClick={() => {
        if (!disabled) onSelect();
      }}
    >
      <span
        aria-hidden
        className="inline-block h-4 w-4 shrink-0 rounded-full"
        style={{
          border: `2px solid ${
            checked
              ? "rgb(var(--color-primary))"
              : "rgb(var(--color-border-card))"
          }`,
          background: checked ? "rgb(var(--color-primary))" : "transparent",
          boxShadow: checked ? "inset 0 0 0 3px #fff" : "none",
        }}
      />
      <span style={{ fontWeight: checked ? 600 : 500 }}>{label}</span>
    </label>
  );
}

function PreviewPane({
  tab,
  children,
}: {
  tab: ContentTab;
  children: React.ReactNode;
}) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-2">
        <div
          className="mb-2.5 text-[11px] font-semibold uppercase"
          style={{
            letterSpacing: "0.06em",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          Live preview · landing
        </div>
        <div
          className="overflow-hidden rounded-xl bg-white"
          style={{ border: "1px solid rgb(var(--color-border-card))" }}
        >
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
          {tab === "hero" ? children : children}
        </div>
      </div>
    </div>
  );
}

function HeroPreviewBody({
  title,
  subtitle,
  ctaLabel,
  active,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  active: boolean;
}) {
  if (!active) {
    return (
      <div
        className="grid place-items-center px-6 py-16 text-center text-[13px]"
        style={{ color: "rgb(var(--color-text-muted))" }}
      >
        Sekcja Hero jest wyłączona — nie pojawi się na stronie.
      </div>
    );
  }
  return (
    <div
      className="relative flex flex-col justify-end p-7 text-white"
      style={{
        aspectRatio: "16 / 11",
        background:
          "linear-gradient(135deg, #2A1A14 0%, #5A2818 60%, rgb(var(--color-primary)) 130%)",
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
        className="relative mb-2.5 text-[32px] font-extrabold leading-[1.05]"
        style={{ letterSpacing: "-0.02em" }}
      >
        {title}
      </div>
      <div
        className="relative mb-2 text-[11px] uppercase"
        style={{ color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em" }}
      >
        Łomianki · od 2018
      </div>
      <div
        className="relative mb-[18px] max-w-[280px] text-[14px] leading-relaxed"
        style={{ color: "rgba(255,255,255,0.9)" }}
      >
        {subtitle}
      </div>
      <button
        type="button"
        className="relative h-[38px] self-start rounded-lg px-[18px] text-[14px] font-semibold text-white"
        style={{ background: "rgb(var(--color-primary))", border: "none" }}
      >
        {ctaLabel}
      </button>
    </div>
  );
}

function AboutPreviewBody({
  title,
  body,
  active,
}: {
  title: string;
  body: string;
  active: boolean;
}) {
  if (!active) {
    return (
      <div
        className="grid place-items-center px-6 py-16 text-center text-[13px]"
        style={{ color: "rgb(var(--color-text-muted))" }}
      >
        Sekcja O nas jest wyłączona — nie pojawi się na stronie.
      </div>
    );
  }
  return (
    <div className="p-7" style={{ background: "#FAFAF8" }}>
      <div
        className="mb-2 text-[11px] font-semibold uppercase"
        style={{
          letterSpacing: "0.06em",
          color: "rgb(var(--color-primary))",
        }}
      >
        O nas
      </div>
      <div
        className="mb-3 text-[22px] font-extrabold"
        style={{ letterSpacing: "-0.015em" }}
      >
        {title}
      </div>
      <div
        className="mb-3.5 w-full overflow-hidden rounded-lg"
        style={{
          aspectRatio: "4 / 3",
          background:
            "linear-gradient(135deg, #5A2818 0%, #8B4513 60%, #D4A574 130%)",
          position: "relative",
        }}
        aria-hidden
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.04) 0 12px, transparent 12px 24px)",
          }}
        />
      </div>
      <div
        className="text-[13px] leading-relaxed"
        style={{
          color: "rgb(var(--color-text-body))",
          whiteSpace: "pre-line",
          display: "-webkit-box",
          WebkitLineClamp: 4,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {body}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
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
}

const Input = ((props: InputProps) => {
  const { mono, style, ...rest } = props;
  return (
    <input
      {...rest}
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
        outline: "none",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}) as React.FC<InputProps>;

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = ((props: TextareaProps) => {
  const { rows = 3, style, ...rest } = props;
  return (
    <textarea
      {...rest}
      rows={rows}
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
