import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import {
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  patchAdminProductAvailability,
  type AdminProductDto,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Switch } from "@/shared/components/ui/Switch";
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
const STRIPE_BG = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 6px, rgba(15,23,42,0.08) 6px, rgba(15,23,42,0.08) 12px)",
} as const;

type AvailabilityFilter = "all" | "available" | "unavailable";

export function ProductsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [availabilityFilter, setAvailabilityFilter] =
    useState<AvailabilityFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const { data: categories } = useQuery({
    queryKey: ["admin", "menu", "categories"],
    queryFn: fetchAdminCategories,
  });

  const categoryId = categoryFilter === ALL ? undefined : Number(categoryFilter);

  useEffect(() => {
    setPage(0);
  }, [categoryId]);

  const productsQuery = useQuery({
    queryKey: ["admin", "menu", "products", { categoryId, page, size: PAGE_SIZE }],
    queryFn: () => fetchAdminProducts({ categoryId, page, size: PAGE_SIZE }),
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
    return "—";
  };

  const allProducts = productsQuery.data?.content ?? [];
  const totalElements = productsQuery.data?.totalElements ?? 0;
  const totalPages = productsQuery.data?.totalPages ?? 0;
  const currentPage = productsQuery.data?.number ?? 0;
  const isFirst = productsQuery.data?.first ?? true;
  const isLast = productsQuery.data?.last ?? true;

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allProducts.filter((p) => {
      if (availabilityFilter === "available" && !p.available) return false;
      if (availabilityFilter === "unavailable" && p.available) return false;
      if (q && !p.name.toLowerCase().includes(q) && !p.slug.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [allProducts, searchTerm, availabilityFilter]);

  const categoryOptions = useMemo(
    () => [
      { value: ALL, label: "Wszystkie kategorie" },
      ...(categories ?? []).map((c) => ({ value: String(c.id), label: c.name })),
    ],
    [categories]
  );

  const hasCategories = (categories ?? []).length > 0;
  const hasActiveLocalFilter =
    searchTerm.trim().length > 0 || availabilityFilter !== "all";

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[17px] font-semibold text-slate-900">Produkty</h2>
          <p className="mt-0.5 text-[13px] text-slate-500">
            Zarządzaj wszystkimi pozycjami menu. Dostępność możesz przełączyć
            bezpośrednio w tabeli.
          </p>
        </div>
        <Button
          type="button"
          disabled={!hasCategories}
          onClick={() => navigate("/admin/menu/products/new")}
        >
          <Plus className="h-4 w-4" /> Nowy produkt
        </Button>
      </div>

      {!hasCategories ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          Najpierw dodaj kategorię w zakładce <strong>Kategorie</strong> — produkty muszą być do
          niej przypisane.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Szukaj produktu lub sluga…"
            className="pl-9"
          />
        </div>
        <div className="w-full sm:w-52">
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
        <div className="w-full sm:w-48">
          <Select
            value={availabilityFilter}
            onValueChange={(v) => setAvailabilityFilter(v as AvailabilityFilter)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Dostępność" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Dostępne i niedostępne</SelectItem>
              <SelectItem value="available">Tylko dostępne</SelectItem>
              <SelectItem value="unavailable">Tylko niedostępne</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {productsQuery.isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
          Ładowanie…
        </div>
      ) : null}

      {productsQuery.isError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          Nie udało się pobrać listy produktów.
        </div>
      ) : null}

      {!productsQuery.isLoading && !productsQuery.isError && filteredProducts.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="h-5 w-5" />}
          title={
            hasActiveLocalFilter || categoryId !== undefined
              ? "Brak produktów dla tych filtrów"
              : "Brak produktów"
          }
          description={
            hasActiveLocalFilter || categoryId !== undefined
              ? "Zmień filtry albo wyczyść je, żeby zobaczyć wszystkie pozycje."
              : "Dodaj pierwszy produkt — pojawi się w menu klienta po włączeniu."
          }
          action={
            hasCategories ? (
              <Button
                size="sm"
                onClick={() => navigate("/admin/menu/products/new")}
              >
                <Plus className="h-4 w-4" /> Dodaj produkt
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {filteredProducts.length > 0 ? (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <Table>
              <colgroup>
                <col className="w-[64px]" />
                <col />
                <col className="w-[140px]" />
                <col className="w-[110px]" />
                <col className="w-[100px]" />
                <col className="w-[180px]" />
                <col className="w-[100px]" />
              </colgroup>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[11px]"></TableHead>
                  <TableHead className="text-[11px]">Nazwa</TableHead>
                  <TableHead className="hidden text-[11px] md:table-cell">Kategoria</TableHead>
                  <TableHead className="hidden text-right text-[11px] md:table-cell">
                    Cena
                  </TableHead>
                  <TableHead className="hidden text-[11px] lg:table-cell">Warianty</TableHead>
                  <TableHead className="text-[11px]">Dostępność</TableHead>
                  <TableHead className="text-right text-[11px]">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow
                    key={product.id}
                    className={!product.available ? "opacity-70" : undefined}
                  >
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/menu/products/${product.id}`)}
                        className="block h-10 w-10 overflow-hidden rounded-md focus:outline-none focus:ring-2 focus:ring-primary/40"
                        aria-label={`Otwórz ${product.name}`}
                        style={STRIPE_BG}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : null}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/menu/products/${product.id}`)}
                        className="block max-w-full text-left"
                      >
                        <div className="truncate font-medium text-slate-900 hover:text-primary">
                          {product.name}
                        </div>
                        <div className="truncate font-mono text-[11px] text-slate-400">
                          {product.slug}
                        </div>
                      </button>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="default">{product.categoryName}</Badge>
                    </TableCell>
                    <TableCell className="hidden text-right font-mono text-[13px] font-semibold text-slate-900 md:table-cell">
                      {priceLabel(product)}
                    </TableCell>
                    <TableCell className="hidden text-[12px] text-slate-500 lg:table-cell">
                      {product.variantsCount > 0
                        ? `${product.variantsCount} ${
                            product.variantsCount === 1 ? "wariant" : "warianty"
                          }`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.available}
                          disabled={availabilityMutation.isPending}
                          onCheckedChange={(next) =>
                            availabilityMutation.mutate({ id: product.id, available: next })
                          }
                          aria-label={`Przełącz dostępność ${product.name}`}
                        />
                        <span className="text-[12px] text-slate-600">
                          {product.available ? "Dostępny" : "Niedostępny"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/menu/products/${product.id}`)}
                          aria-label={`Edytuj ${product.name}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(product)}
                          disabled={deleteMutation.isPending}
                          aria-label={`Usuń ${product.name}`}
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
          <div className="flex flex-col gap-2 text-[13px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {hasActiveLocalFilter ? (
                <>
                  Pokazano <span className="font-medium">{filteredProducts.length}</span> z{" "}
                  <span className="font-medium">{allProducts.length}</span> na stronie
                  {" · "}
                </>
              ) : null}
              Strona <span className="font-medium">{currentPage + 1}</span> z{" "}
              <span className="font-medium">{Math.max(totalPages, 1)}</span>
              {" · "}
              <span className="font-medium">{totalElements}</span>{" "}
              {totalElements === 1 ? "produkt" : "produktów"} łącznie
            </span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isFirst || productsQuery.isFetching}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                aria-label="Poprzednia strona"
              >
                <ChevronLeft className="h-4 w-4" /> Poprzednia
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isLast || productsQuery.isFetching}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Następna strona"
              >
                Następna <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
