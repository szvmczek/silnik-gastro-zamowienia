import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import { applyPrimaryColor } from "@/shared/theme/themeLoader";

const nullableOptional = (schema: z.ZodString) =>
  z
    .union([schema, z.literal("")])
    .transform((v) => (v === "" ? null : v))
    .nullable()
    .optional();

const schema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(120),
  tagline: z
    .string()
    .max(200)
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Kolor musi być w formacie #RRGGBB"),
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
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tagline: "",
      primaryColor: "#E11D48",
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

  const liveColor = watch("primaryColor");
  useEffect(() => {
    if (liveColor && /^#[0-9A-Fa-f]{6}$/.test(liveColor)) {
      applyPrimaryColor(liveColor);
    }
  }, [liveColor]);

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
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się zapisać ustawień");
    },
  });

  if (isLoading) {
    return <div className="text-sm text-slate-500">Ładowanie ustawień…</div>;
  }
  if (isError || !data) {
    return (
      <div className="text-sm text-red-600">Nie udało się pobrać ustawień. Odśwież stronę.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Ustawienia restauracji</h1>
        <p className="mt-1 text-sm text-slate-500">
          Zmiany nazwy, kolorystyki i kontaktu pojawią się natychmiast na stronie
          publicznej.
        </p>
      </div>

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
        className="space-y-6"
        noValidate
      >
        <Card>
          <CardHeader>
            <CardTitle>Dane podstawowe</CardTitle>
            <CardDescription>Nazwa restauracji i opisowy tagline.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">Nazwa</Label>
              <Input id="name" {...register("name")} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea id="tagline" rows={2} {...register("tagline")} />
              {errors.tagline && (
                <p className="mt-1 text-xs text-red-600">{errors.tagline.message as string}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>
              Kolor marki zmienia się na żywo — wpływa na przyciski i akcenty.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="primaryColor">Kolor główny</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  aria-label="Wybierz kolor"
                  className="h-10 w-14 cursor-pointer rounded-md border border-slate-300"
                  value={liveColor}
                  onChange={(e) => {
                    const v = e.target.value.toUpperCase();
                    reset({ ...watch(), primaryColor: v }, { keepDirty: true, keepTouched: true });
                  }}
                />
                <Input id="primaryColor" className="font-mono" {...register("primaryColor")} />
              </div>
              {errors.primaryColor && (
                <p className="mt-1 text-xs text-red-600">{errors.primaryColor.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="logoUrl">URL logo</Label>
              <Input id="logoUrl" placeholder="https://…" {...register("logoUrl")} />
              {errors.logoUrl && (
                <p className="mt-1 text-xs text-red-600">{errors.logoUrl.message as string}</p>
              )}
            </div>
            <div>
              <Label htmlFor="currency">Waluta (ISO 4217)</Label>
              <Input id="currency" maxLength={3} className="uppercase" {...register("currency")} />
              {errors.currency && (
                <p className="mt-1 text-xs text-red-600">{errors.currency.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kontakt i adres</CardTitle>
            <CardDescription>Pokazywane w sekcji Kontakt na landingu.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" {...register("phone")} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message as string}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="addressLine">Ulica i numer</Label>
              <Input id="addressLine" {...register("addressLine")} />
            </div>
            <div>
              <Label htmlFor="city">Miasto</Label>
              <Input id="city" {...register("city")} />
            </div>
            <div>
              <Label htmlFor="postalCode">Kod pocztowy</Label>
              <Input id="postalCode" {...register("postalCode")} />
            </div>
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
