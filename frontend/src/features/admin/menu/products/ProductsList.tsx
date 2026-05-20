import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, GripVertical, Pencil, Search, Trash2 } from "lucide-react";
import {
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProducts,
  patchAdminProductAvailability,
  updateAdminProduct,
  type AdminProductDto,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { Switch } from "@/shared/components/ui/Switch";
import { useConfirm } from "@/shared/components/ui/ConfirmDialog";
import {
  MenuIconButton,
  MenuTableCard,
  MenuTableEmpty,
  MenuTableError,
  MenuTableLoading,
} from "../components/MenuTableParts";
import { useDragReorder } from "../lib/dragReorder";

// Bundle ref: frame-menu.jsx L85-181 (Produkty tab). Self-contained — edycja
// produktu to route nav (/admin/menu/products/:id), nie dialog. Drag handle
// static (M-042 dnd). Brak badge column — AdminProductDto nie ma badge field.

const ALL = "__all__";
const PAGE_SIZE = 20;
const GRID = "32px 56px 1fr 132px 92px 92px 104px 84px";

type AvailabilityFilter = "all" | "available" | "unavailable";

export function ProductsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  const [categoryFilter, setCategoryFilter] = useState<string>(ALL);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);

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
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zmienić dostępności"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Produkt usunięty");
    },
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się usunąć produktu"),
  });

  const onDelete = async (product: AdminProductDto) => {
    const ok = await confirm({
      title: "Usunąć produkt?",
      description: `Produkt „${product.name}” zostanie trwale usunięty. Operacja jest nieodwracalna.`,
      confirmLabel: "Usuń",
      variant: "destructive",
    });
    if (!ok) return;
    deleteMutation.mutate(product.id);
  };

  const priceLabel = (p: AdminProductDto) =>
    p.basePrice !== null ? formatPrice(p.basePrice, currency) : "—";

  const allProducts = productsQuery.data?.content ?? [];
  const totalElements = productsQuery.data?.totalElements ?? 0;
  const totalPages = productsQuery.data?.totalPages ?? 0;
  const currentPage = productsQuery.data?.number ?? 0;
  const isFirst = productsQuery.data?.first ?? true;
  const isLast = productsQuery.data?.last ?? true;

  // Backend /admin/products now sorts by category.displayOrder → displayOrder
  // → id (M-043, PHASE5_FINDINGS #27 resolved). Order comes from the server;
  // the reorder optimistic update rewrites `content` in the new order. This
  // memo only filters.
  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return allProducts.filter((p) => {
      if (availabilityFilter === "available" && !p.available) return false;
      if (availabilityFilter === "unavailable" && p.available) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.slug.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [allProducts, searchTerm, availabilityFilter]);

  const hasCategories = (categories ?? []).length > 0;

  // M-042 — reorder enabled only within a single clean category view (N44):
  // category filter set, no search, page 0. Availability filter must be "all"
  // too — otherwise `filtered` is a partial subset and reorder would corrupt
  // displayOrder of the hidden products. (Correctness extension of N44.)
  const reorderEnabled =
    categoryId !== undefined &&
    searchTerm.trim().length === 0 &&
    page === 0 &&
    availabilityFilter === "all";

  const productsKey = [
    "admin",
    "menu",
    "products",
    { categoryId, page, size: PAGE_SIZE },
  ] as const;

  const reorderMutation = useMutation({
    mutationFn: async (reordered: AdminProductDto[]) => {
      const changed = reordered
        .map((p, index) => ({ p, index }))
        .filter(({ p, index }) => p.displayOrder !== index);
      await Promise.all(
        changed.map(({ p, index }) =>
          updateAdminProduct(p.id, {
            version: p.version,
            categoryId: p.categoryId,
            name: p.name,
            description: p.description,
            basePrice: p.basePrice,
            imageUrl: p.imageUrl,
            displayOrder: index,
            available: p.available,
          }),
        ),
      );
    },
    onMutate: async (reordered) => {
      await queryClient.cancelQueries({ queryKey: productsKey });
      const prev =
        queryClient.getQueryData<typeof productsQuery.data>(productsKey);
      if (prev) {
        queryClient.setQueryData(productsKey, {
          ...prev,
          content: reordered.map((p, index) => ({ ...p, displayOrder: index })),
        });
      }
      return { prev };
    },
    onError: (err, _r, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(productsKey, ctx.prev);
      toast.error(
        extractProblem(err)?.detail ?? "Nie udało się zmienić kolejności",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
    },
  });

  const { getRowProps, dragIndex, overIndex } = useDragReorder(
    filtered,
    (reordered) => reorderMutation.mutate(reordered),
    reorderEnabled,
  );

  return (
    <div className="flex flex-col gap-4">
      {!hasCategories && (
        <div
          className="rounded-md px-4 py-3 text-[13px]"
          style={{
            border: "1px solid rgba(244, 162, 97, 0.35)",
            background: "rgba(244, 162, 97, 0.1)",
            color: "#7A4818",
          }}
        >
          Najpierw dodaj kategorię w zakładce <strong>Kategorie</strong> — produkty
          muszą być do niej przypisane.
        </div>
      )}

      {/* Filter row */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div
          className="relative flex h-[38px] flex-1 items-center"
          style={{
            background: "rgb(var(--color-bg-card))",
            border: "1px solid rgb(var(--color-border-card))",
            borderRadius: 8,
          }}
        >
          <Search
            size={16}
            strokeWidth={1.7}
            className="pointer-events-none absolute left-3"
            style={{ color: "rgb(var(--color-text-faint))" }}
            aria-hidden
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Szukaj produktu lub sluga…"
            className="h-full w-full bg-transparent pl-9 pr-3 text-[14px] outline-none"
            style={{ color: "rgb(var(--color-text-primary))" }}
          />
        </div>
        <NativeSelect
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          ariaLabel="Filtruj po kategorii"
        >
          <option value={ALL}>Wszystkie kategorie</option>
          {(categories ?? []).map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.name}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value as AvailabilityFilter)}
          ariaLabel="Filtruj po dostępności"
        >
          <option value="all">Dostępne i niedostępne</option>
          <option value="available">Tylko dostępne</option>
          <option value="unavailable">Tylko niedostępne</option>
        </NativeSelect>
      </div>

      {productsQuery.isLoading ? (
        <MenuTableLoading />
      ) : productsQuery.isError ? (
        <MenuTableError what="produktów" />
      ) : filtered.length === 0 ? (
        <MenuTableEmpty
          title="Brak produktów"
          description={
            searchTerm || availabilityFilter !== "all" || categoryId !== undefined
              ? "Zmień filtry albo wyczyść je, żeby zobaczyć wszystkie pozycje."
              : "Dodaj pierwszy produkt — przyciskiem „Nowy produkt” u góry."
          }
        />
      ) : (
        <>
          <MenuTableCard
            gridCols={GRID}
            minWidth={900}
            headers={["", "", "Produkt", "Kategoria", "Warianty", "Cena", "Aktywny", ""]}
          >
            {filtered.map((product, idx) => (
              <div
                key={product.id}
                {...getRowProps(idx)}
                className="grid items-center gap-3 px-4 py-3"
                style={{
                  gridTemplateColumns: GRID,
                  borderBottom:
                    idx < filtered.length - 1
                      ? "1px solid rgb(var(--color-border-subtle))"
                      : "none",
                  borderTop:
                    overIndex === idx && dragIndex !== null && dragIndex !== idx
                      ? "2px solid rgb(var(--color-primary))"
                      : undefined,
                  opacity:
                    dragIndex === idx ? 0.4 : product.available ? 1 : 0.55,
                }}
              >
                <span
                  className="inline-flex"
                  style={{
                    color: "rgb(var(--color-text-faint))",
                    cursor: reorderEnabled ? "grab" : "not-allowed",
                    opacity: reorderEnabled ? 1 : 0.5,
                  }}
                  aria-hidden
                  title={
                    reorderEnabled
                      ? "Przeciągnij, aby zmienić kolejność"
                      : "Wybierz kategorię, aby zmienić kolejność"
                  }
                >
                  <GripVertical size={16} strokeWidth={1.8} />
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/admin/menu/products/${product.id}`)}
                  className="grid h-11 w-11 place-items-center overflow-hidden rounded-lg"
                  style={{
                    background: "rgb(var(--color-bg-section))",
                    border: "none",
                    cursor: "pointer",
                  }}
                  aria-label={`Otwórz ${product.name}`}
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
                <button
                  type="button"
                  onClick={() => navigate(`/admin/menu/products/${product.id}`)}
                  className="min-w-0 text-left"
                  style={{ background: "transparent", border: "none", cursor: "pointer" }}
                >
                  <div
                    className="truncate text-[14px] font-semibold"
                    style={{ color: "rgb(var(--color-text-primary))" }}
                  >
                    {product.name}
                  </div>
                  <div
                    className="truncate text-[11px]"
                    style={{
                      fontFamily: "var(--font-mono)",
                      color: "rgb(var(--color-text-faint))",
                    }}
                  >
                    {product.slug}
                  </div>
                </button>
                <span
                  className="truncate text-[13px]"
                  style={{ color: "rgb(var(--color-text-body))" }}
                >
                  {product.categoryName}
                </span>
                <span
                  className="text-[13px]"
                  style={{ color: "rgb(var(--color-text-muted))" }}
                >
                  {product.variantsCount > 0
                    ? `${product.variantsCount} ${product.variantsCount === 1 ? "wariant" : "warianty"}`
                    : "—"}
                </span>
                <span
                  className="text-[13px] font-semibold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "rgb(var(--color-text-primary))",
                  }}
                >
                  {priceLabel(product)}
                </span>
                <span onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={product.available}
                    disabled={availabilityMutation.isPending}
                    onCheckedChange={(available) =>
                      availabilityMutation.mutate({ id: product.id, available })
                    }
                    aria-label={`Dostępność ${product.name}`}
                  />
                </span>
                <span className="flex justify-end gap-1">
                  <MenuIconButton
                    label={`Edytuj ${product.name}`}
                    onClick={() => navigate(`/admin/menu/products/${product.id}`)}
                  >
                    <Pencil size={14} strokeWidth={1.8} />
                  </MenuIconButton>
                  <MenuIconButton
                    label={`Usuń ${product.name}`}
                    onClick={() => onDelete(product)}
                    disabled={deleteMutation.isPending}
                    danger
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </MenuIconButton>
                </span>
              </div>
            ))}
          </MenuTableCard>

          {/* Pagination */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span
              className="text-[13px]"
              style={{ color: "rgb(var(--color-text-muted))" }}
            >
              Strona{" "}
              <strong style={{ color: "rgb(var(--color-text-body))" }}>
                {currentPage + 1}
              </strong>{" "}
              z {Math.max(totalPages, 1)} · {totalElements}{" "}
              {totalElements === 1 ? "produkt" : "produktów"} łącznie
            </span>
            <div className="flex gap-2">
              <PagerButton
                disabled={isFirst || productsQuery.isFetching}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft size={14} strokeWidth={2} aria-hidden /> Poprzednia
              </PagerButton>
              <PagerButton
                disabled={isLast || productsQuery.isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Następna <ChevronRight size={14} strokeWidth={2} aria-hidden />
              </PagerButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ───────── primitives ───────── */

function NativeSelect({
  value,
  onChange,
  ariaLabel,
  children,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      className="h-[38px] rounded-md px-3 text-[14px] sm:w-52"
      style={{
        border: "1px solid rgb(var(--color-border-card))",
        background: "rgb(var(--color-bg-card))",
        color: "rgb(var(--color-text-body))",
        fontFamily: "inherit",
        outline: "none",
      }}
    >
      {children}
    </select>
  );
}

function PagerButton({
  disabled,
  onClick,
  children,
}: {
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-9 items-center gap-1 rounded-md px-3 text-[13px] font-medium"
      style={{
        border: "1px solid rgb(var(--color-border-card))",
        background: "rgb(var(--color-bg-card))",
        color: disabled
          ? "rgb(var(--color-text-faint))"
          : "rgb(var(--color-text-body))",
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {children}
    </button>
  );
}
