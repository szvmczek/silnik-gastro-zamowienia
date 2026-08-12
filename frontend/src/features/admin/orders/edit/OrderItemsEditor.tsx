import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Plus } from "lucide-react";
import { fetchPublicMenu, type PublicMenuDto } from "@/shared/api/menuApi";
import type { AdminOrderDto, EditOrderPayload } from "@/shared/api/orderApi";
import { AddItemDialog } from "./AddItemDialog";
import { CashChangeEditor } from "./CashChangeEditor";
import { EditableItemRow } from "./EditableItemRow";
import { itemConfigError } from "./ItemControls";
import { buildPayload, indexMenu, toDrafts, type DraftItem } from "./draft";
import { useOrderEditPreview } from "./useOrderEditPreview";

const ORDER_NOTE_MAX = 500;

interface OrderItemsEditorProps {
  order: AdminOrderDto;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (payload: EditOrderPayload) => void;
}

function zl(raw: string | number): string {
  const n = typeof raw === "number" ? raw : Number.parseFloat(raw);
  if (!Number.isFinite(n)) return String(raw);
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

function toNumber(raw: string | null): number | null {
  if (raw === null) return null;
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Tryb edycji pozycji. Wszystkie kwoty pochodzą z podglądu liczonego
 * serwerowo — front nie dodaje ani nie mnoży niczego samodzielnie
 * (CLAUDE.md §5), więc suma widziana w trakcie rozmowy z klientem jest tą
 * samą, która zapisze się w bazie.
 */
export function OrderItemsEditor({ order, isSaving, onCancel, onSave }: OrderItemsEditorProps) {
  const [drafts, setDrafts] = useState<DraftItem[]>(() => toDrafts(order));
  const [customerNotes, setCustomerNotes] = useState(order.customerNotes ?? "");
  const [cashChangeFrom, setCashChangeFrom] = useState<number | null>(
    toNumber(order.cashChangeFrom),
  );
  const [addOpen, setAddOpen] = useState(false);

  const menu = useQuery<PublicMenuDto>({
    queryKey: ["public", "menu"],
    queryFn: fetchPublicMenu,
    staleTime: 5 * 60_000,
  });
  const productsById = useMemo(() => indexMenu(menu.data), [menu.data]);

  const payload = useMemo(
    () => buildPayload(order.version, drafts, customerNotes, cashChangeFrom),
    [order.version, drafts, customerNotes, cashChangeFrom],
  );
  const preview = useOrderEditPreview(order.id, payload);

  const configError = drafts
    .map((draft) => itemConfigError(productsById.get(draft.productId), draft.variantId, draft.addonIds))
    .find((error) => error !== null);

  const previewTotal = preview.data ? Number.parseFloat(preview.data.total) : null;
  const cashSufficient = preview.data?.cashChangeSufficient ?? true;
  const savedTotal = Number.parseFloat(order.total);
  const delta = previewTotal !== null ? Math.round((previewTotal - savedTotal) * 100) / 100 : 0;

  const blockingHint = drafts.length === 0
    ? "Zamówienie musi mieć co najmniej jedną pozycję. Aby wycofać całość, użyj „Anuluj zamówienie”."
    : configError
      ? configError
      : !cashSufficient
        ? "Ustal resztę z gotówki na nowo — suma wzrosła ponad zadeklarowaną kwotę."
        : preview.isError
          ? "Nie udało się przeliczyć zamówienia. Popraw pozycje albo odśwież widok."
          : null;

  const canSave = blockingHint === null && !isSaving && preview.data !== undefined;

  const updateDraft = (index: number, next: DraftItem) => {
    setDrafts((prev) => prev.map((draft, i) => (i === index ? next : draft)));
  };

  return (
    <div
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-primary))",
        borderRadius: 10,
      }}
    >
      <div
        className="flex items-baseline justify-between"
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid rgb(var(--color-border-subtle))",
        }}
      >
        <h3 className="m-0 text-[15px] font-bold">Edycja pozycji</h3>
        <span className="text-[12px] text-[rgb(var(--color-text-muted))]">
          {drafts.length} {drafts.length === 1 ? "pozycja" : "pozycji"}
        </span>
      </div>

      {order.status === "IN_PREPARATION" && (
        <div
          style={{
            margin: "14px 20px 0",
            padding: "10px 12px",
            background: "#FFF8E1",
            border: "1px solid #FCD34D",
            borderLeft: "4px solid rgb(var(--status-new))",
            borderRadius: 8,
            color: "#78350F",
            display: "flex",
            gap: 10,
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          <AlertTriangle size={16} strokeWidth={1.8} aria-hidden style={{ flexShrink: 0, marginTop: 1 }} />
          <span>
            Kuchnia mogła już zacząć przygotowanie — upewnij się, że zmiana jest możliwa.
          </span>
        </div>
      )}

      {preview.data?.warnings.map((warning) => (
        <div
          key={warning}
          style={{
            margin: "10px 20px 0",
            padding: "8px 12px",
            background: "#FFF8E1",
            border: "1px solid #FCD34D",
            borderRadius: 8,
            color: "#78350F",
            fontSize: 12,
          }}
        >
          {warning}
        </div>
      ))}

      <div className="mt-3">
        {drafts.map((draft, index) => (
          <EditableItemRow
            key={draft.key}
            draft={draft}
            product={productsById.get(draft.productId)}
            lineTotal={preview.data?.items[index]?.lineTotal ?? null}
            repriced={preview.data?.items[index]?.repriced ?? false}
            isLast={index === drafts.length - 1}
            onChange={(next) => updateDraft(index, next)}
            onRemove={() => setDrafts((prev) => prev.filter((_, i) => i !== index))}
          />
        ))}
        {drafts.length === 0 && (
          <p className="px-5 py-4 text-[13px] text-[rgb(var(--color-text-muted))]">
            Wszystkie pozycje usunięte — dodaj przynajmniej jedną albo anuluj edycję.
          </p>
        )}
      </div>

      <div style={{ padding: "12px 20px", borderTop: "1px solid rgb(var(--color-border-subtle))" }}>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-semibold"
          style={{
            border: "1px dashed rgb(var(--color-primary))",
            background: "rgb(var(--color-bg-card))",
            color: "rgb(var(--color-primary))",
            cursor: "pointer",
          }}
        >
          <Plus size={14} strokeWidth={2} aria-hidden /> Dodaj pozycję
        </button>
      </div>

      <div
        style={{
          padding: "14px 20px",
          borderTop: "1px solid rgb(var(--color-border-subtle))",
          background: "rgb(var(--color-bg-section))",
        }}
      >
        <label
          htmlFor="edit-customer-notes"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.06em] text-[rgb(var(--color-text-muted))]"
        >
          Notatka do całego zamówienia
        </label>
        <textarea
          id="edit-customer-notes"
          rows={2}
          value={customerNotes}
          maxLength={ORDER_NOTE_MAX}
          onChange={(e) => setCustomerNotes(e.target.value)}
          placeholder="np. dzwonić przed przyjazdem"
          className="w-full rounded-md px-3 py-2 text-[13px]"
          style={{
            border: "1px solid rgb(var(--color-border-card))",
            background: "rgb(var(--color-bg-card))",
            color: "rgb(var(--color-text-primary))",
          }}
        />

        <div className="mt-3">
          <CashChangeEditor
            total={previewTotal ?? savedTotal}
            value={cashChangeFrom}
            sufficient={cashSufficient}
            onChange={setCashChangeFrom}
          />
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <SummaryRow label="Suma pozycji" value={preview.data ? zl(preview.data.subtotal) : "…"} />
          {order.fulfillmentType === "DELIVERY" && (
            <SummaryRow
              label={order.deliveryZoneName ? `Dostawa — ${order.deliveryZoneName}` : "Dostawa"}
              value={preview.data ? zl(preview.data.deliveryFee) : "…"}
            />
          )}
          <div className="flex items-baseline justify-between pt-1">
            <span className="text-[15px] font-bold">Razem po zmianie</span>
            <span className="text-right">
              <span className="text-[18px] font-bold" style={{ fontFamily: "var(--font-mono)" }}>
                {previewTotal !== null ? zl(previewTotal) : "…"}
              </span>
              {delta !== 0 && (
                <span
                  className="ml-2 text-[13px] font-semibold"
                  style={{
                    color:
                      delta > 0
                        ? "rgb(var(--status-cancelled))"
                        : "rgb(var(--status-ready))",
                  }}
                >
                  {delta > 0 ? "+" : "−"}
                  {zl(Math.abs(delta))}
                </span>
              )}
            </span>
          </div>
          <div className="text-[11px] text-[rgb(var(--color-text-faint))]">
            Przed zmianą: {zl(order.total)}
          </div>
        </div>

        {blockingHint && (
          <p className="mt-3 text-[13px] font-medium" style={{ color: "rgb(var(--status-cancelled))" }}>
            {blockingHint}
          </p>
        )}

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="rounded-md px-4 py-2 text-[13px] font-medium"
            style={{
              border: "1px solid rgb(var(--color-border-card))",
              background: "rgb(var(--color-bg-card))",
              color: "rgb(var(--color-text-body))",
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            Odrzuć zmiany
          </button>
          <button
            type="button"
            onClick={() => onSave(payload)}
            disabled={!canSave}
            className="rounded-md px-4 py-2 text-[13px] font-bold"
            style={{
              border: "none",
              background: "rgb(var(--color-primary))",
              color: "#fff",
              cursor: canSave ? "pointer" : "not-allowed",
              opacity: canSave ? 1 : 0.5,
            }}
          >
            {isSaving ? "Zapisywanie…" : "Zapisz zmiany"}
          </button>
        </div>
      </div>

      <AddItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onAdd={(draft) => setDrafts((prev) => [...prev, draft])}
      />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[13px] text-[rgb(var(--color-text-body))]">
      <span>{label}</span>
      <span style={{ fontFamily: "var(--font-mono)" }}>{value}</span>
    </div>
  );
}
