import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";
import {
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  patchAdminProductAvailability,
  type AdminProductDto,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/Button";
import { Switch } from "@/shared/components/ui/Switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";

const ALL = "__all__";

export function ProductsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);

  const { data: categories } = useQuery({
    queryKey: ["admin", "menu", "categories"],
    queryFn: fetchAdminCategories,
  });

  const categoryId = categoryFilter === ALL ? undefined : Number(categoryFilter);

  const productsQuery = useQuery({
    queryKey: ["admin", "menu", "products", { categoryId }],
    queryFn: () => fetchAdminProducts({ categoryId }),
  });

  const availabilityMutation = useMutation({
    mutationFn: ({ id, available }: { id: number; available: boolean }) =>
      patchAdminProductAvailability(id, available),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się zmienić dostępności");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Produkt usunięty");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się usunąć produktu");
    },
  });

  const onDelete = (product: AdminProductDto) => {
    if (!window.confirm(`Usunąć produkt "${product.name}"? Operacja jest nieodwracalna.`)) return;
    deleteMutation.mutate(product.id);
  };

  const priceLabel = (product: AdminProductDto) => {
    if (product.basePrice !== null) return formatPrice(product.basePrice, currency);
    if (product.variantsCount > 0) return "—";
    return "—";
  };

  const products = productsQuery.data ?? [];

  const categoryOptions = useMemo(
    () => [
      { value: ALL, label: "Wszystkie kategorie" },
      ...(categories ?? []).map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [categories]
  );

  const hasCategories = (categories ?? []).length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Produkty</h2>
          <p className="text-sm text-slate-500">
            Zarządzaj wszystkimi pozycjami menu. Dostępność możesz przełączyć bezpośrednio w tabeli.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-52">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtruj po kategorii" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            disabled={!hasCategories}
            onClick={() => navigate("/admin/menu/products/new")}
          >
            <Plus className="h-4 w-4" /> Nowy produkt
          </Button>
        </div>
      </div>

      {!hasCategories ? (
        <div className="rounded-lg border border-dashed border-slate-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Najpierw dodaj kategorię w zakładce <strong>Kategorie</strong> — produkty muszą być do
          niej przypisane.
        </div>
      ) : null}

      {productsQuery.isLoading ? (
        <div className="py-8 text-center text-sm text-slate-500">Ładowanie…</div>
      ) : null}

      {productsQuery.isError ? (
        <div className="py-8 text-center text-sm text-red-600">
          Nie udało się pobrać listy produktów.
        </div>
      ) : null}

      {products.length === 0 && !productsQuery.isLoading && !productsQuery.isError ? (
        <div className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
          Brak produktów {categoryId !== undefined ? "w wybranej kategorii" : ""}.
        </div>
      ) : null}

      {products.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Nazwa</th>
                <th className="px-4 py-3 hidden sm:table-cell">Kategoria</th>
                <th className="px-4 py-3 hidden md:table-cell">Cena</th>
                <th className="px-4 py-3 hidden md:table-cell">Warianty</th>
                <th className="px-4 py-3 hidden lg:table-cell">Dodatki</th>
                <th className="px-4 py-3">Dostępny</th>
                <th className="px-4 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-10 w-10 shrink-0 rounded object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 shrink-0 rounded bg-slate-100" />
                      )}
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">{product.name}</div>
                        <div className="truncate font-mono text-xs text-slate-500">
                          {product.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                    {product.categoryName}
                  </td>
                  <td className="px-4 py-3 text-slate-700 hidden md:table-cell">
                    {priceLabel(product)}
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden md:table-cell">
                    {product.variantsCount}
                  </td>
                  <td className="px-4 py-3 text-slate-600 hidden lg:table-cell">
                    {product.addonGroupsCount}
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      checked={product.available}
                      disabled={availabilityMutation.isPending}
                      onCheckedChange={(next) =>
                        availabilityMutation.mutate({ id: product.id, available: next })
                      }
                      aria-label={`Przełącz dostępność ${product.name}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Edytuj ${product.name}`}
                        onClick={() => navigate(`/admin/menu/products/${product.id}`)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(product)}
                        disabled={deleteMutation.isPending}
                        aria-label={`Usuń ${product.name}`}
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
    </div>
  );
}
