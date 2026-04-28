import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import {
  AlertCircle,
  ArrowLeft,
  ChevronDown,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Textarea } from "@/shared/components/ui/Textarea";
import { cn } from "@/shared/lib/cn";
import { extractProblem } from "@/shared/api/client";
import { placeOrder, type CreateOrderRequest } from "@/shared/api/orderApi";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { useIsRestaurantOpen } from "@/shared/hooks/useIsRestaurantOpen";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { lineTotal, useCartStore, useCartTotal } from "@/features/public/cart/cartStore";
import { fetchDeliveryCities } from "./api";
import { useDeliveryCheck } from "./hooks/useDeliveryCheck";
import { DeliveryZoneBadge } from "./components/DeliveryZoneBadge";
import { maskPostalCodeInput } from "@/features/admin/delivery-zones/lib/postalCode";

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
  const [summaryOpen, setSummaryOpen] = useState(false);

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

  const watchedCity = watch("deliveryAddress.city") ?? "";
  const watchedPostal = watch("deliveryAddress.postalCode") ?? "";
  const { data: citiesData } = useQuery({
    queryKey: ["public", "delivery-cities"],
    queryFn: fetchDeliveryCities,
    staleTime: 5 * 60_000,
    enabled: isDelivery,
  });
  const { data: deliveryCheck, isFetching: deliveryChecking } = useDeliveryCheck(
    watchedCity,
    watchedPostal,
    isDelivery,
  );
  const deliveryUnavailable =
    isDelivery && deliveryCheck?.status === "UNAVAILABLE";
  const deliveryFee = isDelivery && deliveryCheck && deliveryCheck.status !== "UNAVAILABLE"
    ? deliveryCheck.fee
    : 0;
  const previewTotal = Number(total) + (isDelivery ? deliveryFee : 0);

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

  const submitCtaLabel = mutation.isPending
    ? "Składanie zamówienia…"
    : !restaurantIsOpen
      ? "Restauracja zamknięta"
      : deliveryUnavailable
        ? "Dostawa niedostępna pod tym adresem"
        : `Złóż zamówienie — ${formatPrice(previewTotal, currency)}`;
  const submitDisabled = mutation.isPending || !restaurantIsOpen || deliveryUnavailable;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-10">
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Wróć do menu
          </Link>
          <span className="text-[15px] font-semibold">
            {settings?.name ?? "Restauracja"}
          </span>
        </div>
      </header>

      <div className="md:hidden border-b border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => setSummaryOpen((v) => !v)}
          aria-expanded={summaryOpen}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div>
            <div className="text-[12px] text-slate-500">Podsumowanie</div>
            <div className="text-[15px] font-semibold text-slate-900">
              {formatPrice(total, currency)}{" "}
              <span className="text-[12px] font-normal text-slate-500">
                · {items.length} {itemsNoun(items.length)}
              </span>
            </div>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-slate-400 transition-transform duration-base",
              summaryOpen && "rotate-180"
            )}
          />
        </button>
        {summaryOpen ? (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-3">
            <SummaryCardContents
              items={items}
              subtotal={total}
              deliveryFee={isDelivery ? deliveryFee : null}
              total={previewTotal}
              currency={currency}
              compact
            />
          </div>
        ) : null}
      </div>

      <main className="mx-auto max-w-6xl px-4 pb-32 pt-6 md:px-10 md:pb-16 md:pt-10">
        <h1 className="mb-6 text-[28px] font-semibold tracking-tight text-slate-900 md:mb-8 md:text-[36px]">
          Zamówienie
        </h1>

        {!restaurantIsOpen ? (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Restauracja jest teraz zamknięta. Zamówienia przyjmujemy w godzinach otwarcia.
          </div>
        ) : null}

        <div className="grid gap-5 md:gap-8 lg:grid-cols-[1fr_420px]">
          <form
            id="checkout-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            <Section kicker="1 · Dane kontaktowe">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Imię i nazwisko"
                  htmlFor="customerName"
                  error={errors.customerName?.message}
                >
                  <Input
                    id="customerName"
                    autoComplete="name"
                    disabled={mutation.isPending}
                    error={!!errors.customerName}
                    {...register("customerName")}
                  />
                </Field>
                <Field
                  label="Telefon"
                  htmlFor="customerPhone"
                  error={errors.customerPhone?.message}
                >
                  <Input
                    id="customerPhone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+48500600700"
                    disabled={mutation.isPending}
                    error={!!errors.customerPhone}
                    {...register("customerPhone")}
                  />
                </Field>
              </div>
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
                  error={!!errors.customerEmail}
                  {...register("customerEmail")}
                />
              </Field>
            </Section>

            <Section kicker="2 · Typ realizacji">
              <Controller
                control={control}
                name="fulfillmentType"
                render={({ field }) => (
                  <div
                    role="radiogroup"
                    aria-label="Typ realizacji"
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    <FulfillmentTile
                      value="DELIVERY"
                      selected={field.value === "DELIVERY"}
                      icon={<Truck className="h-5 w-5" />}
                      title="Dostawa"
                      subtitle="~35 min pod Twoje drzwi"
                      onSelect={() => {
                        field.onChange("DELIVERY");
                        setValue("paymentMethod", "CASH_ON_DELIVERY", {
                          shouldValidate: true,
                        });
                      }}
                    />
                    <FulfillmentTile
                      value="PICKUP"
                      selected={field.value === "PICKUP"}
                      icon={<ShoppingBag className="h-5 w-5" />}
                      title="Odbiór osobisty"
                      subtitle="~25 min od złożenia"
                      onSelect={() => {
                        field.onChange("PICKUP");
                        setValue("paymentMethod", "CASH_ON_PICKUP", {
                          shouldValidate: true,
                        });
                      }}
                    />
                  </div>
                )}
              />
            </Section>

            {isDelivery ? (
              <Section kicker="3 · Adres dostawy">
                <div className="grid gap-4 sm:grid-cols-[1fr_140px_140px]">
                  <Field
                    label="Ulica"
                    htmlFor="street"
                    error={errors.deliveryAddress?.street?.message}
                  >
                    <Input
                      id="street"
                      autoComplete="address-line1"
                      disabled={mutation.isPending}
                      error={!!errors.deliveryAddress?.street}
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
                      error={!!errors.deliveryAddress?.buildingNumber}
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
                      error={!!errors.deliveryAddress?.apartmentNumber}
                      {...register("deliveryAddress.apartmentNumber")}
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
                  <Field
                    label="Kod pocztowy"
                    htmlFor="postalCode"
                    error={errors.deliveryAddress?.postalCode?.message}
                  >
                    <Controller
                      control={control}
                      name="deliveryAddress.postalCode"
                      render={({ field }) => (
                        <Input
                          id="postalCode"
                          placeholder="00-000"
                          autoComplete="postal-code"
                          disabled={mutation.isPending}
                          error={!!errors.deliveryAddress?.postalCode}
                          inputMode="numeric"
                          maxLength={6}
                          value={field.value}
                          onChange={(e) => field.onChange(maskPostalCodeInput(e.target.value))}
                          onBlur={field.onBlur}
                          name={field.name}
                        />
                      )}
                    />
                  </Field>
                  <Field
                    label="Miasto"
                    htmlFor="city"
                    error={errors.deliveryAddress?.city?.message}
                  >
                    <Input
                      id="city"
                      list="delivery-cities"
                      autoComplete="address-level2"
                      disabled={mutation.isPending}
                      error={!!errors.deliveryAddress?.city}
                      {...register("deliveryAddress.city")}
                    />
                    <datalist id="delivery-cities">
                      {(citiesData ?? []).map((c) => (
                        <option key={c.display} value={c.display} />
                      ))}
                    </datalist>
                  </Field>
                </div>
                <DeliveryZoneBadge
                  result={deliveryCheck}
                  loading={deliveryChecking && !deliveryCheck}
                  currency={currency}
                />
                <Field
                  label="Wskazówki dla kuriera (opcjonalne)"
                  htmlFor="addressNotes"
                  error={errors.deliveryAddress?.notes?.message}
                >
                  <Input
                    id="addressNotes"
                    placeholder="np. domofon, piętro"
                    disabled={mutation.isPending}
                    error={!!errors.deliveryAddress?.notes}
                    {...register("deliveryAddress.notes")}
                  />
                </Field>
              </Section>
            ) : null}

            <Section kicker={isDelivery ? "4 · Metoda płatności" : "3 · Metoda płatności"}>
              <Controller
                control={control}
                name="paymentMethod"
                render={({ field }) => (
                  <PaymentTile
                    selected={
                      field.value ===
                      (isDelivery ? "CASH_ON_DELIVERY" : "CASH_ON_PICKUP")
                    }
                    title={isDelivery ? "Gotówka przy dostawie" : "Gotówka przy odbiorze"}
                    subtitle={
                      isDelivery
                        ? "Kurier wyda resztę."
                        : "Płacisz w lokalu przy odbiorze."
                    }
                    onSelect={() =>
                      field.onChange(
                        isDelivery ? "CASH_ON_DELIVERY" : "CASH_ON_PICKUP"
                      )
                    }
                  />
                )}
              />
              {errors.paymentMethod ? (
                <InlineError message={errors.paymentMethod.message!} />
              ) : null}
            </Section>

            <Section kicker={isDelivery ? "5 · Uwagi do zamówienia" : "4 · Uwagi do zamówienia"}>
              <Label htmlFor="customerNotes">
                Uwagi{" "}
                <span className="font-normal text-slate-500">· opcjonalne</span>
              </Label>
              <Textarea
                id="customerNotes"
                rows={2}
                placeholder="np. bez cebuli na całym zamówieniu"
                disabled={mutation.isPending}
                error={!!errors.customerNotes}
                {...register("customerNotes")}
              />
              {errors.customerNotes ? (
                <InlineError message={errors.customerNotes.message!} />
              ) : null}
            </Section>
          </form>

          <aside className="hidden lg:block">
            <div className="sticky top-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="text-[15px] font-semibold text-slate-900">
                  Podsumowanie
                </div>
              </div>
              <SummaryCardContents
                items={items}
                subtotal={total}
                deliveryFee={isDelivery ? deliveryFee : null}
                total={previewTotal}
                currency={currency}
              />
              <div className="p-5">
                <Button
                  type="submit"
                  form="checkout-form"
                  variant="primary"
                  size="xl"
                  className="w-full"
                  disabled={submitDisabled}
                >
                  {submitCtaLabel}
                </Button>
                <p className="mt-3 text-center text-[11px] text-slate-400">
                  Klikając potwierdzasz, że Twoje dane są poprawne.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(15,23,42,0.05)] backdrop-blur lg:hidden">
        <Button
          type="submit"
          form="checkout-form"
          variant="primary"
          size="xl"
          className="w-full"
          disabled={submitDisabled}
        >
          {submitCtaLabel}
        </Button>
      </div>
    </div>
  );
}

