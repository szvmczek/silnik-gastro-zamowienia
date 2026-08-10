import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { extractProblem } from "@/shared/api/client";
import { placeOrder, type CreateOrderRequest } from "@/shared/api/orderApi";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { useIsRestaurantOpen } from "@/shared/hooks/useIsRestaurantOpen";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { formatPhoneDisplay } from "@/shared/lib/formatPhone";
import { plural } from "@/shared/lib/plural";
import { lineTotal, useCartStore, useCartTotal } from "@/features/public/cart/cartStore";
import { cartLineMeta } from "@/features/public/cart/cartLineMeta";
import { PiecHeader } from "@/features/public/shared/PiecHeader";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { RollingNumber } from "@/shared/motion/RollingNumber";
import { cn } from "@/shared/lib/cn";
import { fetchDeliveryCities } from "./api";
import { useDeliveryCheck } from "./hooks/useDeliveryCheck";
import { PiecField, PiecInput, PiecTextarea } from "./components/PiecField";
import { CashChangeChips, type CashChoice } from "./components/CashChangeChips";
import { maskPostalCodeInput } from "@/features/admin/delivery-zones/lib/postalCode";

const phoneRegex = /^\+?\d{9,11}$/;
const postalRegex = /^\d{2}-\d{3}$/;

