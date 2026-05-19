import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import {
  addArea,
  createZone,
  deleteArea,
  deleteZone,
  fetchZones,
  updateZone,
} from "@/features/admin/delivery-zones/api";
import type {
  DeliveryZoneDto,
  DeliveryZoneType,
} from "@/features/admin/delivery-zones/types";
import { ZoneFormDialog } from "@/features/admin/delivery-zones/components/ZoneFormDialog";
import { parsePostalCodes } from "@/features/admin/delivery-zones/lib/postalCode";
import { Switch } from "@/shared/components/ui/Switch";

// Bundle ref: docs/design/v2-stage4/section-zones.jsx.
// N23 A — table shell z bundle, expand editor = realny areas-list manager
// (Phase 7 / AD-019 data model priority, bundle Tryb1/Tryb2 to mockup).
// N25 A — brak SaveBar (immediate-save CRUD). N26 A — brak static demo cards.

type ZoneTypeMeta = { label: string; color: string; tint: string };

const TYPE_META: Record<DeliveryZoneType, ZoneTypeMeta> = {
  FREE: {
    label: "Darmowa",
    color: "rgb(var(--status-ready))",
    tint: "rgb(var(--status-ready-tint))",
  },
  PAID: {
    label: "Płatna",
    color: "rgb(var(--status-new))",
    tint: "rgb(var(--status-new-tint))",
  },
  UNAVAILABLE: {
    label: "Niedostępna",
    color: "rgb(var(--status-cancelled))",
    tint: "rgb(var(--status-cancelled-tint))",
  },
};

const GRID_COLS = "32px 1fr 120px 110px 110px 76px 84px";

function zl(n: number): string {
  return `${n.toFixed(2).replace(".", ",")} zł`;
}

function areasLabel(n: number): string {
  if (n === 1) return "1 obszar";
  if (n >= 2 && n <= 4) return `${n} obszary`;
  return `${n} obszarów`;
}

function problemDetail(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { detail?: string } } };
  return e?.response?.data?.detail ?? fallback;
}

