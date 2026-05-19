interface SaveBarProps {
  isDirty: boolean;
  onCancel?: () => void;
  onSave?: () => void;
  pending?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
}

// Bundle settings-shared.jsx L143-189 (S.SaveBar) — sticky bottom dirty-aware
// save bar. Shipped in M-034, consumed by M-035..M-039 once forms exist.
export function SaveBar({
  isDirty,
  onCancel,
  onSave,
  pending = false,
  saveLabel = "Zapisz zmiany",
  cancelLabel = "Anuluj",
}: SaveBarProps) {
  const enabled = isDirty && !pending;

  return (
    <div
      className="sticky bottom-0 z-10 flex items-center justify-between gap-3 px-8 py-3.5 backdrop-blur"
      style={{
        background: isDirty ? "rgb(var(--color-bg-card))" : "rgba(250,250,248,0.92)",
        borderTop: "1px solid rgb(var(--color-border-subtle))",
        boxShadow: isDirty ? "0 -8px 24px -16px rgba(15,18,25,0.18)" : "none",
        transition: "background 180ms",
      }}
    >
      <div
        className="text-[13px]"
        style={{
          color: isDirty
            ? "rgb(var(--color-text-body))"
            : "rgb(var(--color-text-faint))",
        }}
      >
        {isDirty ? (
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: "rgb(var(--status-new))" }}
            />
            Niezapisane zmiany
          </span>
        ) : (
          "Wszystko zapisane"
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={!enabled}
          className="h-9 rounded-md px-4 text-[13px] font-medium"
          style={{
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-card))",
            color: "rgb(var(--color-text-body))",
            cursor: enabled ? "pointer" : "not-allowed",
            opacity: enabled ? 1 : 0.5,
            fontFamily: "inherit",
          }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!enabled}
          className="h-9 rounded-md px-[18px] text-[13px] font-semibold"
          style={{
            border: "none",
            background: enabled ? "rgb(var(--color-primary))" : "#D4D0C2",
            color: "#fff",
            cursor: enabled ? "pointer" : "not-allowed",
            boxShadow: enabled ? "0 1px 0 rgba(0,0,0,0.04)" : "none",
            fontFamily: "inherit",
          }}
        >
          {pending ? "Zapisywanie…" : saveLabel}
        </button>
      </div>
    </div>
  );
}
