import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Sparkles, Utensils, Phone } from "lucide-react";
import {
  fetchAdminSettings,
  updateAdminSettings,
  type SettingsDto,
  type UpdateSettingsPayload,
} from "@/shared/api/settingsApi";
import { extractProblem } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Textarea } from "@/shared/components/ui/Textarea";
import { applyPrimaryColor } from "@/shared/theme/themeLoader";
import { cn } from "@/shared/lib/cn";
import { SettingsShell } from "./components/SettingsShell";
import { ColorPreviewCard } from "./components/ColorPreviewCard";

const SUGGESTED_SWATCHES = [
  "#FF6B35",
  "#D4482F",
  "#B8363B",
  "#9C5729",
  "#4F6D3B",
  "#2E5A4F",
];

const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

const nullableOptional = (schema: z.ZodString) =>
  z
    .union([schema, z.literal("")])
    .transform((v) => (v === "" ? undefined : v))
    .optional();

const schema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(120),
  tagline: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined)),
  primaryColor: z
    .string()
    .regex(HEX_RE, "Kolor musi być w formacie #RRGGBB"),
  phone: nullableOptional(z.string().max(40)),
  email: nullableOptional(z.string().email("Nieprawidłowy email").max(200)),
  addressLine: nullableOptional(z.string().max(200)),
  city: nullableOptional(z.string().max(100)),
  postalCode: nullableOptional(z.string().max(20)),
  logoUrl: nullableOptional(
    z
      .string()
      .max(500)
      .regex(/^https?:\/\/.+/, "URL musi zaczynać się od http:// lub https://")
  ),
  currency: z
    .string()
    .length(3, "Waluta musi mieć 3 znaki")
    .transform((v) => v.toUpperCase()),
});

type FormValues = z.input<typeof schema>;

const toFormValues = (s: SettingsDto): FormValues => ({
  name: s.name,
  tagline: s.tagline ?? "",
  primaryColor: s.primaryColor,
  phone: s.phone ?? "",
  email: s.email ?? "",
  addressLine: s.addressLine ?? "",
  city: s.city ?? "",
  postalCode: s.postalCode ?? "",
  logoUrl: s.logoUrl ?? "",
  currency: s.currency,
});