interface SectionProps {
  kicker: string;
  children: React.ReactNode;
}

function Section({ kicker, children }: SectionProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 md:p-6">
      <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400">
        {kicker}
      </div>
      <div className="space-y-4">{children}</div>
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
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <InlineError message={error} /> : null}
    </div>
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[12px] font-medium text-rose-600">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}

interface FulfillmentTileProps {
  value: string;
  selected: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onSelect: () => void;
}

function FulfillmentTile({
  selected,
  icon,
  title,
  subtitle,
  onSelect,
}: FulfillmentTileProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 rounded-lg p-4 text-left transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 md:p-5",
        selected
          ? "border-2 border-primary bg-primary/5"
          : "border border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary" : "border-slate-300"
        )}
      >
        {selected ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
      </span>
      <span className="flex flex-col">
        <span className="flex items-center gap-2 text-slate-900">
          <span className={selected ? "text-primary" : "text-slate-700"}>{icon}</span>
          <span className="text-[14px] font-semibold">{title}</span>
        </span>
        <span className="mt-0.5 text-[12px] text-slate-500">{subtitle}</span>
      </span>
    </button>
  );
}

interface PaymentTileProps {
  selected: boolean;
  title: string;
  subtitle: string;
  onSelect: () => void;
}

function PaymentTile({ selected, title, subtitle, onSelect }: PaymentTileProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg p-4 text-left transition-colors duration-fast focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
        selected
          ? "border-2 border-primary bg-primary/5"
          : "border border-slate-200 bg-white hover:border-slate-300"
      )}
    >
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary" : "border-slate-300"
        )}
      >
        {selected ? <span className="h-2.5 w-2.5 rounded-full bg-primary" /> : null}
      </span>
      <span className="flex flex-col">
        <span className="text-[14px] font-semibold text-slate-900">{title}</span>
        <span className="mt-0.5 text-[12px] text-slate-500">{subtitle}</span>
      </span>
    </button>
  );
}

