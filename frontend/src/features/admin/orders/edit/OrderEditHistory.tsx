import { useState } from "react";
import { Undo2 } from "lucide-react";
import type { AdminOrderEditDto } from "@/shared/api/orderApi";
import { formatDateTime } from "@/shared/lib/formatDate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";

interface OrderEditHistoryProps {
  edits: AdminOrderEditDto[];
  isUndoing: boolean;
  onUndo: () => void;
}

/**
 * Historia zmian treści zamówienia — pod pozycjami, bo tego dotyczy.
 * Wpisy cofnięte zostają widoczne (wyszarzone, ze stemplem kto cofnął):
 * ślad po operacji jest wart więcej niż czysta lista.
 */
export function OrderEditHistory({ edits, isUndoing, onUndo }: OrderEditHistoryProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const undoable = edits.find((edit) => edit.canUndo);

  if (edits.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
        borderRadius: 10,
      }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-2"
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgb(var(--color-border-subtle))",
        }}
      >
        <h3 className="m-0 text-[15px] font-bold">Historia zmian ({edits.length})</h3>
        {undoable && (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            disabled={isUndoing}
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold"
            style={{
              border: "1px solid rgb(var(--color-border-card))",
              background: "rgb(var(--color-bg-card))",
              color: "rgb(var(--color-text-body))",
              cursor: isUndoing ? "not-allowed" : "pointer",
            }}
          >
            <Undo2 size={14} strokeWidth={1.8} aria-hidden />
            {isUndoing ? "Cofanie…" : "Cofnij ostatnią zmianę"}
          </button>
        )}
      </div>

      {edits.map((edit, index) => (
        <div
          key={edit.id}
          style={{
            padding: "14px 20px",
            borderBottom:
              index === edits.length - 1 ? "none" : "1px solid rgb(var(--color-border-subtle))",
            opacity: edit.undoneAt ? 0.55 : 1,
          }}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-[12px] text-[rgb(var(--color-text-muted))]">
              <span style={{ fontFamily: "var(--font-mono)" }}>
                {formatDateTime(edit.editedAt)}
              </span>
              {edit.editedBy ? ` · ${edit.editedBy}` : ""}
            </span>
            <span
              className="text-[12px] font-semibold"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {zl(edit.totalBefore)} → {zl(edit.totalAfter)}
            </span>
          </div>

          <ul className="mt-2 flex flex-col gap-1 pl-4">
            {edit.summaryLines.map((line, i) => (
              <li
                key={i}
                className="text-[13px] text-[rgb(var(--color-text-body))]"
                style={{ listStyle: "disc", lineHeight: 1.45 }}
              >
                {line}
              </li>
            ))}
          </ul>

          {edit.undoneAt && (
            <p
              className="mt-2 text-[12px] italic"
              style={{ color: "rgb(var(--color-text-muted))" }}
            >
              Cofnięte {formatDateTime(edit.undoneAt)}
              {edit.undoneBy ? ` przez ${edit.undoneBy}` : ""}
            </p>
          )}
        </div>
      ))}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-[480px]">
          <DialogTitle className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
            Cofnąć ostatnią zmianę?
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-[rgb(var(--color-text-body))]">
            Zamówienie wróci do stanu sprzed tej edycji — pozycje, sumy i reszta
            z gotówki. Klient zobaczy to na stronie śledzenia. Wpis zostanie
            w historii ze stemplem cofnięcia.
          </DialogDescription>
          <DialogFooter className="mt-5">
            <Button type="button" variant="ghost" onClick={() => setConfirmOpen(false)}>
              Zostaw jak jest
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isUndoing}
              onClick={() => {
                setConfirmOpen(false);
                onUndo();
              }}
            >
              {isUndoing ? "Cofanie…" : "Cofnij zmianę"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function zl(raw: string): string {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return raw;
  return `${n.toFixed(2).replace(".", ",")} zł`;
}
