import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";
import { PiecField, PiecInput } from "@/features/public/checkout/components/PiecField";
import { useDeliveryCities } from "./useDeliveryCities";

/**
 * Para pól, po której backend liczy strefę (AD-019): MIASTO + KOD POCZTOWY.
 * Jedno źródło markupu dla checkoutu (pola z react-hook-form) i paska na
 * menu (pola sterowane lokalnym stanem) — stąd props zamiast value/onChange:
 * checkout wstrzykuje tu `register(...)` razem z refem.
 */
export function DeliveryAddressFields({
  cityProps,
  postalProps,
  cityError,
  postalError,
  listId,
  enableCitySuggestions = true,
  className,
}: {
  cityProps: InputHTMLAttributes<HTMLInputElement> & { ref?: unknown };
  postalProps: InputHTMLAttributes<HTMLInputElement> & { ref?: unknown };
  cityError?: string;
  postalError?: string;
  /** Unikalne id datalisty — dwa ekrany nie mogą dzielić jednego. */
  listId: string;
  /** Pozwala nie strzelać po miasta, zanim pola są widoczne. */
  enableCitySuggestions?: boolean;
  className?: string;
}) {
  const { data: cities } = useDeliveryCities(enableCitySuggestions);

  return (
    <div className={cn("grid grid-cols-[2fr_1fr] gap-3", className)}>
      <PiecField label="Miasto" error={cityError}>
        <PiecInput
          invalid={Boolean(cityError)}
          list={listId}
          placeholder="np. Pułtusk"
          autoComplete="address-level2"
          {...cityProps}
        />
        <datalist id={listId}>
          {(cities ?? []).map((city) => (
            <option key={city.display} value={city.display} />
          ))}
        </datalist>
      </PiecField>
      <PiecField label="Kod pocztowy" error={postalError}>
        <PiecInput
          invalid={Boolean(postalError)}
          placeholder="00-000"
          inputMode="numeric"
          autoComplete="postal-code"
          {...postalProps}
        />
      </PiecField>
    </div>
  );
}
