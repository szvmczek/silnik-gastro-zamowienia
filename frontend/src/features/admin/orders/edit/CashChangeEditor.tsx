import { useState } from "react";

const NOTES = [20, 50, 100, 200, 500];

interface CashChangeEditorProps {
  total: number;
  value: number | null;
  sufficient: boolean;
  onChange: (value: number | null) => void;
}

function zl(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

/**
 * Reszta z gotówki przy edycji (D-03 / AD-026). Semantyka pola jest ta sama
 * co po P10: kwota równa sumie = gotówka odliczona, kwota wyższa = wydajemy
 * resztę, `null` = nie wiemy i trzeba zadzwonić.
 *
 * Gdy suma urośnie ponad zadeklarowany nominał, wybór trzeba podjąć od nowa —
 * inaczej kurier pojechałby z kwotą, która już nie pokrywa zamówienia.
 */
export function CashChangeEditor({ total, value, sufficient, onChange }: CashChangeEditorProps) {
  const [custom, setCustom] = useState("");
  const isExact = value !== null && Math.abs(value - total) < 0.005;
  const isUnknown = value === null;
  const notes = NOTES.filter((n) => n > total);

  return (
    <div
      className="rounded-lg p-3"
      style={{
        border: sufficient
          ? "1px solid rgb(var(--color-border-card))"
          : "1px solid rgb(var(--status-cancelled))",
        background: sufficient ? "rgb(var(--color-bg-section))" : "rgb(var(--status-cancelled-tint))",
      }}
    >
      <div className="mb-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[rgb(var(--color-text-muted))]">
        Reszta z gotówki
      </div>
      {!sufficient && (
        <p className="mb-2 text-[13px] font-semibold" style={{ color: "rgb(var(--status-cancelled))" }}>
          Zamówienie kosztuje teraz {zl(total)} — więcej niż zadeklarowana kwota.
          Ustal z klientem na nowo, zanim zapiszesz.
        </p>
      )}
      <div className="flex flex-wrap gap-1.5">
        <Chip active={isExact} onClick={() => onChange(total)}>
          Odliczona ({zl(total)})
        </Chip>
        {notes.map((note) => (
          <Chip key={note} active={value === note} onClick={() => onChange(note)}>
            z {note} zł
          </Chip>
        ))}
        <Chip active={isUnknown} onClick={() => onChange(null)}>
          Brak danych
        </Chip>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          min={total}
          step="0.01"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Inna kwota"
          className="w-32 rounded-md px-2.5 py-1 text-[13px]"
          style={{
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-card))",
            color: "rgb(var(--color-text-primary))",
            fontFamily: "var(--font-mono)",
          }}
        />
        <button
          type="button"
          onClick={() => {
            const parsed = Number.parseFloat(custom.replace(",", "."));
            if (Number.isFinite(parsed) && parsed >= total) {
              onChange(Math.round(parsed * 100) / 100);
              setCustom("");
            }
          }}
          className="rounded-md px-2.5 py-1 text-[13px] font-medium"
          style={{
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-card))",
            color: "rgb(var(--color-text-body))",
            cursor: "pointer",
          }}
        >
          Ustaw
        </button>
        <span className="text-[11px] text-[rgb(var(--color-text-faint))]">
          Kwota nie może być niższa niż suma zamówienia.
        </span>
      </div>
      {value !== null && !isExact && sufficient && (
        <p className="mt-2 text-[13px] font-semibold text-[rgb(var(--color-text-primary))]">
          Wydaj resztę: {zl(Math.round((value - total) * 100) / 100)}
        </p>
      )}
      {isUnknown && (
        <p className="mt-2 text-[13px]" style={{ color: "rgb(var(--status-cancelled))" }}>
          Kurier zobaczy „brak danych o reszcie — zadzwoń do klienta".
        </p>
      )}
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
      onClick={onClick}
      className="rounded-full px-3 py-1 text-[13px]"
      style={{
        border: active
          ? "1px solid rgb(var(--color-primary))"
          : "1px solid rgb(var(--color-border-card))",
        background: active ? "rgb(var(--color-primary) / 0.08)" : "rgb(var(--color-bg-card))",
        color: active ? "rgb(var(--color-primary))" : "rgb(var(--color-text-body))",
        fontWeight: active ? 600 : 400,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
