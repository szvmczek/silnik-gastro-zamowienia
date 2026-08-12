import { Trash2 } from "lucide-react";
import type { PublicProductDto } from "@/shared/api/menuApi";
import { ItemControls, itemConfigError } from "./ItemControls";
import { draftLabel, type DraftItem } from "./draft";

const NOTE_MAX = 200;

interface EditableItemRowProps {
  draft: DraftItem;
  product: PublicProductDto | undefined;
  lineTotal: string | null;
  repriced: boolean;
  isLast: boolean;
  onChange: (next: DraftItem) => void;
  onRemove: () => void;
}

function zl(raw: string | number): string {
  const n = typeof raw === "number" ? raw : Number.parseFloat(raw);
  if (!Number.isFinite(n)) return String(raw);
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

export function EditableItemRow({
  draft,
  product,
  lineTotal,
  repriced,
  isLast,
  onChange,
  onRemove,
}: EditableItemRowProps) {
  const error = itemConfigError(product, draft.variantId, draft.addonIds);

  return (
    <div
      style={{
        padding: "14px 20px",
        borderBottom: isLast ? "none" : "1px solid rgb(var(--color-border-subtle))",
        background: "rgb(var(--color-bg-card))",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-[rgb(var(--color-text-primary))]">
            {draftLabel(draft, product)}
          </div>
          {!product && (
            // Produkt zniknął z menu — nie da się zmienić rozmiaru ani
            // dodatków, bo nie wiemy, co jest dziś dostępne. Ilość, notatka
            // i usunięcie zostają.
            <div className="mt-0.5 text-[12px] text-[rgb(var(--color-text-muted))]">
              Produkt nie występuje już w menu — można zmienić tylko ilość i notatkę.
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div
            className="flex items-center"
            style={{
              border: "1px solid rgb(var(--color-border-card))",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <StepperButton
              label="−"
              ariaLabel="Zmniejsz ilość"
              disabled={draft.quantity <= 1}
              onClick={() => onChange({ ...draft, quantity: draft.quantity - 1 })}
            />
            <span
              className="min-w-[36px] text-center text-[14px] font-bold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {draft.quantity}
            </span>
            <StepperButton
              label="+"
              ariaLabel="Zwiększ ilość"
              disabled={draft.quantity >= 99}
              onClick={() => onChange({ ...draft, quantity: draft.quantity + 1 })}
            />
          </div>
          <span
            className="min-w-[76px] text-right text-[14px] font-semibold"
            style={{ fontFamily: "var(--font-mono)" }}
            title={repriced ? "Pozycja przeliczona po aktualnej cenie z menu" : "Cena z chwili złożenia zamówienia"}
          >
            {lineTotal ? zl(lineTotal) : "…"}
          </span>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Usuń pozycję"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md"
            style={{
              border: "1px solid rgb(var(--color-border-card))",
              background: "rgb(var(--color-bg-card))",
              color: "rgb(var(--status-cancelled))",
              cursor: "pointer",
            }}
          >
            <Trash2 size={14} strokeWidth={1.8} aria-hidden />
          </button>
        </div>
      </div>

      {repriced && (
        <div className="mt-1 text-[11px] text-[rgb(var(--color-text-muted))]">
          Przeliczone po aktualnej cenie z menu
        </div>
      )}

      {product && (
        <div className="mt-3">
          <ItemControls
            product={product}
            variantId={draft.variantId}
            addonIds={draft.addonIds}
            onVariantChange={(variantId) => onChange({ ...draft, variantId })}
            onAddonsChange={(addonIds) => onChange({ ...draft, addonIds })}
          />
        </div>
      )}

      <div className="mt-3">
        <input
          type="text"
          value={draft.itemNote}
          maxLength={NOTE_MAX}
          onChange={(e) => onChange({ ...draft, itemNote: e.target.value })}
          placeholder="Notatka do tej pozycji, np. bez cebuli"
          className="w-full rounded-md px-3 py-1.5 text-[13px]"
          style={{
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-section))",
            color: "rgb(var(--color-text-primary))",
          }}
        />
        <div className="mt-1 flex justify-between text-[11px] text-[rgb(var(--color-text-faint))]">
          <span>Notatka nie wpływa na cenę.</span>
          <span>
            {draft.itemNote.length} / {NOTE_MAX}
          </span>
        </div>
      </div>

      {error && (
        <div className="mt-2 text-[12px]" style={{ color: "rgb(var(--status-cancelled))" }}>
          {error}
        </div>
      )}
    </div>
  );
}

function StepperButton({
  label,
  ariaLabel,
  disabled,
  onClick,
}: {
  label: string;
  ariaLabel: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="h-8 w-8 text-[16px] font-semibold"
      style={{
        background: "rgb(var(--color-bg-section))",
        color: "rgb(var(--color-text-body))",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {label}
    </button>
  );
}
