import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { cn } from "@/shared/lib/cn";

/** Nominały, z których realnie wydaje się resztę przy zamówieniu na wynos. */
const DENOMINATIONS = [50, 100, 200, 500];

/**
 * Wybór klienta. `null` = jeszcze nic nie wybrał — checkout blokuje wtedy
 * CTA, bo brak decyzji zostawiłby kuriera bez wiedzy, ile brać na resztę.
 * `"EXACT"` = odliczona kwota; liczbę przeliczamy na kwotę przy wysyłce.
 */
export type CashChoice = "EXACT" | number | null;

interface Props {
  value: CashChoice;
  onChange: (value: CashChoice) => void;
  /** Kwota zamówienia — niższy nominał odpadłby na walidacji 422 z backendu. */
  total: number;
  currency: string | undefined;
  /** DOSTAWA → „kurierowi", ODBIÓR → „przy odbiorze". */
  context: string;
}

/**
 * D-03 — rozliczenie gotówki. Wybór jest wymagany: żadna opcja nie jest
 * zaznaczona domyślnie, a dopóki klient nie wybierze, checkout trzyma
 * CTA zablokowane (tak samo jak przy brakujących wymaganych dodatkach).
 *
 * Poza nominałami jest pole na własną kwotę — klient z 140 zł przy
 * zamówieniu za 130 zł nie trafia w żaden gotowy nominał.
 */
export function CashChangeChips({ value, onChange, total, currency, context }: Props) {
  const options = DENOMINATIONS.filter((d) => d >= total).slice(0, 3);
  const [customOpen, setCustomOpen] = useState(false);
  const [customRaw, setCustomRaw] = useState("");
  const customRef = useRef<HTMLInputElement>(null);

  const customActive = typeof value === "number" && !options.includes(value);

  useEffect(() => {
    if (customOpen) customRef.current?.focus();
  }, [customOpen]);

  const pick = (next: CashChoice) => {
    setCustomOpen(false);
    setCustomRaw("");
    onChange(next);
  };

  const onCustomChange = (raw: string) => {
    // Przecinek jako separator dziesiętny — tak się pisze kwoty po polsku.
    const cleaned = raw.replace(/[^\d.,]/g, "").replace(",", ".");
    setCustomRaw(cleaned);
    const parsed = Number.parseFloat(cleaned);
    onChange(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
  };

  const customTooLow =
    customRaw.trim() !== "" && typeof value === "number" && value < total;
  const customUnparsed = customRaw.trim() !== "" && value === null;

  return (
    <div>
      <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[1.8px] text-piec-ink/55">
        Płatność — gotówka {context}
      </span>
      <div
        role="radiogroup"
        aria-label="Jak rozliczysz gotówkę"
        aria-required="true"
        className="flex flex-wrap gap-2.5"
      >
        <Chip active={value === "EXACT"} onClick={() => pick("EXACT")}>
          Odliczoną kwotą
        </Chip>
        {options.map((amount) => (
          <Chip key={amount} active={value === amount} onClick={() => pick(amount)}>
            Z {formatPrice(amount, currency)}
          </Chip>
        ))}
        <Chip
          active={customActive || customOpen}
          onClick={() => {
            setCustomOpen(true);
            onChange(null);
          }}
        >
          Inna kwota
        </Chip>
      </div>

      {customOpen || customActive ? (
        <div className="mt-2.5">
          <label
            htmlFor="cash-change-custom"
            className="mb-1 block text-[12.5px] text-piec-ink/60"
          >
            Z jakiej kwoty wydać resztę?
          </label>
          <input
            id="cash-change-custom"
            ref={customRef}
            type="text"
            inputMode="decimal"
            value={customRaw}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="np. 140"
            aria-invalid={customTooLow || customUnparsed}
            className={cn(
              "h-[46px] w-full max-w-[200px] rounded-xl border-[1.5px] bg-transparent px-3.5 text-[15px] font-semibold text-piec-ink outline-none transition-colors",
              customTooLow || customUnparsed
                ? "border-piec-warn"
                : "border-piec-ink/20 focus:border-primary",
            )}
          />
          {customTooLow ? (
            <p className="mt-1 text-[12.5px] text-piec-warnSoft">
              To mniej niż kwota zamówienia ({formatPrice(total, currency)}).
            </p>
          ) : null}
        </div>
      ) : null}

      <p className="mt-2 text-[12.5px] text-piec-ink/45">
        Płatności online na razie nie ma — tylko gotówka.
      </p>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "flex min-h-[44px] items-center rounded-full border-[1.5px] px-4 text-[13.5px] font-semibold transition-colors",
        active
          ? "border-primary bg-primary/[0.12] text-piec-ink"
          : "border-piec-ink/20 text-piec-ink/80 hover:border-primary/60",
      )}
    >
      {children}
    </button>
  );
}
