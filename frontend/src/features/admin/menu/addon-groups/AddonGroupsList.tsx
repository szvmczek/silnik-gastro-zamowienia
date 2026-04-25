import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Layers3, Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteAdminAddonGroup,
  fetchAdminAddonGroups,
  type AdminAddonGroupDto,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/Button";
import { Badge } from "@/shared/components/ui/Badge";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/Table";
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
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-semibold text-slate-900">Grupy dodatków</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Zestawy dodatków podpinane do produktów (np. „Sos", „Dodatki pizzy").
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Nowa grupa
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
          Ładowanie…
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Nie udało się pobrać grup dodatków.
        </div>
      ) : null}

      {!isLoading && !isError && groups.length === 0 ? (
        <EmptyState
          icon={<Layers3 className="h-5 w-5" />}
          title="Brak grup"
          description="Dodaj pierwszą grupę, żeby móc podpinać ją do produktów."
          action={
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Dodaj pierwszą grupę
            </Button>
          }
        />
      ) : null}

      {groups.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table>
            <colgroup>
              <col />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
              <col className="w-[120px]" />
              <col className="w-[100px]" />
              <col className="w-[100px]" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">Nazwa</TableHead>
                <TableHead className="hidden text-[11px] md:table-cell">Zakres</TableHead>
                <TableHead className="hidden text-[11px] sm:table-cell">Dodatki</TableHead>
                <TableHead className="hidden text-[11px] md:table-cell">Wymagana</TableHead>
                <TableHead className="hidden text-[11px] md:table-cell">Produkty</TableHead>
                <TableHead className="text-right text-[11px]">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/menu/addon-groups/${group.id}`)}
                      className="font-medium text-slate-900 hover:text-primary"
                    >
                      {group.name}
                    </button>
                  </TableCell>
                  <TableCell className="hidden font-mono text-[13px] text-slate-600 md:table-cell">
                    {group.minSelect}–{group.maxSelect}
                  </TableCell>
                  <TableCell className="hidden font-mono text-[13px] text-slate-600 sm:table-cell">
                    {group.addons.length}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={group.required ? "warning" : "muted"}>
                      {group.required ? "Tak" : "Nie"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden font-mono text-[13px] text-slate-600 md:table-cell">
                    {group.usedByProducts}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(group)}
                        aria-label={`Edytuj grupę ${group.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(group)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Usuń grupę ${group.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : null}

      <AddonGroupFormDialog open={dialogOpen} onOpenChange={setDialogOpen} group={editing} />
    </div>
  );
}