export function ZonesSection() {
  const qc = useQueryClient();
  const query = useQuery<DeliveryZoneDto[]>({
    queryKey: ["admin", "delivery-zones"],
    queryFn: fetchZones,
  });
  const zones = query.data ?? [];

  const [expanded, setExpanded] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryZoneDto | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "delivery-zones"] });
    qc.invalidateQueries({ queryKey: ["public", "delivery-cities"] });
  };

  // Invariant #5 — cities with a (city, NULL) whole-city area anywhere.
  // Adding (city, code) over such a city is a legal override → warn.
  const fallbackCities = useMemo(() => {
    const set = new Set<string>();
    for (const z of zones) {
      for (const a of z.areas) {
        if (a.postalCode === null) set.add(a.city.trim().toLowerCase());
      }
    }
    return set;
  }, [zones]);

  const saveZone = async (values: {
    name: string;
    type: DeliveryZoneType;
    deliveryFee: number;
    active: boolean;
  }) => {
    if (editing) {
      await updateZone(editing.id, values);
      toast.success("Strefa zaktualizowana");
    } else {
      await createZone(values);
      toast.success("Strefa dodana");
    }
    invalidate();
  };

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      updateZone(id, { active }),
    onSuccess: (_data, vars) => {
      invalidate();
      toast.success(vars.active ? "Strefa włączona" : "Strefa wyłączona");
    },
    onError: (err) =>
      toast.error(problemDetail(err, "Nie udało się zmienić statusu strefy")),
  });

  // Invariant #1 — backend soft-deletes (active=false) when zone has areas or
  // is referenced by orders; hard-deletes only otherwise. Controller returns
  // 204 either way — we re-fetch and check presence to pick the right toast.
  const handleDeleteZone = async (z: DeliveryZoneDto) => {
    if (!window.confirm(`Usunąć strefę „${z.name}"?`)) return;
    try {
      await deleteZone(z.id);
      const fresh = await fetchZones();
      qc.setQueryData(["admin", "delivery-zones"], fresh);
      qc.invalidateQueries({ queryKey: ["public", "delivery-cities"] });
      const stillExists = fresh.some((x) => x.id === z.id);
      toast.success(
        stillExists
          ? "Strefa dezaktywowana (ma obszary lub zamówienia)"
          : "Strefa usunięta",
      );
      if (!stillExists && expanded === z.id) setExpanded(null);
    } catch (err) {
      toast.error(problemDetail(err, "Nie udało się usunąć strefy"));
    }
  };

  const handleDeleteArea = async (zoneId: number, areaId: number) => {
    if (!window.confirm("Usunąć ten obszar?")) return;
    try {
      await deleteArea(zoneId, areaId);
      toast.success("Obszar usunięty");
      invalidate();
    } catch (err) {
      toast.error(problemDetail(err, "Nie udało się usunąć obszaru"));
    }
  };

  const handleAddAreas = async (
    zoneId: number,
    areas: { city: string; postalCode: string | null }[],
  ) => {
    // Invariant #5 — override warning before legal cross-zone override.
    const overrides = areas.filter(
      (a) =>
        a.postalCode !== null &&
        fallbackCities.has(a.city.trim().toLowerCase()),
    );
    if (overrides.length > 0) {
      const ok = window.confirm(
        "Niektóre wpisy nadpiszą regułę „cała miejscowość” z innej strefy. Kontynuować?",
      );
      if (!ok) return false;
    }
    try {
      // Invariant #2 — backend 409 on duplicate (city, code) cross-zones.
      for (const a of areas) {
        await addArea(zoneId, a);
      }
      toast.success(areas.length === 1 ? "Obszar dodany" : "Obszary dodane");
      invalidate();
      return true;
    } catch (err) {
      toast.error(problemDetail(err, "Nie udało się dodać obszaru"));
      return false;
    }
  };

  return (
    <>
      <AdminTopbar title="Strefy dostawy" metadata="Lista stref i opłat" />
      <div className="min-h-0 flex-1 overflow-auto">
        <div className="mx-auto max-w-[1080px] p-8">
          <div className="mb-6 flex items-end justify-between gap-6">
            <p
              className="m-0 max-w-[640px] text-[14px]"
              style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.55 }}
            >
              Każda strefa ma jeden tryb opłaty i listę obszarów (cała
              miejscowość lub konkretne kody pocztowe). Przy zamówieniu klient
              wpisuje kod i system wybiera strefę.
            </p>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg px-[18px] text-[14px] font-semibold text-white"
              style={{
                background: "rgb(var(--color-primary))",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Plus size={16} strokeWidth={2.4} aria-hidden /> Dodaj strefę
            </button>
          </div>

          {query.isPending ? (
            <div
              className="rounded-xl py-10 text-center text-[14px]"
              style={{
                background: "rgb(var(--color-bg-card))",
                border: "1px solid rgb(var(--color-border-card))",
                color: "rgb(var(--color-text-muted))",
              }}
            >
              Ładowanie stref…
            </div>
          ) : query.isError ? (
            <div
              className="rounded-md p-3 text-sm"
              style={{
                border: "1px solid rgb(var(--status-cancelled) / 0.3)",
                background: "rgb(var(--status-cancelled-tint))",
                color: "rgb(var(--status-cancelled))",
              }}
            >
              Nie udało się pobrać stref. Odśwież stronę.
            </div>
          ) : zones.length === 0 ? (
            <div
              className="rounded-xl px-6 py-12 text-center"
              style={{
                background: "rgb(var(--color-bg-card))",
                border: "1px dashed rgb(var(--color-border-card))",
              }}
            >
              <div
                className="text-[15px] font-semibold"
                style={{ color: "rgb(var(--color-text-body))" }}
              >
                Brak skonfigurowanych stref
              </div>
              <p
                className="mx-auto mt-2 max-w-[420px] text-[13px]"
                style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.6 }}
              >
                Dopóki strefy nie zostaną dodane, każdy adres dostawy jest
                traktowany jako niedostępny.
              </p>
            </div>
          ) : (
            <div
              className="overflow-hidden rounded-xl"
              style={{
                background: "rgb(var(--color-bg-card))",
                border: "1px solid rgb(var(--color-border-card))",
              }}
            >
              {/* header */}
              <div
                className="grid items-center gap-3 px-[18px] py-3 text-[11px] font-bold uppercase"
                style={{
                  gridTemplateColumns: GRID_COLS,
                  background: "rgb(var(--color-bg-section))",
                  borderBottom: "1px solid rgb(var(--color-border-subtle))",
                  color: "rgb(var(--color-text-muted))",
                  letterSpacing: "0.06em",
                }}
              >
                <span />
                <span>Strefa</span>
                <span>Typ</span>
                <span>Opłata</span>
                <span>Obszary</span>
                <span>Aktywna</span>
                <span />
              </div>

              {zones.map((zone, idx) => {
                const isOpen = expanded === zone.id;
                const meta = TYPE_META[zone.type];
                return (
                  <div
                    key={zone.id}
                    style={{
                      borderBottom:
                        idx < zones.length - 1
                          ? "1px solid rgb(var(--color-border-subtle))"
                          : "none",
                    }}
                  >
                    <div
                      className="grid cursor-pointer items-center gap-3 px-[18px] py-3.5"
                      style={{
                        gridTemplateColumns: GRID_COLS,
                        background: isOpen
                          ? "rgba(230,57,70,0.03)"
                          : "transparent",
                      }}
                      onClick={() => setExpanded(isOpen ? null : zone.id)}
                    >
                      <span
                        className="inline-flex"
                        style={{
                          color: "rgb(var(--color-text-muted))",
                          transform: isOpen ? "rotate(90deg)" : "rotate(0)",
                          transition: "transform 180ms",
                        }}
                        aria-hidden
                      >
                        <ChevronRight size={14} strokeWidth={2} />
                      </span>
                      <span
                        className="truncate text-[14px] font-semibold"
                        style={{ color: "rgb(var(--color-text-primary))" }}
                      >
                        {zone.name}
                      </span>
                      <span>
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold"
                          style={{ background: meta.tint, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </span>
                      <span
                        className="text-[13px] font-semibold"
                        style={{
                          fontFamily: "var(--font-mono)",
                          color:
                            zone.type === "FREE"
                              ? "rgb(var(--status-ready))"
                              : "rgb(var(--color-text-primary))",
                        }}
                      >
                        {zone.type === "UNAVAILABLE"
                          ? "—"
                          : zl(zone.deliveryFee)}
                      </span>
                      <span
                        className="text-[13px]"
                        style={{ color: "rgb(var(--color-text-muted))" }}
                      >
                        {areasLabel(zone.areas.length)}
                      </span>
                      <span onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={zone.active}
                          disabled={toggleActive.isPending}
                          onCheckedChange={(active) =>
                            toggleActive.mutate({ id: zone.id, active })
                          }
                          aria-label={`Strefa ${zone.name} aktywna`}
                        />
                      </span>
                      <span
                        className="flex justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          label="Edytuj strefę"
                          onClick={() => {
                            setEditing(zone);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil size={14} strokeWidth={1.8} />
                        </IconButton>
                        <IconButton
                          label="Usuń strefę"
                          onClick={() => handleDeleteZone(zone)}
                        >
                          <Trash2 size={14} strokeWidth={1.8} />
                        </IconButton>
                      </span>
                    </div>

                    {isOpen && (
                      <AreasManager
                        zone={zone}
                        onAddAreas={(areas) => handleAddAreas(zone.id, areas)}
                        onDeleteArea={(areaId) =>
                          handleDeleteArea(zone.id, areaId)
                        }
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ZoneFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={saveZone}
      />
    </>
  );
}

/* ───────── Areas manager (expand panel) ───────── */

interface AreasManagerProps {
  zone: DeliveryZoneDto;
  onAddAreas: (
    areas: { city: string; postalCode: string | null }[],
  ) => Promise<boolean>;
  onDeleteArea: (areaId: number) => void;
}

function AreasManager({ zone, onAddAreas, onDeleteArea }: AreasManagerProps) {
  const [city, setCity] = useState("");
  const [wholeCity, setWholeCity] = useState(false);
  const [codesRaw, setCodesRaw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setCity("");
    setWholeCity(false);
    setCodesRaw("");
    setError(null);
  };

  const submit = async () => {
    setError(null);
    if (!city.trim()) {
      setError("Podaj miejscowość");
      return;
    }
    let payload: { city: string; postalCode: string | null }[];
    if (wholeCity) {
      payload = [{ city: city.trim(), postalCode: null }];
    } else {
      const { valid, invalid } = parsePostalCodes(codesRaw);
      if (invalid.length > 0) {
        setError(`Nieprawidłowy format: ${invalid.join(", ")}`);
        return;
      }
      if (valid.length === 0) {
        setError("Podaj co najmniej jeden kod pocztowy");
        return;
      }
      payload = valid.map((postalCode) => ({ city: city.trim(), postalCode }));
    }
    setBusy(true);
    const ok = await onAddAreas(payload);
    setBusy(false);
    if (ok) reset();
  };

  return (
    <div
      className="px-[18px] pb-6 pt-2"
      style={{
        paddingLeft: 50,
        background: "rgba(230,57,70,0.02)",
      }}
    >
      <div
        className="mb-2 text-[11px] font-bold uppercase"
        style={{
          letterSpacing: "0.06em",
          color: "rgb(var(--color-text-muted))",
        }}
      >
        Obszary ({zone.areas.length})
      </div>

      {zone.areas.length === 0 ? (
        <p
          className="mb-3 text-[13px]"
          style={{ color: "rgb(var(--color-text-muted))" }}
        >
          Brak obszarów — dodaj poniżej. Strefa bez obszarów nie obsłuży
          żadnego adresu.
        </p>
      ) : (
        <ul className="mb-3 flex flex-col gap-1">
          {zone.areas.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-md px-3 py-1.5 text-[13px]"
              style={{ background: "rgb(var(--color-bg-section))" }}
            >
              <span style={{ color: "rgb(var(--color-text-body))" }}>
                <span className="font-semibold">{a.city}</span>
                <span style={{ color: "rgb(var(--color-text-muted))" }}>
                  {" — "}
                  {a.postalCode ?? "cała miejscowość"}
                </span>
              </span>
              <IconButton
                label="Usuń obszar"
                onClick={() => onDeleteArea(a.id)}
              >
                <Trash2 size={13} strokeWidth={1.8} />
              </IconButton>
            </li>
          ))}
        </ul>
      )}

      {/* Add-area form (Tryb 1 cała miejscowość / Tryb 2 kody) */}
      <div
        className="rounded-lg p-3.5"
        style={{
          background: "rgb(var(--color-bg-card))",
          border: "1px solid rgb(var(--color-border-card))",
          maxWidth: 520,
        }}
      >
        <div className="mb-2.5">
          <FieldLabel>Miejscowość</FieldLabel>
          <ZoneInput
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="np. Łomianki"
          />
        </div>

        <label
          className="mb-2.5 flex cursor-pointer items-center gap-2.5 text-[13px]"
          style={{ color: "rgb(var(--color-text-body))" }}
        >
          <input
            type="checkbox"
            checked={wholeCity}
            onChange={(e) => setWholeCity(e.target.checked)}
            className="h-4 w-4 cursor-pointer accent-[rgb(var(--color-primary))]"
          />
          Cała miejscowość (wszystkie kody pocztowe)
        </label>

        {!wholeCity && (
          <div className="mb-2.5">
            <FieldLabel hint="po przecinku lub w nowej linii — auto-format do 00-000">
              Kody pocztowe
            </FieldLabel>
            <textarea
              rows={3}
              value={codesRaw}
              onChange={(e) => setCodesRaw(e.target.value)}
              placeholder="05-092, 05-090&#10;01-460"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid rgb(var(--color-border-card))",
                background: "rgb(var(--color-bg-card))",
                fontSize: 14,
                fontFamily: "var(--font-mono)",
                color: "rgb(var(--color-text-primary))",
                lineHeight: 1.55,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {error && (
          <div
            className="mb-2.5 rounded-md p-2 text-[12px]"
            style={{
              border: "1px solid rgb(var(--status-cancelled) / 0.3)",
              background: "rgb(var(--status-cancelled-tint))",
              color: "rgb(var(--status-cancelled))",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={busy}
          className="inline-flex h-9 items-center gap-1.5 rounded-md px-3.5 text-[13px] font-semibold text-white"
          style={{
            background: busy ? "#D4D0C2" : "rgb(var(--color-primary))",
            border: "none",
            cursor: busy ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          <Plus size={14} strokeWidth={2.4} aria-hidden />
          {busy ? "Dodawanie…" : "Dodaj obszar"}
        </button>
      </div>
    </div>
  );
}

/* ───────── primitives ───────── */

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-7 w-7 place-items-center rounded-md"
      style={{
        border: "none",
        background: "transparent",
        color: "rgb(var(--color-text-muted))",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function FieldLabel({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="mb-1.5 flex items-baseline gap-1.5">
      <span
        className="text-[13px] font-semibold"
        style={{ color: "rgb(var(--color-text-body))" }}
      >
        {children}
      </span>
      {hint && (
        <span
          className="text-[12px]"
          style={{ color: "rgb(var(--color-text-faint))" }}
        >
          · {hint}
        </span>
      )}
    </div>
  );
}

function ZoneInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { style, ...rest } = props;
  return (
    <input
      {...rest}
      style={{
        width: "100%",
        height: 40,
        padding: "0 12px",
        borderRadius: 8,
        border: "1px solid rgb(var(--color-border-card))",
        background: "rgb(var(--color-bg-card))",
        fontSize: 14,
        color: "rgb(var(--color-text-primary))",
        outline: "none",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}
