import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { cn } from "@/shared/lib/cn";

/** Nominały, z których realnie wydaje się resztę przy zamówieniu na wynos. */
const DENOMINATIONS = [50, 100, 200, 500];

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  /** Kwota zamówienia — nominał niższy odpadłby na walidacji 422 z backendu. */
  total: number;
  currency: string | undefined;
  /** DOSTAWA → „kurierowi", ODBIÓR → „przy odbiorze". */
  context: string;
}

/**
 * D-03 — reszta przy płatności gotówką. null = odliczona kwota.
 *
 * Paczka pokazuje sztywne „Ze 100 zł / Z 200 zł"; my liczymy listę
 * z kwoty zamówienia, żeby nie proponować nominału, który backend
 * i tak odrzuci (CheckoutService wymaga cashChangeFrom >= total).
 */
export function CashChangeChips({ value, onChange, total, currency, context }: Props) {
  const options = DENOMINATIONS.filter((d) => d >= total).slice(0, 3);

  return (
    <div>
      <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[1.8px] text-piec-ink/55">
        Płatność — gotówka {context}
      </span>
      <div
        role="radiogroup"
        aria-label="Z jakiej kwoty wydać resztę"
        className="flex flex-wrap gap-2.5"
      >
        <Chip active={value === null} onClick={() => onChange(null)}>
          Odliczoną kwotą
        </Chip>
        {options.map((amount) => (
          <Chip key={amount} active={value === amount} onClick={() => onChange(amount)}>
            Z {formatPrice(amount, currency)}
          </Chip>
        ))}
      </div>
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
