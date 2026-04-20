import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteAdminCategory,
  fetchAdminCategories,
  type AdminCategoryDto,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/Button";
import { CategoryFormDialog } from "./CategoryFormDialog";

export function CategoriesList() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "menu", "categories"],
    queryFn: fetchAdminCategories,
  });

  const [editing, setEditing] = useState<AdminCategoryDto | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Kategoria usunięta");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się usunąć kategorii");
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Kategorie</h2>
          <p className="text-sm text-slate-500">
            Widoczne publicznie kategorie wyświetlają się w menu klienta.
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Dodaj kategorię
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-slate-500">Ładowanie…</div>
      ) : null}
      {isError ? (
        <div className="py-8 text-center text-sm text-red-600">
          Nie udało się pobrać listy kategorii.
        </div>
      ) : null}

      {data && data.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
          Brak kategorii. Dodaj pierwszą, żeby zacząć budować menu.
        </div>
      ) : null}

      {data && data.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nazwa</th>
                <th className="px-4 py-3 hidden sm:table-cell">Slug</th>
                <th className="px-4 py-3 hidden md:table-cell">Produkty</th>
                <th className="px-4 py-3">Kolejność</th>
                <th className="px-4 py-3">Widoczna</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{cat.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 hidden sm:table-cell">
                    {cat.slug}
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                    {cat.productsCount}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{cat.displayOrder}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        cat.active
                          ? "inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700"
                          : "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
                      }
                    >
                      {cat.active ? "Tak" : "Nie"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(cat)}
                        aria-label={`Edytuj ${cat.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(cat)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Usuń ${cat.name}`}
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

      <CategoryFormDialog open={dialogOpen} onOpenChange={setDialogOpen} category={editing} />
    </div>
  );
}
