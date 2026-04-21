import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Textarea } from "@/shared/components/ui/Textarea";
import { RadioGroup, RadioGroupItem } from "@/shared/components/ui/RadioGroup";
import { extractProblem } from "@/shared/api/client";
import { placeOrder, type CreateOrderRequest } from "@/shared/api/orderApi";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { useIsRestaurantOpen } from "@/shared/hooks/useIsRestaurantOpen";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { lineTotal, useCartStore, useCartTotal } from "@/features/public/cart/cartStore";

const phoneRegex = /^\+?\d{9,11}$/;
const postalRegex = /^\d{2}-\d{3}$/;

const checkoutSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(2, "Imię i nazwisko: min. 2 znaki")
      .max(120, "Maks. 120 znaków"),
    customerPhone: z
      .string()
      .trim()
      .regex(phoneRegex, "Telefon: 9-11 cyfr (opcjonalny prefix +)"),
    customerEmail: z
      .string()
      .trim()
      .max(160, "Maks. 160 znaków")
      .optional()
      .or(z.literal("")),
    fulfillmentType: z.enum(["DELIVERY", "PICKUP"]),
    paymentMethod: z.enum(["CASH_ON_DELIVERY", "CASH_ON_PICKUP"]),
    deliveryAddress: z.object({
      street: z.string().trim(),
      buildingNumber: z.string().trim(),
      apartmentNumber: z.string().trim().max(20, "Maks. 20 znaków").optional(),
      postalCode: z.string().trim(),
      city: z.string().trim(),
      notes: z.string().trim().max(255, "Maks. 255 znaków").optional(),
    }),
    customerNotes: z.string().trim().max(500, "Maks. 500 znaków").optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.customerEmail &&
      !z.string().email().safeParse(data.customerEmail).success
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["customerEmail"],
        message: "Nieprawidłowy email",
      });
    }
    if (data.fulfillmentType === "DELIVERY") {
      if (data.paymentMethod !== "CASH_ON_DELIVERY") {
        ctx.addIssue({
          code: "custom",
          path: ["paymentMethod"],
          message: "Dla dostawy: płatność przy odbiorze (gotówka u kuriera)",
        });
      }
      const a = data.deliveryAddress;
      if (!a.street) {
        ctx.addIssue({
          code: "custom",
          path: ["deliveryAddress", "street"],
          message: "Ulica jest wymagana",
        });
      }
      if (!a.buildingNumber) {
        ctx.addIssue({
          code: "custom",
          path: ["deliveryAddress", "buildingNumber"],
          message: "Numer budynku jest wymagany",
        });
      }
      if (!postalRegex.test(a.postalCode)) {
        ctx.addIssue({
          code: "custom",
          path: ["deliveryAddress", "postalCode"],
          message: "Format kodu: XX-XXX",
        });
      }
      if (!a.city) {
        ctx.addIssue({
          code: "custom",
          path: ["deliveryAddress", "city"],
          message: "Miasto jest wymagane",
        });
      }
    } else {
      if (data.paymentMethod !== "CASH_ON_PICKUP") {
        ctx.addIssue({
          code: "custom",
          path: ["paymentMethod"],
          message: "Dla odbioru: płatność przy odbiorze osobistym",
        });
      }
    }
  });

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const defaultValues: CheckoutFormValues = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  fulfillmentType: "DELIVERY",
  paymentMethod: "CASH_ON_DELIVERY",
  deliveryAddress: {
    street: "",
    buildingNumber: "",
    apartmentNumber: "",
    postalCode: "",
    city: "",
    notes: "",
  },
  customerNotes: "",
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const total = useCartTotal();
  const clearCart = useCartStore((s) => s.clear);
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";
  const { isOpen: restaurantIsOpen } = useIsRestaurantOpen();
  const orderPlacedRef = useRef(false);

  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) {
      navigate("/menu", { replace: true });
    }
  }, [items.length, navigate]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
  });

  const fulfillmentType = watch("fulfillmentType");
  const isDelivery = fulfillmentType === "DELIVERY";

  const mutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: (data) => {
      orderPlacedRef.current = true;
      clearCart();
      toast.success(`Zamówienie ${data.orderNumber} przyjęte`);
      navigate(`/order/confirmation/${data.orderNumber}`, {
        state: { trackingToken: data.trackingToken, total: data.total },
      });
    },
    onError: (error) => {
      const problem = extractProblem(error);
      const message =
        problem?.detail ??
        problem?.title ??
        "Nie udało się złożyć zamówienia. Spróbuj ponownie.";
      toast.error(message);
    },
  });

  const onSubmit = (values: CheckoutFormValues) => {
    const payload: CreateOrderRequest = {
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail?.trim() ? values.customerEmail.trim() : null,
      fulfillmentType: values.fulfillmentType,
      paymentMethod: values.paymentMethod,
      deliveryAddress:
        values.fulfillmentType === "DELIVERY"
          ? {
              street: values.deliveryAddress.street,
              buildingNumber: values.deliveryAddress.buildingNumber,
              apartmentNumber: values.deliveryAddress.apartmentNumber?.trim()
                ? values.deliveryAddress.apartmentNumber.trim()
                : null,
              postalCode: values.deliveryAddress.postalCode,
              city: values.deliveryAddress.city,
              notes: values.deliveryAddress.notes?.trim()
                ? values.deliveryAddress.notes.trim()
                : null,
            }
          : null,
      customerNotes: values.customerNotes?.trim() ? values.customerNotes.trim() : null,
      items: items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        addonIds: it.addons.map((a) => a.addonId),
        quantity: it.quantity,
      })),
    };
    mutation.mutate(payload);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/menu" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Wróć do menu
          </Link>
          <span className="text-lg font-semibold">{settings?.name ?? "Restauracja"}</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-6 lg:pb-16">
        <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Złóż zamówienie</h1>

        {!restaurantIsOpen ? (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Restauracja jest teraz zamknięta. Zamówienia przyjmujemy w godzinach otwarcia.
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            id="checkout-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-6 lg:order-1 order-2"
          >
            <Section title="Dane kontaktowe">
              <Field label="Imię i nazwisko" htmlFor="customerName" error={errors.customerName?.message}>
                <Input
                  id="customerName"
                  autoComplete="name"
                  disabled={mutation.isPending}
                  {...register("customerName")}
                />
              </Field>
              <Field label="Telefon" htmlFor="customerPhone" error={errors.customerPhone?.message}>
                <Input
                  id="customerPhone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+48500600700"
                  disabled={mutation.isPending}
                  {...register("customerPhone")}
                />
              </Field>
              <Field
                label="Email (opcjonalny)"
                htmlFor="customerEmail"
                error={errors.customerEmail?.message}
              >
                <Input
                  id="customerEmail"
                  type="email"
                  autoComplete="email"
                  disabled={mutation.isPending}
                  {...register("customerEmail")}
                />
              </Field>
            </Section>

            <Section title="Sposób realizacji">
              <Controller
                control={control}
                name="fulfillmentType"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setValue(
                        "paymentMethod",
                        value === "DELIVERY" ? "CASH_ON_DELIVERY" : "CASH_ON_PICKUP",
                        { shouldValidate: true }
                      );
                    }}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <RadioCard value="DELIVERY" title="Dostawa" subtitle="Pod wskazany adres" />
                    <RadioCard value="PICKUP" title="Odbiór osobisty" subtitle="W lokalu" />
                  </RadioGroup>
                )}
              />
            </Section>

            {isDelivery ? (
              <Section title="Adres dostawy">
                <div className="grid gap-3 sm:grid-cols-[1fr_140px_140px]">
                  <Field
                    label="Ulica"
                    htmlFor="street"
                    error={errors.deliveryAddress?.street?.message}
                  >
                    <Input
                      id="street"
                      autoComplete="address-line1"
                      disabled={mutation.isPending}
                      {...register("deliveryAddress.street")}
                    />
                  </Field>
                  <Field
                    label="Nr budynku"
                    htmlFor="buildingNumber"
                    error={errors.deliveryAddress?.buildingNumber?.message}
                  >
                    <Input
                      id="buildingNumber"
                      disabled={mutation.isPending}
                      {...register("deliveryAddress.buildingNumber")}
                    />
                  </Field>
                  <Field
                    label="Nr mieszkania"
                    htmlFor="apartmentNumber"
                    error={errors.deliveryAddress?.apartmentNumber?.message}
                  >
                    <Input
                      id="apartmentNumber"
                      disabled={mutation.isPending}
                      {...register("deliveryAddress.apartmentNumber")}
                    />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-[140px_1fr]">
                  <Field
                    label="Kod pocztowy"
                    htmlFor="postalCode"
                    error={errors.deliveryAddress?.postalCode?.message}
                  >
                    <Input
                      id="postalCode"
                      placeholder="00-000"
                      autoComplete="postal-code"
                      disabled={mutation.isPending}
                      {...register("deliveryAddress.postalCode")}
                    />
                  </Field>
                  <Field
                    label="Miasto"
                    htmlFor="city"
                    error={errors.deliveryAddress?.city?.message}
                  >
                    <Input
                      id="city"
                      autoComplete="address-level2"
                      disabled={mutation.isPending}
                      {...register("deliveryAddress.city")}
                    />
                  </Field>
                </div>
                <Field
                  label="Wskazówki dla kuriera (opcjonalne)"
                  htmlFor="addressNotes"
                  error={errors.deliveryAddress?.notes?.message}
                >
                  <Input
                    id="addressNotes"
                    placeholder="np. domofon, piętro"
                    disabled={mutation.isPending}
                    {...register("deliveryAddress.notes")}
                  />
                </Field>
              </Section>
            ) : null}

            <Section title="Sposób płatności">
              <p className="mb-2 text-xs text-slate-500">
                {isDelivery
                  ? "Płacisz gotówką u kuriera w momencie dostawy."
                  : "Płacisz gotówką przy odbiorze w lokalu."}
              </p>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <RadioGroup
                    value={field.value}
                    onValueChange={field.onChange}
                    className="grid gap-3"
                  >
                    {isDelivery ? (
                      <RadioCard
                        value="CASH_ON_DELIVERY"
                        title="Gotówka u kuriera"
                        subtitle="Przygotuj odliczoną kwotę"
                      />
                    ) : (
                      <RadioCard
                        value="CASH_ON_PICKUP"
                        title="Gotówka przy odbiorze"
                        subtitle="Płacisz w lokalu"
                      />
                    )}
                  </RadioGroup>
                )}
              />
              {errors.paymentMethod ? (
                <p className="mt-1 text-xs font-medium text-rose-600">
                  {errors.paymentMethod.message}
                </p>
              ) : null}
            </Section>

            <Section title="Uwagi do zamówienia (opcjonalne)">
              <Field label="" htmlFor="customerNotes" error={errors.customerNotes?.message}>
                <Textarea
                  id="customerNotes"
                  placeholder="np. bez cebuli, dzwonek nie działa"
                  disabled={mutation.isPending}
                  {...register("customerNotes")}
                />
              </Field>
            </Section>

            <div className="hidden lg:block">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={mutation.isPending || !restaurantIsOpen}
              >
                {mutation.isPending
                  ? "Składanie zamówienia…"
                  : !restaurantIsOpen
                  ? "Restauracja zamknięta"
                  : `Zamów i zapłać ${formatPrice(total, currency)}`}
              </Button>
            </div>
          </form>

          <aside className="lg:order-2 order-1 lg:sticky lg:top-20 lg:h-fit">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold">Podsumowanie</h2>
              <ul className="mt-4 divide-y divide-slate-100">
                {items.map((item) => (
                  <li key={item.lineKey} className="py-3 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900">
                          {item.productName}
                          {item.variantName ? (
                            <span className="font-normal text-slate-500">
                              {" "}
                              · {item.variantName}
                            </span>
                          ) : null}
                        </p>
                        {item.addons.length > 0 ? (
                          <ul className="mt-1 space-y-0.5 text-xs text-slate-500">
                            {item.addons.map((a) => (
                              <li key={a.addonId}>+ {a.name}</li>
                            ))}
                          </ul>
                        ) : null}
                        <p className="mt-1 text-xs text-slate-500">
                          {item.quantity} × {formatPrice(item.unitPrice + item.addons.reduce((acc, a) => acc + a.price, 0), currency)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-slate-900">
                        {formatPrice(lineTotal(item), currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="text-sm font-medium text-slate-700">Razem</span>
                <span className="text-lg font-bold text-slate-900">
                  {formatPrice(total, currency)}
                </span>
              </div>
            </div>

          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.05)] backdrop-blur lg:hidden">
        <Button
          type="submit"
          form="checkout-form"
          size="lg"
          className="w-full"
          disabled={mutation.isPending || !restaurantIsOpen}
        >
          {mutation.isPending
            ? "Składanie zamówienia…"
            : !restaurantIsOpen
            ? "Restauracja zamknięta"
            : `Zamów i zapłać ${formatPrice(total, currency)}`}
        </Button>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}

function Field({ label, htmlFor, error, children }: FieldProps) {
  return (
    <div>
      {label ? (
        <Label htmlFor={htmlFor} className="mb-1 block">
          {label}
        </Label>
      ) : null}
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-rose-600">{error}</p> : null}
    </div>
  );
}

interface RadioCardProps {
  value: string;
  title: string;
  subtitle: string;
}

function RadioCard({ value, title, subtitle }: RadioCardProps) {
  return (
    <Label
      className="flex cursor-pointer items-start gap-3 rounded-md border border-slate-200 bg-white p-3 transition-colors hover:border-primary has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
    >
      <RadioGroupItem value={value} className="mt-0.5" />
      <span className="flex flex-col">
        <span className="text-sm font-semibold text-slate-900">{title}</span>
        <span className="text-xs text-slate-500">{subtitle}</span>
      </span>
    </Label>
  );
}
