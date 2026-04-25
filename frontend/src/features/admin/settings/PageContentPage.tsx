import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, MessageSquare, Sparkles } from "lucide-react";
import {
  fetchAdminPageContent,
  updateAdminPageContent,
  type PageContentDto,
  type SectionKey,
} from "@/shared/api/pageContentApi";
import { extractProblem } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Textarea } from "@/shared/components/ui/Textarea";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { cn } from "@/shared/lib/cn";
import { SettingsShell } from "./components/SettingsShell";
import { HeroPreview } from "./components/HeroPreview";
import { AboutPreview } from "./components/AboutPreview";

const SECTIONS: { key: SectionKey; label: string; hasCta: boolean }[] = [
  { key: "HERO", label: "Hero", hasCta: true },
  { key: "ABOUT", label: "O nas", hasCta: false },
];

const schema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany").max(200),
  body: z
    .string()
    .min(1, "Treść jest wymagana")
    .max(5000, "Maksymalnie 5000 znaków"),
  imageUrl: z
    .string()
    .max(500)
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), {
      message: "URL musi zaczynać się od http:// lub https://",
    })
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  ctaLabel: z
    .string()
    .max(60)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  ctaHref: z
    .string()
    .max(300)
    .optional()
    .refine((v) => !v || /^(https?:\/\/|\/).+/.test(v), {
      message: "Link musi zaczynać się od http://, https:// lub /",
    })
    .transform((v) => (v && v.length > 0 ? v : undefined)),
});

type FormValues = z.input<typeof schema>;

const toFormValues = (section: PageContentDto): FormValues => ({
  title: section.title,
  body: section.body,
  imageUrl: section.imageUrl ?? "",
  ctaLabel: section.ctaLabel ?? "",
  ctaHref: section.ctaHref ?? "",
});

interface SectionEditorProps {
  section: SectionKey;
  hasCta: boolean;
}

function SectionEditor({ section, hasCta }: SectionEditorProps) {
  const queryClient = useQueryClient();
  const queryKey = ["admin", "page-content", section];

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: () => fetchAdminPageContent(section),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      body: "",
      imageUrl: "",
      ctaLabel: "",
      ctaHref: "",
    },
  });

  useEffect(() => {
    if (data) reset(toFormValues(data));
  }, [data, reset]);

  const live = watch();
  const debounced = useDebouncedValue(live, 300);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateAdminPageContent(section, {
        title: values.title,
        body: values.body,
        imageUrl: values.imageUrl || null,
        ctaLabel: hasCta ? values.ctaLabel || null : null,
        ctaHref: hasCta ? values.ctaHref || null : null,
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      queryClient.invalidateQueries({ queryKey: ["public", "page-content"] });
      reset(toFormValues(updated));
      toast.success("Treści zapisane");
    },
    onError: (error) => {
      const problem = extractProblem(error);
      toast.error(
        problem?.detail ?? problem?.title ?? "Nie udało się zapisać treści"
      );
    },
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Ładowanie sekcji…</div>;
  }
  if (isError || !data) {
    return (
      <div className="text-sm text-rose-600">Nie udało się pobrać sekcji.</div>
    );
  }

  const previewImage = (debounced.imageUrl ?? "").trim() || undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-5"
        noValidate
      >
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <header className="mb-5 flex items-start gap-3">
            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
              {section === "HERO" ? (
                <Sparkles className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
                {section === "HERO"
                  ? "Hero (strona główna)"
                  : "O nas"}
              </h2>
              <p className="mt-0.5 text-[13px] text-slate-500">
                {section === "HERO"
                  ? "Pierwsza sekcja landingu — tytuł, podtytuł, zdjęcie i CTA."
                  : "Sekcja editorial pod hero — tytuł, dłuższy tekst, zdjęcie."}
              </p>
            </div>
          </header>

          <div className="space-y-5">
            <div>
              <Label htmlFor={`title-${section}`}>Tytuł</Label>
              <Input
                id={`title-${section}`}
                size="lg"
                error={Boolean(errors.title)}
                {...register("title")}
              />
              {errors.title && (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`body-${section}`}>
                {section === "HERO" ? "Podtytuł" : "Tekst"}
              </Label>
              <Textarea
                id={`body-${section}`}
                rows={section === "HERO" ? 4 : 8}
                error={Boolean(errors.body)}
                {...register("body")}
              />
              {errors.body && (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.body.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor={`imageUrl-${section}`}>URL zdjęcia</Label>
              <Input
                id={`imageUrl-${section}`}
                size="lg"
                placeholder="https://…"
                className="font-mono text-[13px]"
                error={Boolean(errors.imageUrl)}
                {...register("imageUrl")}
              />
              {errors.imageUrl && (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.imageUrl.message as string}
                </p>
              )}
            </div>
            {hasCta && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`ctaLabel-${section}`}>
                    Etykieta przycisku CTA
                  </Label>
                  <Input
                    id={`ctaLabel-${section}`}
                    size="lg"
                    {...register("ctaLabel")}
                  />
                </div>
                <div>
                  <Label htmlFor={`ctaHref-${section}`}>
                    Link przycisku CTA
                  </Label>
                  <Input
                    id={`ctaHref-${section}`}
                    size="lg"
                    placeholder="/menu lub https://…"
                    className="font-mono text-[13px]"
                    error={Boolean(errors.ctaHref)}
                    {...register("ctaHref")}
                  />
                  {errors.ctaHref && (
                    <p className="mt-1 text-[12px] text-rose-600">
                      {errors.ctaHref.message as string}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            disabled={!isDirty || mutation.isPending}
            onClick={() => reset(toFormValues(data))}
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

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <div className="kicker mb-3 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          Podgląd live · uproszczona reprezentacja
        </div>
        {section === "HERO" ? (
          <HeroPreview
            title={debounced.title ?? ""}
            body={debounced.body ?? ""}
            imageUrl={previewImage}
            ctaLabel={debounced.ctaLabel}
          />
        ) : (
          <AboutPreview
            title={debounced.title ?? ""}
            body={debounced.body ?? ""}
            imageUrl={previewImage}
          />
        )}
      </aside>
    </div>
  );
}

export function PageContentPage() {
  const [active, setActive] = useState<SectionKey>("HERO");
  const activeSection = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0];

  return (
    <SettingsShell description="Edytuj sekcje Hero i O nas widoczne na stronie głównej. Live preview po prawej.">
      <div className="inline-flex rounded-md border border-slate-200 bg-white p-1">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActive(section.key)}
            className={cn(
              "rounded px-4 py-1.5 text-[13px] font-medium transition-colors",
              active === section.key
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-100"
            )}
          >
            {section.label}
          </button>
        ))}
      </div>

      <SectionEditor
        key={activeSection.key}
        section={activeSection.key}
        hasCta={activeSection.hasCta}
      />
    </SettingsShell>
  );
}
