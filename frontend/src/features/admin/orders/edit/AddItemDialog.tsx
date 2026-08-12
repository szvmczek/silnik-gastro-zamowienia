import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { fetchPublicMenu, type PublicMenuDto, type PublicProductDto } from "@/shared/api/menuApi";
import { ItemControls, itemConfigError } from "./ItemControls";
import { nextDraftKey, type DraftItem } from "./draft";

const NOTE_MAX = 200;

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (draft: DraftItem) => void;
}

/**
 * Katalog do dobrania pozycji bierzemy z publicznego `GET /public/menu` —
 * ma dokładnie potrzebny kształt (kategorie → produkty → warianty → grupy
 * dodatków), jest już cache'owany pod kluczem ["public","menu"] i nie
 * wymaga nowego endpointu admina.
 */
export function AddItemDialog({ open, onOpenChange, onAdd }: AddItemDialogProps) {
  const menu = useQuery<PublicMenuDto>({
    queryKey: ["public", "menu"],
    queryFn: fetchPublicMenu,
    enabled: open,
    staleTime: 5 * 60_000,
  });

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<PublicProductDto | null>(null);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [addonIds, setAddonIds] = useState<number[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [itemNote, setItemNote] = useState("");

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelected(null);
    setVariantId(null);
    setAddonIds([]);
    setQuantity(1);
    setItemNote("");
  }, [open]);

  const categories = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (menu.data?.categories ?? [])
      .map((category) => ({
        ...category,
        products: category.products.filter((p) =>
          query.length === 0 ? true : p.name.toLowerCase().includes(query),
        ),
      }))
      .filter((category) => category.products.length > 0);
  }, [menu.data, search]);

  const pick = (product: PublicProductDto) => {
    setSelected(product);
    // Jeden wariant = brak wyboru do zrobienia; przy wielu admin wybiera sam.
    setVariantId(product.variants.length === 1 ? product.variants[0].id : null);
    setAddonIds([]);
  };

  const error = selected ? itemConfigError(selected, variantId, addonIds) : null;
  const canAdd = selected !== null && error === null;

  const handleAdd = () => {
    if (!selected || !canAdd) return;
    onAdd({
      key: nextDraftKey(),
      orderItemId: null,
      productId: selected.id,
      variantId,
      addonIds,
      quantity,
      itemNote,
      fallbackName: selected.name,
      fallbackVariantName:
        selected.variants.find((v) => v.id === variantId)?.name ?? null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[720px]">
        <DialogTitle className="text-lg font-semibold text-[rgb(var(--color-text-primary))]">
          Dodaj pozycję do zamówienia
        </DialogTitle>
        <DialogDescription className="mt-1 text-sm text-[rgb(var(--color-text-body))]">
          Cena zostanie policzona po aktualnym cenniku — zobaczysz ją w podsumowaniu
          przed zapisaniem.
        </DialogDescription>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
          <div className="flex min-h-[240px] flex-col">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Szukaj w menu…"
              className="mb-2 w-full rounded-md px-3 py-2 text-sm"
              style={{
                border: "1px solid rgb(var(--color-border-card))",
                background: "rgb(var(--color-bg-card))",
                color: "rgb(var(--color-text-primary))",
              }}
            />
            <div
              className="flex-1 overflow-y-auto rounded-md"
              style={{
                maxHeight: 320,
                border: "1px solid rgb(var(--color-border-card))",
                background: "rgb(var(--color-bg-section))",
              }}
            >
              {menu.isPending && (
                <p className="p-3 text-[13px] text-[rgb(var(--color-text-muted))]">
                  Wczytywanie menu…
                </p>
              )}
              {menu.isError && (
                <p className="p-3 text-[13px]" style={{ color: "rgb(var(--status-cancelled))" }}>
                  Nie udało się wczytać menu.
                </p>
              )}
              {!menu.isPending && categories.length === 0 && (
                <p className="p-3 text-[13px] text-[rgb(var(--color-text-muted))]">
                  Brak produktów pasujących do wyszukiwania.
                </p>
              )}
              {categories.map((category) => (
                <div key={category.id}>
                  <div
                    className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.06em]"
                    style={{
                      color: "rgb(var(--color-text-muted))",
                      background: "rgb(var(--color-bg-card))",
                    }}
                  >
                    {category.name}
                  </div>
                  {category.products.map((product) => {
                    const active = selected?.id === product.id;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => pick(product)}
                        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-[13px]"
                        style={{
                          background: active
                            ? "rgb(var(--color-primary) / 0.08)"
                            : "transparent",
                          color: active
                            ? "rgb(var(--color-primary))"
                            : "rgb(var(--color-text-body))",
                          fontWeight: active ? 600 : 400,
                          border: "none",
                          cursor: "pointer",
                        }}
                      >
                        <span>{product.name}</span>
                        {!product.available && (
                          <span
                            className="shrink-0 text-[11px]"
                            style={{ color: "rgb(var(--status-cancelled))" }}
                          >
                            niedostępny
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <div>
            {!selected && (
              <p className="text-[13px] text-[rgb(var(--color-text-muted))]">
                Wybierz produkt z listy po lewej.
              </p>
            )}
            {selected && (
              <div className="flex flex-col gap-3">
                <div className="text-[15px] font-semibold text-[rgb(var(--color-text-primary))]">
                  {selected.name}
                </div>
                {!selected.available && (
                  <div
                    className="rounded-md px-2.5 py-1.5 text-[12px]"
                    style={{ background: "#FFF8E1", color: "#78350F" }}
                  >
                    Produkt jest oznaczony w menu jako niedostępny. Możesz go dodać,
                    ale upewnij się, że kuchnia go zrobi.
                  </div>
                )}
                <ItemControls
                  product={selected}
                  variantId={variantId}
                  addonIds={addonIds}
                  onVariantChange={setVariantId}
                  onAddonsChange={setAddonIds}
                />
                <div>
                  <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[rgb(var(--color-text-muted))]">
                    Ilość
                  </div>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={quantity}
                    onChange={(e) => {
                      const parsed = Number.parseInt(e.target.value, 10);
                      setQuantity(Number.isFinite(parsed) ? Math.min(99, Math.max(1, parsed)) : 1);
                    }}
                    className="w-24 rounded-md px-3 py-1.5 text-[14px]"
                    style={{
                      border: "1px solid rgb(var(--color-border-card))",
                      background: "rgb(var(--color-bg-card))",
                      color: "rgb(var(--color-text-primary))",
                      fontFamily: "var(--font-mono)",
                    }}
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={itemNote}
                    maxLength={NOTE_MAX}
                    onChange={(e) => setItemNote(e.target.value)}
                    placeholder="Notatka do pozycji, np. bez cebuli"
                    className="w-full rounded-md px-3 py-1.5 text-[13px]"
                    style={{
                      border: "1px solid rgb(var(--color-border-card))",
                      background: "rgb(var(--color-bg-section))",
                      color: "rgb(var(--color-text-primary))",
                    }}
                  />
                </div>
                {error && (
                  <div className="text-[12px]" style={{ color: "rgb(var(--status-cancelled))" }}>
                    {error}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-5">
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button type="button" variant="primary" disabled={!canAdd} onClick={handleAdd}>
            Dodaj pozycję
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
