import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import {
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
  type AdminCategoryDto,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/Button";
import { Switch } from "@/shared/components/ui/Switch";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/Table";
import { CategoryFormDialog } from "./CategoryFormDialog";

export function CategoriesList() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "menu", "categories"],
    queryFn: fetchAdminCategories,
  });

  const [editing, setEditing] = useState<AdminCategoryDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "categories"] });
    queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminCategory(id),
    onSuccess: () => {
      invalidate();
      toast.success("Kategoria usunięta");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się usunąć kategorii");
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: ({ cat, next }: { cat: AdminCategoryDto; next: boolean }) =>
      updateAdminCategory(cat.id, {
        version: cat.version,
        name: cat.name,
        description: cat.description,
        displayOrder: cat.displayOrder,
        active: next,
      }),
    onSuccess: () => invalidate(),
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(
        problem?.detail ?? problem?.title ?? "Nie udało się zmienić widoczności"
      );
    },
  });

  const openAdd = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (cat: AdminCategoryDto) => {
    setEditing(cat);
    setDialogOpen(true);
  };
  const onDelete = (cat: AdminCategoryDto) => {
    if (cat.productsCount > 0) {
      toast.error(`Kategoria ma ${cat.productsCount} produktów. Przenieś lub usuń produkty.`);
      return;
    }
    if (!window.confirm(`Usunąć kategorię "${cat.name}"? Tej operacji nie cofniesz.`)) return;
    deleteMutation.mutate(cat.id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-semibold text-slate-900">Kategorie</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Widoczne publicznie kategorie wyświetlają się w menu klienta.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Dodaj kategorię
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
          Ładowanie…
        </div>
      ) : null}

      {isError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Nie udało się pobrać listy kategorii.
        </div>
      ) : null}

      {data && data.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="h-5 w-5" />}
          title="Brak kategorii"
          description="Dodaj pierwszą, żeby zacząć budować menu."
          action={
            <Button onClick={openAdd} size="sm">
              <Plus className="h-4 w-4" /> Dodaj pierwszą kategorię
            </Button>
          }
        />
      ) : null}

      {data && data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <Table>
            <colgroup>
              <col className="w-[64px]" />
              <col />
              <col className="w-[120px]" />
              <col className="w-[180px]" />
              <col className="w-[120px]" />
            </colgroup>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[11px]">Lp.</TableHead>
                <TableHead className="text-[11px]">Nazwa</TableHead>
                <TableHead className="hidden text-[11px] md:table-cell">Produkty</TableHead>
                <TableHead className="text-[11px]">Widoczna</TableHead>
                <TableHead className="text-right text-[11px]">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((cat, idx) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-mono text-[12px] text-slate-400">
                    {String(idx + 1).padStart(2, "0")}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-slate-900">{cat.name}</div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {cat.slug}
                    </div>
                  </TableCell>
                  <TableCell className="hidden font-mono text-[13px] text-slate-600 md:table-cell">
                    {cat.productsCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={cat.active}
                        disabled={visibilityMutation.isPending}
                        onCheckedChange={(next) =>
                          visibilityMutation.mutate({ cat, next })
                        }
                        aria-label={`Przełącz widoczność ${cat.name}`}
                      />
                      <span className="text-[12px] text-slate-600">
                        {cat.active ? "Tak" : "Nie"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(cat)}
                        aria-label={`Edytuj ${cat.name}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(cat)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Usuń ${cat.name}`}
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

      <CategoryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editing} />
    </div>
  );
}
