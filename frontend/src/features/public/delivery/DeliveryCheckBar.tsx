import { useEffect, useId, useState } from "react";
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
    // max-w: na desktopie pełna szerokość shella robiłaby z tego baner
    // konkurujący z siatką — a to ma być drobna, opcjonalna wstawka.
    <div className="mt-5 max-w-[560px] rounded-2xl border border-piec-ink/10 bg-piec-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-3 text-left text-[13.5px] font-semibold text-piec-ink/75"
      >
        <span>Sprawdź, czy dowozimy pod Twój adres</span>
        <span aria-hidden="true" className="text-primary">
          {open ? "×" : "→"}
        </span>
      </button>

      {open ? (
        <div id={panelId} className="border-t border-piec-ink/10 px-4 pb-4 pt-3.5">
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
