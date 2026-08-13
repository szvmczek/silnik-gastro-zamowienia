import { useEffect, useId, useState } from "react";
import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { maskPostalCodeInput } from "@/features/admin/delivery-zones/lib/postalCode";
import { DeliveryAddressFields } from "./DeliveryAddressFields";
import { DeliveryCheckResult } from "./DeliveryCheckResult";
import { useDeliveryCheck } from "./useDeliveryCheck";
import { readCheckedAddress, saveCheckedAddress } from "./checkedAddress";

/**
 * Opcjonalne „czy dowozimy pod mój adres" na menu — domyślnie zwinięte do
 * jednej linii, żeby nie konkurowało z siatką produktów. Niczego nie
 * blokuje: to informacja przed zbudowaniem koszyka, żeby zła wiadomość
 * nie przychodziła dopiero na checkoucie.
 *
 * Sprawdzony adres ląduje w sessionStorage i wypełnia pola na checkoucie
 * (patrz `checkedAddress`).
 */
export function DeliveryCheckBar() {
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";
  const panelId = useId();

  const [open, setOpen] = useState(false);
  const [city, setCity] = useState(() => readCheckedAddress()?.city ?? "");
  const [postalCode, setPostalCode] = useState(() => readCheckedAddress()?.postalCode ?? "");

  const { data: result, isFetching } = useDeliveryCheck(city, postalCode, open);

  useEffect(() => {
    if (result) saveCheckedAddress({ city: city.trim(), postalCode: postalCode.trim() });
  }, [result, city, postalCode]);

  const pickupAddress = [settings?.addressLine, settings?.city].filter(Boolean).join(", ");

  return (
    <div className="mt-5">
      {/* Pigułka, nie pasek: szerokość z treści, kolor akcentu i kształt
          z pigułki koszyka w nagłówku — ma czytać się jako coś do
          kliknięcia, nie jako kolejne pole formularza. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          // px/gap wyliczone tak, żeby całość zmieściła się w jednej linii
          // w szerokości shella na 375 px — bez tego etykieta łamie się na dwie.
          "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold text-primary",
          "transition-[background-color,border-color] duration-150 hover:bg-primary/15",
          open ? "border-primary/55 bg-primary/15" : "border-primary/35 bg-primary/[0.08]",
        )}
      >
        <MapPin aria-hidden="true" className="h-[15px] w-[15px] flex-none" />
        <span>Sprawdź, czy dowozimy pod Twój adres</span>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "h-[15px] w-[15px] flex-none transition-transform duration-150",
            open ? "rotate-180" : "",
          )}
        />
      </button>

      {open ? (
        <div
          id={panelId}
          className="mt-3 max-w-[520px] rounded-2xl border border-primary/20 bg-piec-surface p-3.5"
        >
          <DeliveryAddressFields
            listId="menu-delivery-cities"
            cityProps={{
              value: city,
              onChange: (e) => setCity(e.target.value),
            }}
            postalProps={{
              value: postalCode,
              onChange: (e) => setPostalCode(maskPostalCodeInput(e.target.value)),
            }}
          />

          <DeliveryCheckResult
            result={result}
            isFetching={isFetching}
            currency={currency}
            freeDeliveryFrom={settings?.freeDeliveryFrom}
            className="mt-3"
            unavailableNote={
              <>
                Odbiór osobisty jest nadal możliwy — zamówienie złożysz normalnie
                {pickupAddress ? ` i odbierzesz przy ${pickupAddress}` : ""}.
              </>
            }
          />

          <p className="mt-3 text-[12.5px] leading-[1.6] text-piec-ink/45">
            Sprawdzenie dotyczy tylko dostawy i nie jest wymagane do zamówienia.
          </p>
        </div>
      ) : null}
    </div>
  );
}
