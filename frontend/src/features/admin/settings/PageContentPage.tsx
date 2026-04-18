import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/cn";

const SECTIONS: { key: SectionKey; label: string; hasCta: boolean }[] = [
  { key: "HERO", label: "Hero", hasCta: true },
  { key: "ABOUT", label: "O nas", hasCta: false },
];

const schema = z.object({
  title: z.string().min(1, "Tytuł jest wymagany").max(200),
  body: z.string().min(1, "Treść jest wymagana"),
  imageUrl: z
    .string()
    .max(500)
    .optional()
    .refine((v) => !v || /^https?:\/\/.+/.test(v), {
      message: "URL musi zaczynać się od http:// lub https://",
    })
    .transform((v) => (v && v.length > 0 ? v : null)),
  ctaLabel: z
    .string()
    .max(60)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  ctaHref: z
    .string()
    .max(300)
    .optional()
    .refine((v) => !v || /^(https?:\/\/|\/).+/.test(v), {
      message: "Link musi zaczynać się od http://, https:// lub /",
    })
    .transform((v) => (v && v.length > 0 ? v : null)),
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
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się zapisać treści");
    },
  });

  if (isLoading) return <div className="text-sm text-slate-500">Ładowanie sekcji…</div>;
  if (isError || !data)
    return <div className="text-sm text-red-600">Nie udało się pobrać sekcji.</div>;

  return (
    <form
      onSubmit={handleSubmit((values) => mutation.mutate(values))}
      className="space-y-6"
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Treść sekcji</CardTitle>
          <CardDescription>Zmiany są publikowane natychmiast po zapisaniu.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor={`title-${section}`}>Tytuł</Label>
            <Input id={`title-${section}`} {...register("title")} />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <Label htmlFor={`body-${section}`}>Treść</Label>
            <Textarea id={`body-${section}`} rows={6} {...register("body")} />
            {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body.message}</p>}
          </div>
          <div>
            <Label htmlFor={`imageUrl-${section}`}>URL obrazu</Label>
            <Input
              id={`imageUrl-${section}`}
              placeholder="https://…"
              {...register("imageUrl")}
            />
          </div>
          {hasCta && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor={`ctaLabel-${section}`}>Etykieta przycisku CTA</Label>
                <Input id={`ctaLabel-${section}`} {...register("ctaLabel")} />
              </div>
              <div>
                <Label htmlFor={`ctaHref-${section}`}>Link przycisku CTA</Label>
                <Input
                  id={`ctaHref-${section}`}
                  placeholder="/menu lub https://…"
                  {...register("ctaHref")}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={!isDirty || mutation.isPending}
          onClick={() => reset(toFormValues(data))}
        >
          Przywróć
        </Button>
        <Button type="submit" disabled={!isDirty || mutation.isPending}>
          {mutation.isPending ? "Zapisywanie…" : "Zapisz zmiany"}
        </Button>
      </div>
    </form>
  );
}

export function PageContentPage() {
  const [active, setActive] = useState<SectionKey>("HERO");
  const activeSection = SECTIONS.find((s) => s.key === active) ?? SECTIONS[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Treści stron</h1>
        <p className="mt-1 text-sm text-slate-500">
          Edytuj sekcje Hero i O nas widoczne na stronie głównej.
        </p>
      </div>

      <div className="inline-flex rounded-md border border-slate-200 bg-white p-1">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            type="button"
            onClick={() => setActive(section.key)}
            className={cn(
              "rounded px-4 py-1.5 text-sm font-medium transition-colors",
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
    </div>
  );
}
