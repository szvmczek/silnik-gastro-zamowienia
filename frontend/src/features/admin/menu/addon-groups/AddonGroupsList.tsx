import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  deleteAdminAddonGroup,
  fetchAdminAddonGroups,
  type AdminAddonGroupDto,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import {
  MenuIconButton,
  MenuTableCard,
  MenuTableEmpty,
  MenuTableError,
  MenuTableLoading,
} from "../components/MenuTableParts";

// Bundle ref: frame-menu.jsx L210-215 (Grupy tab — bundle to placeholder
// count; realny table reuses Phase 2 addon-group CRUD). Pure list — dialog
// owned przez MenuOverviewPage (N36).

const GRID = "1fr 96px 84px 104px 88px 84px";

interface AddonGroupsListProps {
  onEdit: (group: AdminAddonGroupDto) => void;
}

export function AddonGroupsList({ onEdit }: AddonGroupsListProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "menu", "addon-groups"],
    queryFn: fetchAdminAddonGroups,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminAddonGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "addon-groups"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Grupa usunięta");
    },
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się usunąć grupy"),
  });

  const onDelete = (group: AdminAddonGroupDto) => {
    if (group.usedByProducts > 0) {
      toast.error(
        `Grupa jest przypięta do ${group.usedByProducts} produkt(ów). Odepnij ją najpierw.`,
      );
      return;
    }
    if (!window.confirm(`Usunąć grupę „${group.name}”? Zostaną też usunięte jej dodatki.`))
      return;
    deleteMutation.mutate(group.id);
  };

  if (isLoading) return <MenuTableLoading />;
  if (isError) return <MenuTableError what="grup dodatków" />;
  const groups = data ?? [];
  if (groups.length === 0) {
    return (
      <MenuTableEmpty
        title="Brak grup dodatków"
        description="Dodaj pierwszą grupę — przyciskiem „Nowa grupa” u góry. Grupy podpinasz do produktów."
      />
    );
  }

  return (
    <MenuTableCard
      gridCols={GRID}
      minWidth={760}
      headers={["Nazwa", "Zakres", "Dodatki", "Wymagana", "Produkty", ""]}
    >
      {groups.map((group, idx) => (
        <div
          key={group.id}
          className="grid items-center gap-3 px-4 py-3"
          style={{
            gridTemplateColumns: GRID,
            borderBottom:
              idx < groups.length - 1
                ? "1px solid rgb(var(--color-border-subtle))"
                : "none",
          }}
        >
          <button
            type="button"
            onClick={() => navigate(`/admin/menu/addon-groups/${group.id}`)}
            className="min-w-0 truncate text-left text-[14px] font-semibold"
            style={{
              background: "transparent",
              border: "none",
              color: "rgb(var(--color-text-primary))",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {group.name}
          </button>
          <span
            className="text-[13px]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {group.minSelect}–{group.maxSelect}
          </span>
          <span
            className="text-[13px]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {group.addons.length}
          </span>
          <span>
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
              style={
                group.required
                  ? {
                      background: "rgb(var(--status-new-tint))",
                      color: "#92400E",
                    }
                  : {
                      background: "rgb(var(--color-bg-section))",
                      color: "rgb(var(--color-text-muted))",
                    }
              }
            >
              {group.required ? "Tak" : "Nie"}
            </span>
          </span>
          <span
            className="text-[13px]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "rgb(var(--color-text-muted))",
            }}
          >
            {group.usedByProducts}
          </span>
          <span className="flex justify-end gap-1">
            <MenuIconButton
              label={`Edytuj grupę ${group.name}`}
              onClick={() => onEdit(group)}
            >
              <Pencil size={14} strokeWidth={1.8} />
            </MenuIconButton>
            <MenuIconButton
              label={`Usuń grupę ${group.name}`}
              onClick={() => onDelete(group)}
              disabled={deleteMutation.isPending}
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