interface SummaryCardContentsProps {
  items: ReturnType<typeof useCartStore.getState>["items"];
  subtotal: string | number;
  deliveryFee: number | null;
  total: string | number;
  currency: string;
  compact?: boolean;
}

function SummaryCardContents({
  items,
  subtotal,
  deliveryFee,
  total,
  currency,
  compact,
}: SummaryCardContentsProps) {
  return (
    <>
      <ul
        className={cn(
          "divide-y divide-slate-100",
          compact ? "px-0" : "px-6"
        )}
      >
        {items.map((item) => {
          const unit =
            item.unitPrice + item.addons.reduce((acc, a) => acc + a.price, 0);
          return (
            <li
              key={item.lineKey}
              className="flex items-start justify-between gap-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-[14px] font-medium text-slate-900">
                  <span className="text-slate-500">{item.quantity}× </span>
                  {item.productName}
                </p>
                {(item.variantName || item.addons.length > 0) && (
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {[
                      item.variantName,
                      ...item.addons.map((a) => `+${a.name}`),
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <p className="mt-0.5 text-[11px] text-slate-400">
                  {item.quantity} × {formatPrice(unit, currency)}
                </p>
              </div>
              <span className="shrink-0 text-[14px] font-semibold text-slate-900">
                {formatPrice(lineTotal(item), currency)}
              </span>
            </li>
          );
        })}
      </ul>
      <div
        className={cn(
          "border-t border-slate-200 bg-slate-50 space-y-1.5",
          compact ? "mt-3 rounded-md px-3 py-3" : "px-6 py-4"
        )}
      >
        <div className="flex items-center justify-between text-[13px] text-slate-600">
          <span>Suma produktów</span>
          <span>{formatPrice(subtotal, currency)}</span>
        </div>
        {deliveryFee !== null && (
          <div className="flex items-center justify-between text-[13px] text-slate-600">
            <span>Dostawa</span>
            <span>{formatPrice(deliveryFee, currency)}</span>
          </div>
        )}
        <div className="flex items-center justify-between pt-1.5">
          <span className="text-[14px] font-semibold text-slate-900">Razem</span>
          <span className="text-[20px] font-semibold text-slate-900">
            {formatPrice(total, currency)}
          </span>
        </div>
      </div>
    </>
  );
}

function itemsNoun(n: number): string {
  if (n === 1) return "pozycja";
  const last = n % 10;
  const lastTwo = n % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return "pozycje";
  return "pozycji";
}
