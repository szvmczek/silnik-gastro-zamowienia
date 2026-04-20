import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteAdminAddonGroup,
  fetchAdminAddonGroups,
  type AdminAddonGroupDto,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/Button";
import { AddonGroupFormDialog } from "./AddonGroupFormDialog";

export function AddonGroupsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "menu", "addon-groups"],
    queryFn: fetchAdminAddonGroups,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAddonGroupDto | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminAddonGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "addon-groups"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Grupa usunięta");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się usunąć grupy");
    },
  });

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (group: AdminAddonGroupDto) => {
    setEditing(group);
    setDialogOpen(true);
  };

  const onDelete = (group: AdminAddonGroupDto) => {
    if (group.usedByProducts > 0) {
      toast.error(
        `Grupa jest przypięta do ${group.usedByProducts} produkt(ów). Odepnij ją najpierw.`
      );
      return;
    }
    if (!window.confirm(`Usunąć grupę "${group.name}"? Zostaną też usunięte jej dodatki.`)) return;
    deleteMutation.mutate(group.id);
  };

  const groups = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Grupy dodatków</h2>
          <p className="text-sm text-slate-500">
            Zestawy dodatków podpinane do produktów (np. „Dodatki pizzy”, „Sos”).
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Nowa grupa
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-slate-500">Ładowanie…</div>
      ) : null}
      {isError ? (
        <div className="py-8 text-center text-sm text-red-600">
          Nie udało się pobrać grup dodatków.
        </div>
      ) : null}

      {groups.length === 0 && !isLoading && !isError ? (
        <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
          Brak grup. Dodaj pierwszą grupę, żeby móc podpiąć ją do produktów.
        </div>
      ) : null}

      {groups.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nazwa</th>
                <th className="px-4 py-3 hidden md:table-cell">Zakres</th>
                <th className="px-4 py-3 hidden sm:table-cell">Dodatki</th>
                <th className="px-4 py-3 hidden md:table-cell">Wymagana</th>
                <th className="px-4 py-3 hidden md:table-cell">Produkty</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/menu/addon-groups/${group.id}`)}
                      className="font-medium text-slate-900 hover:text-primary hover:underline"
                    >
                      {group.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                    {group.minSelect}–{group.maxSelect}
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                    {group.addons.length}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={
                        group.required
                          ? "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                          : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      }
                    >
                      {group.required ? "Tak" : "Nie"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                    {group.usedByProducts}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(group)}
                        aria-label={`Edytuj grupę ${group.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(group)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Usuń grupę ${group.name}`}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      <AddonGroupFormDialog open={dialogOpen} onOpenChange={setDialogOpen} group={editing} />
    </div>
  );
}
