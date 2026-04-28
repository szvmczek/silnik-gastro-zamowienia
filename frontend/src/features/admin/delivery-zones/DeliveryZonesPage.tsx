import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import {
  addArea,
  createZone,
  deleteArea,
  deleteZone,
  fetchZones,
  updateZone,
} from "./api";
import type { DeliveryZoneDto } from "./types";
import { ZoneFormDialog } from "./components/ZoneFormDialog";
import { AddAreaForm } from "./components/AddAreaForm";

const TYPE_LABEL: Record<DeliveryZoneDto["type"], string> = {
  FREE: "Darmowa",
  PAID: "Płatna",
  UNAVAILABLE: "Niedostępna",
};

const TYPE_COLOR: Record<DeliveryZoneDto["type"], "default" | "secondary" | "destructive"> = {
  FREE: "default",
  PAID: "secondary",
  UNAVAILABLE: "destructive",
};

export function DeliveryZonesPage() {
  const qc = useQueryClient();
  const { data: zones = [], isLoading } = useQuery({
    queryKey: ["admin", "delivery-zones"],
    queryFn: fetchZones,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DeliveryZoneDto | null>(null);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin", "delivery-zones"] });
    qc.invalidateQueries({ queryKey: ["public", "delivery-cities"] });
  };

  const fallbackCitiesAcrossZones = useMemo(() => {
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
    type: DeliveryZoneDto["type"];
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

  const handleDeleteZone = async (z: DeliveryZoneDto) => {
    if (!window.confirm(`Usunąć strefę "${z.name}"?`)) return;
    try {
      await deleteZone(z.id);
      toast.success("Strefa usunięta lub dezaktywowana");
      invalidate();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Nie udało się usunąć strefy");
    }
  };

  const addAreaMutation = useMutation({
    mutationFn: ({ zoneId, areas }: { zoneId: number; areas: { city: string; postalCode: string | null }[] }) =>
      Promise.all(areas.map((a) => addArea(zoneId, a))),
    onSuccess: () => {
      toast.success("Obszary dodane");
      invalidate();
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "Nie udało się dodać obszaru");
    },
  });

  const handleAddAreas = async (zoneId: number, areas: { city: string; postalCode: string | null }[]) => {
    // Override warning: jeśli w bazie istnieje już (city, NULL) w innej strefie,
    // dodanie (city, postal) jest legalnym override'em — informujemy usera.
    const overrides = areas.filter(
      (a) => a.postalCode !== null && fallbackCitiesAcrossZones.has(a.city.trim().toLowerCase()),
    );
    if (overrides.length > 0) {
      const ok = window.confirm(
        `Niektóre wpisy nadpiszą regułę ogólną dla tej miejscowości w innej strefie. Kontynuować?`,
      );
      if (!ok) return;
    }
    await addAreaMutation.mutateAsync({ zoneId, areas });
  };

  const handleDeleteArea = async (zoneId: number, areaId: number) => {
    if (!window.confirm("Usunąć ten obszar?")) return;
    try {
      await deleteArea(zoneId, areaId);
      toast.success("Obszar usunięty");
      invalidate();
    } catch (e: any) {
      toast.error(e?.response?.data?.detail ?? "Nie udało się usunąć obszaru");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="kicker">Panel</p>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-slate-900">
            Strefy dostawy
          </h1>
          <p className="mt-1 text-[14px] text-slate-500">
            Konfiguruj gdzie dowozisz i za ile.
          </p>
        </div>
        <Button onClick={() => { setEditing(null); setDialogOpen(true); }}>
          <Plus className="h-4 w-4" /> Dodaj strefę
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
          Ładowanie…
        </div>
      ) : zones.length === 0 ? (
        <EmptyState
          icon={<MapPin className="h-5 w-5" />}
          title="Brak skonfigurowanych stref"
          description="Skonfiguruj strefy, żeby zacząć przyjmować zamówienia z dostawą. Dopóki strefy nie zostaną dodane, każdy adres jest traktowany jako niedostępny."
          action={
            <Button size="sm" onClick={() => { setEditing(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4" /> Dodaj pierwszą strefę
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {zones.map((z) => (
            <div key={z.id} className="rounded-lg border border-slate-200 bg-white">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-[16px] font-semibold text-slate-900">{z.name}</h2>
                    <Badge variant={TYPE_COLOR[z.type]}>{TYPE_LABEL[z.type]}</Badge>
                    {!z.active && <Badge variant="outline">nieaktywna</Badge>}
                  </div>
                  {z.type === "PAID" && (
                    <p className="mt-1 text-[13px] text-slate-500">
                      Koszt dostawy: <span className="font-medium text-slate-900">{z.deliveryFee.toFixed(2)} zł</span>
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => { setEditing(z); setDialogOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteZone(z)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <h3 className="text-[13px] font-medium text-slate-700">Obszary ({z.areas.length})</h3>
                  {z.areas.length === 0 ? (
                    <p className="mt-1 text-[13px] text-slate-500">Brak obszarów. Dodaj poniżej.</p>
                  ) : (
                    <ul className="mt-2 space-y-1">
                      {z.areas.map((a) => (
                        <li
                          key={a.id}
                          className="flex items-center justify-between gap-2 rounded-md bg-slate-50 px-3 py-1.5 text-[13px]"
                        >
                          <span>
                            <span className="font-medium">{a.city}</span>
                            <span className="text-slate-500">
                              {" "}— {a.postalCode ?? "cała miejscowość"}
                            </span>
                          </span>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteArea(z.id, a.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <AddAreaForm onAdd={(areas) => handleAddAreas(z.id, areas)} />
              </div>
            </div>
          ))}
        </div>
      )}

      <ZoneFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initial={editing}
        onSubmit={saveZone}
      />
    </div>
  );
}