const checkoutSchema = z
  .object({
    customerName: z.string().trim().min(2, "Podaj imię").max(120, "Maks. 120 znaków"),
    customerPhone: z.string().trim().regex(phoneRegex, "Telefon: 9-11 cyfr"),
    customerEmail: z.string().trim().max(160, "Maks. 160 znaków").optional().or(z.literal("")),
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
    if (data.customerEmail && !z.string().email().safeParse(data.customerEmail).success) {
      ctx.addIssue({ code: "custom", path: ["customerEmail"], message: "Nieprawidłowy e-mail" });
    }
    if (data.fulfillmentType === "DELIVERY") {
      if (data.paymentMethod !== "CASH_ON_DELIVERY") {
        ctx.addIssue({
          code: "custom",
          path: ["paymentMethod"],
          message: "Dla dostawy: gotówka u kuriera",
        });
      }
      const a = data.deliveryAddress;
      if (!a.street) {
        ctx.addIssue({
          code: "custom",
          path: ["deliveryAddress", "street"],
          message: "Podaj ulicę",
        });
      }
      if (!a.buildingNumber) {
        ctx.addIssue({
          code: "custom",
          path: ["deliveryAddress", "buildingNumber"],
          message: "Podaj numer domu",
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
          message: "Podaj miasto",
        });
      }
    } else if (data.paymentMethod !== "CASH_ON_PICKUP") {
      ctx.addIssue({
        code: "custom",
        path: ["paymentMethod"],
        message: "Dla odbioru: gotówka na miejscu",
      });
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
  const subtotal = useCartTotal();
  const clearCart = useCartStore((s) => s.clear);
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";
  const { isOpen } = useIsRestaurantOpen();
  const restaurantIsOpen = isOpen && !settings?.manualClosedReason;
  const orderPlacedRef = useRef(false);
  // Rozwinięte na wejściu — klient ma od razu widzieć, co zamawia.
  // Zwinięcie zostaje dostępne dla tych, którzy chcą krótszy formularz.
  const [summaryOpen, setSummaryOpen] = useState(true);
  // D-03 — null = klient jeszcze nie wybrał; wybór jest wymagany do
  // złożenia zamówienia. „Odliczoną kwotą" wysyłamy jako sumę zamówienia,
  // żeby w bazie null znaczyło wyłącznie „brak danych" (patrz
  // shared/lib/cashChange).
  const [cashChoice, setCashChoice] = useState<CashChoice>(null);

  useEffect(() => {
    if (items.length === 0 && !orderPlacedRef.current) {
      navigate("/menu", { replace: true });
    }
  }, [items.length, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema), defaultValues });

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

  const deliveryUnavailable = isDelivery && deliveryCheck?.status === "UNAVAILABLE";
  const zoneResolved = isDelivery && deliveryCheck && !deliveryUnavailable;
  const deliveryFee = zoneResolved ? deliveryCheck.fee : 0;
  const grandTotal = subtotal + (isDelivery ? deliveryFee : 0);

  const minOrder = Number(settings?.minOrderAmount ?? 0);
  const belowMinimum = isDelivery && minOrder > 0 && subtotal < minOrder;

  const setFulfillment = (next: "DELIVERY" | "PICKUP") => {
    setValue("fulfillmentType", next, { shouldValidate: false });
    setValue("paymentMethod", next === "DELIVERY" ? "CASH_ON_DELIVERY" : "CASH_ON_PICKUP");
  };

  const mutation = useMutation({
    mutationFn: placeOrder,
    onSuccess: (data) => {
      orderPlacedRef.current = true;
      const snapshot = [...items];
      clearCart();
      navigate(`/order/confirmation/${data.orderNumber}`, {
        state: {
          trackingToken: data.trackingToken,
          total: data.total,
          items: snapshot,
          subtotal,
          deliveryFee: isDelivery ? deliveryFee : null,
          cashChangeFrom: data.cashChangeFrom,
        },
      });
    },
    onError: (error) => {
      const problem = extractProblem(error);
      toast.error(
        problem?.detail ?? problem?.title ?? "Nie udało się złożyć zamówienia. Spróbuj ponownie.",
      );
    },
  });

  /** Kwota, którą klient deklaruje mieć przy sobie. */
  const cashChangeFrom =
    cashChoice === "EXACT" ? grandTotal : typeof cashChoice === "number" ? cashChoice : null;

  /** Pierwszy powód, dla którego nie da się złożyć zamówienia. */
  const blockingHint = useMemo(() => {
    if (!items.length) return "Koszyk jest pusty — wróć do menu.";
    if (!restaurantIsOpen) return "Lokal jest teraz zamknięty.";
    if (deliveryUnavailable) return "Adres poza strefą — przełącz na odbiór osobisty.";
    if (belowMinimum) {
      return `Dostawy od ${formatPrice(minOrder, currency)} — brakuje ${formatPrice(minOrder - subtotal, currency)}.`;
    }
    // Bez tej decyzji kurier nie wie, ile przygotować na wydanie.
    if (cashChoice === null) return "Wybierz, jak rozliczysz gotówkę.";
    if (typeof cashChoice === "number" && cashChoice < grandTotal) {
      return `Kwota do rozmienienia musi być co najmniej ${formatPrice(grandTotal, currency)}.`;
    }
    return null;
  }, [
    items.length,
    restaurantIsOpen,
    deliveryUnavailable,
    belowMinimum,
    minOrder,
    subtotal,
    currency,
    cashChoice,
    grandTotal,
  ]);

  const submitDisabled = Boolean(blockingHint) || mutation.isPending;

  const onSubmit = (values: CheckoutFormValues) => {
    if (submitDisabled) return;
    const payload: CreateOrderRequest = {
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail?.trim() ? values.customerEmail.trim() : null,
      fulfillmentType: values.fulfillmentType,
      paymentMethod: values.paymentMethod,
      cashChangeFrom,
      deliveryAddress:
        values.fulfillmentType === "DELIVERY"
          ? {
              street: values.deliveryAddress.street,
              buildingNumber: values.deliveryAddress.buildingNumber,
              apartmentNumber: values.deliveryAddress.apartmentNumber?.trim() || null,
              postalCode: values.deliveryAddress.postalCode,
              city: values.deliveryAddress.city,
              notes: values.deliveryAddress.notes?.trim() || null,
            }
          : null,
      customerNotes: values.customerNotes?.trim() || null,
      items: items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        addonIds: it.addons.map((a) => a.addonId),
        quantity: it.quantity,
      })),
    };
    mutation.mutate(payload);
  };

  if (items.length === 0) return null;

  const pickupAddress = [settings?.addressLine, settings?.city].filter(Boolean).join(", ");
  const itemsCount = items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <>
      <PiecHeader size="form" back={{ to: "/upsell", label: "Wróć" }} title="Zamówienie" />

      <PiecShell size="form" className="pb-11 pt-4">
        {/* Podsumowanie rozwinięte domyślnie, z możliwością zwinięcia. */}
        <section className="rounded-[14px] border border-piec-ink/10 bg-piec-surface2 p-4">
          <button
            type="button"
            onClick={() => setSummaryOpen((v) => !v)}
            aria-expanded={summaryOpen}
            className="flex min-h-[24px] w-full items-center justify-between gap-3"
          >
            <span className="text-[14.5px] font-semibold">
              {itemsCount} {plural(itemsCount, "pozycja", "pozycje", "pozycji")} ·{" "}
              {formatPrice(subtotal, currency)}
            </span>
            <span className="text-[13.5px] font-semibold text-primary">
              {summaryOpen ? "zwiń" : "pokaż"}
            </span>
          </button>
          {summaryOpen ? (
            <ul className="mt-2.5 border-t border-piec-ink/10 pt-2">
              {items.map((item) => (
                <li key={item.lineKey} className="py-1.5">
                  <div className="flex justify-between gap-2.5 text-sm font-semibold">
                    <span>
                      {item.productName}
                      {item.quantity > 1 ? ` ×${item.quantity}` : ""}
                    </span>
                    <span className="whitespace-nowrap">
                      {formatPrice(lineTotal(item), currency)}
                    </span>
                  </div>
                  {cartLineMeta(item).map((line) => (
                    <p key={line} className="text-[12.5px] leading-[1.45] text-piec-ink/55">
                      {line}
                    </p>
                  ))}
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Typ realizacji */}
          <div role="radiogroup" aria-label="Sposób realizacji" className="mt-4 grid grid-cols-2 gap-2.5">
            {(["DELIVERY", "PICKUP"] as const).map((type) => {
              const active = fulfillmentType === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setFulfillment(type)}
                  className={cn(
                    "flex min-h-[50px] items-center justify-center rounded-xl text-center text-[14.5px] transition-colors",
                    active
                      ? "bg-primary font-bold text-onPrimary"
                      : "border-[1.5px] border-piec-ink/25 font-semibold text-piec-ink/80 hover:border-primary",
                  )}
                >
                  {type === "DELIVERY" ? "DOSTAWA" : "ODBIÓR OSOBISTY"}
                </button>
              );
            })}
          </div>

          {!isDelivery && pickupAddress ? (
            <p className="mt-3 rounded-xl border border-piec-ink/10 bg-piec-surface2 px-4 py-3 text-sm leading-[1.6] text-piec-ink/75">
              Odbiór: <b className="text-piec-ink">{pickupAddress}</b>.
              {settings?.defaultPreparationMinutes
                ? ` Zwykle ${settings.defaultPreparationMinutes} minut od zamówienia.`
                : ""}{" "}
              Płatność gotówką na miejscu.
            </p>
          ) : null}

          {/* Dane kontaktowe */}
          <div className="mt-3.5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))]">
            <PiecField label="Imię" error={errors.customerName?.message}>
              <PiecInput
                {...register("customerName")}
                invalid={Boolean(errors.customerName)}
                placeholder="np. Marta"
                autoComplete="name"
              />
            </PiecField>
            <PiecField label="Telefon" error={errors.customerPhone?.message}>
              <PiecInput
                {...register("customerPhone")}
                invalid={Boolean(errors.customerPhone)}
                placeholder="np. 512 384 067"
                inputMode="tel"
                autoComplete="tel"
              />
            </PiecField>
            {/* D-04: zbieramy, nie wysyłamy — etykieta bez obietnicy maila. */}
            <PiecField label="E-mail" optional error={errors.customerEmail?.message}>
              <PiecInput
                {...register("customerEmail")}
                invalid={Boolean(errors.customerEmail)}
                placeholder="np. marta@wp.pl"
                inputMode="email"
                autoComplete="email"
              />
            </PiecField>
          </div>

          {isDelivery ? (
            <>
              <PiecField
                label="Ulica"
                className="mt-3.5"
                error={errors.deliveryAddress?.street?.message}
              >
                <PiecInput
                  {...register("deliveryAddress.street")}
                  invalid={Boolean(errors.deliveryAddress?.street)}
                  placeholder="np. Kościuszki"
                  autoComplete="address-line1"
                />
              </PiecField>

              <div className="mt-3.5 grid grid-cols-[2fr_1fr] gap-3">
                <PiecField
                  label="Nr domu"
                  error={errors.deliveryAddress?.buildingNumber?.message}
                >
                  <PiecInput
                    {...register("deliveryAddress.buildingNumber")}
                    invalid={Boolean(errors.deliveryAddress?.buildingNumber)}
                    placeholder="np. 8"
                  />
                </PiecField>
                <PiecField label="M." optional>
                  <PiecInput {...register("deliveryAddress.apartmentNumber")} placeholder="—" />
                </PiecField>
              </div>

              {/* D-01: backend liczy strefę po (miasto, kod pocztowy), więc
                  te dwa pola muszą tu być — paczka szukała strefy po ulicy. */}
              <div className="mt-3.5 grid grid-cols-[2fr_1fr] gap-3">
                <PiecField label="Miasto" error={errors.deliveryAddress?.city?.message}>
                  <PiecInput
                    {...register("deliveryAddress.city")}
                    invalid={Boolean(errors.deliveryAddress?.city)}
                    list="delivery-cities"
                    placeholder="np. Pułtusk"
                    autoComplete="address-level2"
                  />
                  <datalist id="delivery-cities">
                    {(citiesData ?? []).map((city) => (
                      <option key={city.display} value={city.display} />
                    ))}
                  </datalist>
                </PiecField>
                <PiecField
                  label="Kod pocztowy"
                  error={errors.deliveryAddress?.postalCode?.message}
                >
                  <PiecInput
                    {...register("deliveryAddress.postalCode")}
                    invalid={Boolean(errors.deliveryAddress?.postalCode)}
                    placeholder="00-000"
                    inputMode="numeric"
                    onChange={(e) =>
                      setValue("deliveryAddress.postalCode", maskPostalCodeInput(e.target.value), {
                        shouldValidate: false,
                      })
                    }
                  />
                </PiecField>
              </div>

              {deliveryChecking ? (
                <p className="mt-3 text-sm text-piec-ink/50">Sprawdzamy adres…</p>
              ) : null}

              {zoneResolved ? (
                <p className="mt-3 flex items-center gap-2.5 rounded-xl border border-piec-ok/30 bg-piec-ok/[0.08] px-3.5 py-3 text-sm text-piec-okSoft">
                  <span aria-hidden="true" className="h-2 w-2 flex-none rounded-full bg-piec-ok" />
                  {deliveryCheck.fee > 0
                    ? `${deliveryCheck.zoneName} — dostawa ${formatPrice(deliveryCheck.fee, currency)}`
                    : `${deliveryCheck.zoneName} — dostawa gratis`}
                </p>
              ) : null}

              {deliveryUnavailable ? (
                <div className="mt-3 rounded-xl border border-piec-warn/40 bg-piec-warn/[0.08] px-3.5 py-3">
                  <p className="text-sm leading-[1.6] text-piec-warnSoft">
                    Niestety nie dowozimy pod ten adres.
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3.5">
                    <button
                      type="button"
                      onClick={() => setFulfillment("PICKUP")}
                      className="flex min-h-[44px] items-center text-sm font-bold text-primary"
                    >
                      Przełącz na odbiór osobisty
                    </button>
                    {settings?.phone ? (
                      <a
                        href={`tel:${settings.phone}`}
                        className="flex min-h-[44px] items-center text-sm font-semibold text-primary"
                      >
                        Zadzwoń: {formatPhoneDisplay(settings.phone)}
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          <PiecField
            label="Uwagi do zamówienia"
            optional
            className="mt-3.5"
            error={errors.customerNotes?.message}
          >
            <PiecTextarea
              {...register("customerNotes")}
              invalid={Boolean(errors.customerNotes)}
              placeholder="np. bez rukoli, domofon nie działa"
            />
          </PiecField>

          <div className="mt-3.5">
            <CashChangeChips
              value={cashChoice}
              onChange={setCashChoice}
              total={grandTotal}
              currency={currency}
              context={isDelivery ? "kurierowi" : "przy odbiorze"}
            />
          </div>

          {/* Rozbicie kwot */}
          <div className="mt-5 border-t border-piec-ink/[0.12] pt-3">
            <div className="flex justify-between py-0.5 text-[14.5px] text-piec-ink/70">
              <span>Pozycje ({itemsCount})</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>
            {isDelivery ? (
              <div
                className={cn(
                  "flex justify-between py-0.5 text-[14.5px]",
                  zoneResolved ? "text-piec-ink/70" : "text-piec-ink/45",
                )}
              >
                <span>Dostawa</span>
                <span>
                  {zoneResolved
                    ? deliveryFee > 0
                      ? formatPrice(deliveryFee, currency)
                      : "gratis"
                    : "podaj adres"}
                </span>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between pb-0.5 pt-2">
              <span className="text-base font-bold">Razem</span>
              <RollingNumber
                value={formatPrice(grandTotal, currency)}
                size={27}
                className="text-primary"
              />
            </div>
          </div>

          {belowMinimum ? (
            <p className="mt-2.5 rounded-xl border border-piec-warn/40 bg-piec-warn/[0.08] px-3.5 py-3 text-sm leading-[1.6] text-piec-warnSoft">
              Dostawy realizujemy od {formatPrice(minOrder, currency)}.{" "}
              <Link to="/menu" className="font-bold text-primary">
                Dodaj coś z menu
              </Link>{" "}
              albo wybierz odbiór osobisty.
            </p>
          ) : null}

          {!restaurantIsOpen ? (
            <p className="mt-2.5 rounded-xl border border-piec-warn/30 bg-piec-warnBg px-3.5 py-3 text-sm leading-[1.6] text-piec-warnSoft">
              {settings?.manualClosedReason ??
                "Lokal jest teraz zamknięty. Zamówienie złożysz w godzinach otwarcia."}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitDisabled}
            className={cn(
              "mt-3.5 flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-[14px] text-base font-bold transition-[transform,filter] duration-150",
              submitDisabled
                ? "cursor-default bg-primary/20 text-piec-ink/40"
                : "bg-primary text-onPrimary shadow-[0_10px_26px_rgb(var(--color-primary)/0.25)] hover:brightness-110 active:scale-[0.98]",
            )}
          >
            {mutation.isPending ? (
              "Składamy zamówienie…"
            ) : (
              <>
                ZAMAWIAM ·{" "}
                <RollingNumber value={formatPrice(grandTotal, currency)} size={18} plain />
              </>
            )}
          </button>

          {blockingHint ? (
            <p className="mt-2 text-center text-[13.5px] text-primary">{blockingHint}</p>
          ) : null}

          <p className="mt-3.5 text-center text-[12.5px] leading-[1.6] text-piec-ink/40">
            Zamawiasz bezpośrednio w {settings?.name ?? "restauracji"}. Bez konta i rejestracji —
            numer zamówienia dostaniesz na następnym ekranie.
          </p>
        </form>
      </PiecShell>
    </>
  );
}
