import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import {
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
  type AdminCategoryDto,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import { Switch } from "@/shared/components/ui/Switch";
import {
  MenuIconButton,
  MenuTableCard,
  MenuTableEmpty,
  MenuTableError,
  MenuTableLoading,
} from "../components/MenuTableParts";
import { useDragReorder } from "../lib/dragReorder";

const CATEGORIES_KEY = ["admin", "menu", "categories"] as const;

// Bundle ref: frame-menu.jsx L183-208 (Kategorie tab). Pure list — add/edit
// dialog owned przez MenuOverviewPage (N36). Drag handle static (M-042 dnd).

const GRID = "32px 1fr 120px 96px 84px";

interface CategoriesListProps {
  onEdit: (category: AdminCategoryDto) => void;
}

export function CategoriesList({ onEdit }: CategoriesListProps) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "menu", "categories"],
    queryFn: fetchAdminCategories,
  });

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
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się usunąć kategorii"),
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
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zmienić widoczności"),
  });

  const onDelete = (cat: AdminCategoryDto) => {
    if (cat.productsCount > 0) {
      toast.error(
        `Kategoria ma ${cat.productsCount} produktów. Przenieś lub usuń produkty.`,
      );
      return;
    }
    if (!window.confirm(`Usunąć kategorię „${cat.name}”? Tej operacji nie cofniesz.`))
      return;
    deleteMutation.mutate(cat.id);
  };

  // M-042 — reorder: optimistic + PUT only rows whose index changed.
  const reorderMutation = useMutation({
    mutationFn: async (reordered: AdminCategoryDto[]) => {
      const changed = reordered
        .map((cat, index) => ({ cat, index }))
        .filter(({ cat, index }) => cat.displayOrder !== index);
      await Promise.all(
        changed.map(({ cat, index }) =>
          updateAdminCategory(cat.id, {
            version: cat.version,
            name: cat.name,
            description: cat.description,
            displayOrder: index,
            active: cat.active,
          }),
        ),
      );
    },
    onMutate: async (reordered) => {
      await queryClient.cancelQueries({ queryKey: CATEGORIES_KEY });
      const prev = queryClient.getQueryData<AdminCategoryDto[]>(CATEGORIES_KEY);
      queryClient.setQueryData(
        CATEGORIES_KEY,
        reordered.map((cat, index) => ({ ...cat, displayOrder: index })),
      );
      return { prev };
    },
    onError: (err, _reordered, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(CATEGORIES_KEY, ctx.prev);
      toast.error(
        extractProblem(err)?.detail ?? "Nie udało się zmienić kolejności",
      );
    },
    onSettled: () => invalidate(),
  });

  const { getRowProps, dragIndex, overIndex } = useDragReorder(
    data ?? [],
    (reordered) => reorderMutation.mutate(reordered),
  );

  if (isLoading) return <MenuTableLoading />;
  if (isError) return <MenuTableError what="kategorii" />;
  if (!data || data.length === 0) {
    return (
      <MenuTableEmpty
        title="Brak kategorii"
        description="Dodaj pierwszą kategorię — przyciskiem „Nowa kategoria” u góry."
      />
    );
  }

  return (
    <MenuTableCard
      gridCols={GRID}
      minWidth={560}
      headers={["", "Nazwa", "Produkty", "Widoczna", ""]}
    >
      {data.map((cat, idx) => (
        <div
          key={cat.id}
          {...getRowProps(idx)}
          className="grid items-center gap-3 px-4 py-3"
          style={{
            gridTemplateColumns: GRID,
            borderBottom:
              idx < data.length - 1
                ? "1px solid rgb(var(--color-border-subtle))"
                : "none",
            borderTop:
              overIndex === idx && dragIndex !== null && dragIndex !== idx
                ? "2px solid rgb(var(--color-primary))"
                : undefined,
            opacity: dragIndex === idx ? 0.4 : 1,
          }}
        >
          <span
            className="inline-flex"
            style={{ color: "rgb(var(--color-text-faint))", cursor: "grab" }}
            aria-hidden
            title="Przeciągnij, aby zmienić kolejność"
          >
            <GripVertical size={16} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <div
              className="truncate text-[14px] font-semibold"
              style={{ color: "rgb(var(--color-text-primary))" }}
            >
              {cat.name}
            </div>
            <div
              className="truncate text-[11px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "rgb(var(--color-text-faint))",
              }}
            >
              {cat.slug}
            </div>
          </div>
          <span
            className="text-[13px]"
            style={{ color: "rgb(var(--color-text-muted))" }}
          >
            {cat.productsCount}{" "}
            {cat.productsCount === 1 ? "produkt" : "produktów"}
          </span>
          <span>
            <Switch
              checked={cat.active}
              disabled={visibilityMutation.isPending}
              onCheckedChange={(next) => visibilityMutation.mutate({ cat, next })}
              aria-label={`Widoczność ${cat.name}`}
            />
          </span>
          <span className="flex justify-end gap-1">
            <MenuIconButton label={`Edytuj ${cat.name}`} onClick={() => onEdit(cat)}>
              <Pencil size={14} strokeWidth={1.8} />
            </MenuIconButton>
            <MenuIconButton
              label={`Usuń ${cat.name}`}
              onClick={() => onDelete(cat)}
              danger
            >
              <Trash2 size={14} strokeWidth={1.8} />
            </MenuIconButton>
          </span>
        </div>
      ))}
    </MenuTableCard>
  );
}
