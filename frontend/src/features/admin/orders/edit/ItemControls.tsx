import type { PublicProductDto } from "@/shared/api/menuApi";

interface ItemControlsProps {
  product: PublicProductDto;
  variantId: number | null;
  addonIds: number[];
  onVariantChange: (variantId: number | null) => void;
  onAddonsChange: (addonIds: number[]) => void;
}

function zl(raw: string): string {
  const n = Number.parseFloat(raw);
  if (!Number.isFinite(n)) return raw;
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

/**
 * Wybór wariantu i dodatków — wspólny dla wiersza w edytorze i dla okna
 * dodawania pozycji, żeby obie ścieżki respektowały te same limity grup.
 * Ostateczną bramką i tak jest backend; tu chodzi o to, żeby admin nie
 * dowiadywał się o naruszeniu limitu dopiero z błędu zapisu.
 */
export function ItemControls({
  product,
  variantId,
  addonIds,
  onVariantChange,
  onAddonsChange,
}: ItemControlsProps) {
  const toggleAddon = (id: number, groupAddonIds: number[], maxSelect: number) => {
    if (addonIds.includes(id)) {
      onAddonsChange(addonIds.filter((a) => a !== id));
      return;
    }
    const selectedInGroup = addonIds.filter((a) => groupAddonIds.includes(a));
    if (maxSelect === 1) {
      // Grupa jednokrotnego wyboru (np. sos do brzegów) — nowy wybór
      // zastępuje poprzedni zamiast odbijać się o limit.
      onAddonsChange([...addonIds.filter((a) => !groupAddonIds.includes(a)), id]);
      return;
    }
    if (selectedInGroup.length >= maxSelect) return;
    onAddonsChange([...addonIds, id]);
  };

  return (
    <div className="flex flex-col gap-3">
      {product.variants.length > 0 && (
        <div>
          <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[rgb(var(--color-text-muted))]">
            Rozmiar
          </div>
          <div className="flex flex-wrap gap-1.5">
            {product.variants.map((variant) => {
              const active = variant.id === variantId;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => onVariantChange(variant.id)}
                  className="rounded-md px-2.5 py-1 text-[13px] font-medium"
                  style={{
                    border: active
                      ? "1px solid rgb(var(--color-primary))"
                      : "1px solid rgb(var(--color-border-card))",
                    background: active
                      ? "rgb(var(--color-primary) / 0.08)"
                      : "rgb(var(--color-bg-card))",
                    color: active
                      ? "rgb(var(--color-primary))"
                      : "rgb(var(--color-text-body))",
                  }}
                >
                  {variant.name} · {zl(variant.price)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {product.addonGroups.map((group) => {
        const groupAddonIds = group.addons.map((a) => a.id);
        const selectedInGroup = addonIds.filter((a) => groupAddonIds.includes(a));
        const invalid =
          selectedInGroup.length < group.minSelect ||
          (group.required && selectedInGroup.length === 0);
        return (
          <div key={group.id}>
            <div className="mb-1.5 flex items-baseline justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[rgb(var(--color-text-muted))]">
                {group.name}
              </span>
              <span
                className="text-[11px]"
                style={{
                  color: invalid
                    ? "rgb(var(--status-cancelled))"
                    : "rgb(var(--color-text-faint))",
                }}
              >
                {group.required || group.minSelect > 0
                  ? `wymagane: min ${Math.max(group.minSelect, group.required ? 1 : 0)}`
                  : `max ${group.maxSelect}`}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.addons.map((addon) => {
                const active = addonIds.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id, groupAddonIds, group.maxSelect)}
                    className="rounded-md px-2.5 py-1 text-[13px]"
                    style={{
                      border: active
                        ? "1px solid rgb(var(--color-primary))"
                        : "1px solid rgb(var(--color-border-card))",
                      background: active
                        ? "rgb(var(--color-primary) / 0.08)"
                        : "rgb(var(--color-bg-card))",
                      color: active
                        ? "rgb(var(--color-primary))"
                        : "rgb(var(--color-text-body))",
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {addon.name}
                    {Number.parseFloat(addon.price) > 0 ? ` +${zl(addon.price)}` : ""}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Komunikat blokujący zapis, gdy konfiguracja łamie limity grup. */
export function itemConfigError(
  product: PublicProductDto | undefined,
  variantId: number | null,
  addonIds: number[],
): string | null {
  if (!product) return null;
  if (product.variants.length > 0 && variantId === null) {
    return "Wybierz rozmiar.";
  }
  for (const group of product.addonGroups) {
    const groupAddonIds = group.addons.map((a) => a.id);
    const count = addonIds.filter((a) => groupAddonIds.includes(a)).length;
    const min = Math.max(group.minSelect, group.required ? 1 : 0);
    if (count < min) {
      return `Grupa „${group.name}" wymaga minimum ${min}.`;
    }
    if (count > group.maxSelect) {
      return `Grupa „${group.name}" dopuszcza maksimum ${group.maxSelect}.`;
    }
  }
  return null;
}