function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold tracking-tight text-slate-900">
            {title}
          </h2>
          {description && (
            <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchAdminSettings,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tagline: "",
      primaryColor: "#FF6B35",
      phone: "",
      email: "",
      addressLine: "",
      city: "",
      postalCode: "",
      logoUrl: "",
      currency: "PLN",
    },
  });

  useEffect(() => {
    if (data) reset(toFormValues(data));
  }, [data, reset]);

  const liveColor = watch("primaryColor") ?? "";

  const mutation = useMutation({
    mutationFn: (payload: UpdateSettingsPayload) => updateAdminSettings(payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "settings"], updated);
      queryClient.invalidateQueries({ queryKey: ["public", "settings"] });
      applyPrimaryColor(updated.primaryColor);
      reset(toFormValues(updated));
      toast.success("Ustawienia zapisane");
    },
    onError: (error) => {
      const problem = extractProblem(error);
      toast.error(
        problem?.detail ?? problem?.title ?? "Nie udało się zapisać ustawień"
      );
    },
  });

  if (isLoading) {
    return (
      <SettingsShell>
        <div className="text-sm text-slate-500">Ładowanie ustawień…</div>
      </SettingsShell>
    );
  }
  if (isError || !data) {
    return (
      <SettingsShell>
        <div className="text-sm text-rose-600">
          Nie udało się pobrać ustawień. Odśwież stronę.
        </div>
      </SettingsShell>
    );
  }

  return (
    <SettingsShell description="Nazwa, dane kontaktowe i kolor marki widoczne na stronie publicznej.">
      <form
        onSubmit={handleSubmit((values) =>
          mutation.mutate({
            name: values.name,
            tagline: values.tagline || null,
            primaryColor: values.primaryColor,
            phone: values.phone || null,
            email: values.email || null,
            addressLine: values.addressLine || null,
            city: values.city || null,
            postalCode: values.postalCode || null,
            logoUrl: values.logoUrl || null,
            currency: values.currency.toUpperCase(),
          })
        )}
        className="space-y-5"
        noValidate
      >
        <SectionCard
          title="Informacje o restauracji"
          description="Nazwa i tagline pojawią się w hero, navbarze i emailach."
          icon={<Utensils className="h-4 w-4" />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nazwa</Label>
              <Input id="name" size="lg" error={Boolean(errors.name)} {...register("name")} />
              {errors.name && (
                <p className="mt-1 text-[12px] text-rose-600">{errors.name.message}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea
                id="tagline"
                rows={2}
                error={Boolean(errors.tagline)}
                {...register("tagline")}
              />
              {errors.tagline && (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.tagline.message as string}
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Kolor marki"
          description="Akcent CTA, badge'y, aktywne kroki. Zmiany widoczne globalnie po zapisaniu."
          icon={<Sparkles className="h-4 w-4" />}
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <div className="space-y-5">
              <div>
                <Label htmlFor="primaryColor">Wartość HEX</Label>
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-11 flex-none rounded-md border border-slate-200"
                    style={{
                      backgroundColor: HEX_RE.test(liveColor) ? liveColor : "#FF6B35",
                    }}
                    aria-hidden
                  />
                  <Input
                    id="primaryColor"
                    size="lg"
                    className="font-mono uppercase"
                    error={Boolean(errors.primaryColor)}
                    {...register("primaryColor")}
                  />
                </div>
                {errors.primaryColor ? (
                  <p className="mt-1 text-[12px] text-rose-600">
                    {errors.primaryColor.message}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[12px] text-slate-500">
                    Tak będzie wyglądać kolor marki na stronie klienta. Zmiana
                    zapisze się po kliknięciu „Zapisz".
                  </p>
                )}
              </div>

              <div>
                <div className="kicker mb-2">Sugerowane</div>
                <div className="flex flex-wrap items-center gap-2">
                  {SUGGESTED_SWATCHES.map((swatch) => {
                    const active =
                      liveColor.toUpperCase() === swatch.toUpperCase();
                    return (
                      <button
                        key={swatch}
                        type="button"
                        aria-label={`Wybierz kolor ${swatch}`}
                        onClick={() =>
                          setValue("primaryColor", swatch, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className={cn(
                          "h-10 w-10 rounded-md border-2 transition-transform focus:outline-none focus:ring-2 focus:ring-primary/40",
                          active
                            ? "border-slate-900 scale-105"
                            : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: swatch }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <ColorPreviewCard color={liveColor} />
          </div>
        </SectionCard>

        <SectionCard
          title="Kontakt i adres"
          description="Pokazywane w sekcji Kontakt na landingu oraz w stopce."
          icon={<Phone className="h-4 w-4" />}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                size="lg"
                className="font-mono text-[13px]"
                {...register("phone")}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                size="lg"
                type="email"
                error={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.email.message as string}
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addressLine">Ulica i numer</Label>
              <Input id="addressLine" size="lg" {...register("addressLine")} />
            </div>
            <div>
              <Label htmlFor="city">Miasto</Label>
              <Input id="city" size="lg" {...register("city")} />
            </div>
            <div>
              <Label htmlFor="postalCode">Kod pocztowy</Label>
              <Input
                id="postalCode"
                size="lg"
                className="font-mono"
                {...register("postalCode")}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="logoUrl">URL logo</Label>
              <Input
                id="logoUrl"
                size="lg"
                placeholder="https://…"
                className="font-mono text-[13px]"
                error={Boolean(errors.logoUrl)}
                {...register("logoUrl")}
              />
              {errors.logoUrl && (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.logoUrl.message as string}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="currency">Waluta (ISO 4217)</Label>
              <Input
                id="currency"
                size="lg"
                maxLength={3}
                className="font-mono uppercase"
                error={Boolean(errors.currency)}
                {...register("currency")}
              />
              {errors.currency && (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>
        </SectionCard>

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
