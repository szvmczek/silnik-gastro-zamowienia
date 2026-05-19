import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import {
  fetchAdminAddonGroups,
  fetchAdminCategories,
  fetchAdminProducts,
  type AdminAddonGroupDto,
  type AdminCategoryDto,
} from "@/shared/api/menuApi";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { CategoriesList } from "./categories/CategoriesList";
import { CategoryFormDialog } from "./categories/CategoryFormDialog";
import { ProductsList } from "./products/ProductsList";
import { AddonGroupsList } from "./addon-groups/AddonGroupsList";
import { AddonGroupFormDialog } from "./addon-groups/AddonGroupFormDialog";

// Bundle ref: docs/design/v2-stage3/frame-menu.jsx.
// N35 — 3 tabs (Kategorie / Produkty / Grupy dodatków); bundle 4-ty "Dodatki"
// dropped per AD-Δ19. Topbar action context-aware per active tab (N36).

type TabKey = "categories" | "products" | "groups";
const DEFAULT_TAB: TabKey = "products";

const TAB_LABELS: Record<TabKey, string> = {
  categories: "Kategorie",
  products: "Produkty",
  groups: "Grupy dodatków",
};

export function MenuOverviewPage() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const requested = params.get("tab") as TabKey | null;
  const tab: TabKey =
    requested === "categories" || requested === "products" || requested === "groups"
      ? requested
      : DEFAULT_TAB;

  const [catDialog, setCatDialog] = useState<{
    open: boolean;
    editing: AdminCategoryDto | null;
  }>({ open: false, editing: null });
  const [groupDialog, setGroupDialog] = useState<{
    open: boolean;
    editing: AdminAddonGroupDto | null;
  }>({ open: false, editing: null });

  const categoriesQuery = useQuery({
    queryKey: ["admin", "menu", "categories"],
    queryFn: fetchAdminCategories,
  });
  const groupsQuery = useQuery({
    queryKey: ["admin", "menu", "addon-groups"],
    queryFn: fetchAdminAddonGroups,
  });
  const productCountQuery = useQuery({
    queryKey: ["admin", "menu", "products", "count"],
    queryFn: () => fetchAdminProducts({ page: 0, size: 1 }),
  });

  const catCount = categoriesQuery.data?.length ?? 0;
  const groupCount = groupsQuery.data?.length ?? 0;
  const productCount = productCountQuery.data?.totalElements ?? 0;

  const tabCounts: Record<TabKey, number> = {
    categories: catCount,
    products: productCount,
    groups: groupCount,
  };

  const onChangeTab = (next: TabKey) => {
    if (next === DEFAULT_TAB) params.delete("tab");
    else params.set("tab", next);
    setParams(params, { replace: true });
  };

  const topbarAction = () => {
    if (tab === "products") navigate("/admin/menu/products/new");
    else if (tab === "categories") setCatDialog({ open: true, editing: null });
    else setGroupDialog({ open: true, editing: null });
  };

  const actionLabel =
    tab === "products"
      ? "Nowy produkt"
      : tab === "categories"
        ? "Nowa kategoria"
        : "Nowa grupa";

  return (
    <>
      <AdminTopbar
        title="Menu"
        metadata={`${productCount} ${productCount === 1 ? "produkt" : "produktów"} · ${catCount} ${catCount === 1 ? "kategoria" : "kategorii"}`}
        actions={
          <button
            type="button"
            onClick={topbarAction}
            className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-semibold text-white"
            style={{
              background: "rgb(var(--color-primary))",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Plus size={13} strokeWidth={2.4} aria-hidden /> {actionLabel}
          </button>
        }
      />

      <div className="p-4 md:p-8">
        {/* Tabs */}
        <div
          className="mb-5 flex gap-6"
          style={{ borderBottom: "1px solid rgb(var(--color-border-subtle))" }}
        >
          {(Object.keys(TAB_LABELS) as TabKey[]).map((key) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChangeTab(key)}
                className="flex items-center gap-2 py-3 text-[14px] font-semibold"
                style={{
                  border: "none",
                  background: "transparent",
                  borderBottom: active
                    ? "2px solid rgb(var(--color-primary))"
                    : "2px solid transparent",
                  marginBottom: -1,
                  color: active
                    ? "rgb(var(--color-primary))"
                    : "rgb(var(--color-text-muted))",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {TAB_LABELS[key]}
                <span
                  className="rounded-full px-[7px] py-px text-[11px] font-bold"
                  style={{
                    background: active
                      ? "rgb(var(--color-primary-tint))"
                      : "rgb(var(--color-bg-section))",
                    color: active
                      ? "rgb(var(--color-primary))"
                      : "rgb(var(--color-text-muted))",
                  }}
                >
                  {tabCounts[key]}
                </span>
              </button>
            );
          })}
        </div>

        {tab === "categories" && (
          <CategoriesList
            onEdit={(cat) => setCatDialog({ open: true, editing: cat })}
          />
        )}
        {tab === "products" && <ProductsList />}
        {tab === "groups" && (
          <AddonGroupsList
            onEdit={(group) => setGroupDialog({ open: true, editing: group })}
          />
        )}
      </div>

      <CategoryFormDialog
        open={catDialog.open}
        onOpenChange={(open) => setCatDialog((s) => ({ ...s, open }))}
        category={catDialog.editing}
      />
      <AddonGroupFormDialog
        open={groupDialog.open}
        onOpenChange={(open) => setGroupDialog((s) => ({ ...s, open }))}
        group={groupDialog.editing}
      />
    </>
  );
}
