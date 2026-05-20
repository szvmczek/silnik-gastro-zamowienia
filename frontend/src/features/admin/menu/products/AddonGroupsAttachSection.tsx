import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  attachAddonGroupToProduct,
  detachAddonGroupFromProduct,
  fetchAdminAddonGroups,
  fetchProductAddonGroupLinks,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";

// Bundle ref: frame-product-edit.jsx L172-209 (Grupy dodatków).
// Meta line ("N dodatków · wymagane/opcjonalne · wielokrotny/jeden wybór")
// joined z fetchAdminAddonGroups (link DTO sam nie ma count/required/maxSelect).

interface Props {
  productId: number;
}

export function AddonGroupsAttachSection({ productId }: Props) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const linksQuery = useQuery({
    queryKey: ["admin", "menu", "product-addon-groups", productId],
    queryFn: () => fetchProductAddonGroupLinks(productId),
  });
  const groupsQuery = useQuery({
    queryKey: ["admin", "menu", "addon-groups"],
    queryFn: fetchAdminAddonGroups,
  });

  const [attachOpen, setAttachOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["admin", "menu", "product-addon-groups", productId],
    });
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "addon-groups"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "product", productId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
    queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
  };

  const links = linksQuery.data ?? [];
  const allGroups = groupsQuery.data ?? [];
  const attachedIds = new Set(links.map((l) => l.addonGroupId));
  const availableGroups = useMemo(
    () => allGroups.filter((g) => !attachedIds.has(g.id)),
    [allGroups, attachedIds],
  );

  const attachMutation = useMutation({
    mutationFn: (addonGroupId: number) =>
      attachAddonGroupToProduct(productId, {
        addonGroupId,
        displayOrder: links.length,
      }),
    onSuccess: () => {
      invalidate();
      setSelectedGroupId("");
      setAttachOpen(false);
      toast.success("Grupa podpięta");
    },
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się podpiąć grupy"),
  });

  const detachMutation = useMutation({
    mutationFn: (addonGroupId: number) =>
      detachAddonGroupFromProduct(productId, addonGroupId),
    onSuccess: () => {
      invalidate();
      toast.success("Grupa odpięta");
    },
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się odpiąć grupy"),
  });

  const meta = (addonGroupId: number): string => {
    const g = allGroups.find((x) => x.id === addonGroupId);
    if (!g) return "";
    return [
      `${g.addons.length} ${g.addons.length === 1 ? "dodatek" : "dodatków"}`,
      g.required ? "wymagane" : "opcjonalne",
      g.maxSelect > 1 ? "wielokrotny wybór" : "jeden wybór",
    ].join(" · ");
  };

  const onAttach = () => {
    if (!selectedGroupId) {
      toast.error("Wybierz grupę z listy");
      return;
    }
    attachMutation.mutate(Number(selectedGroupId));
  };

  return (
    <section
      className="rounded-xl p-5"
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
      }}
    >
      <div className="mb-3.5 flex items-baseline justify-between gap-4">
        <h3
          className="m-0 text-[15px] font-bold"
          style={{ color: "rgb(var(--color-text-primary))" }}
        >
          Grupy dodatków
        </h3>
        {!attachOpen && (
          <button
            type="button"
            onClick={() => setAttachOpen(true)}
            disabled={availableGroups.length === 0}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-md px-3 text-[12px] font-semibold"
            style={{
              border: "1px solid rgb(var(--color-border-card))",
              background: "rgb(var(--color-bg-card))",
              color: "rgb(var(--color-text-body))",
              cursor: availableGroups.length === 0 ? "not-allowed" : "pointer",
              opacity: availableGroups.length === 0 ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            <Plus size={13} strokeWidth={2.4} aria-hidden /> Przypisz grupę
          </button>
        )}
      </div>

      {linksQuery.isLoading && (
        <div className="text-[13px]" style={{ color: "rgb(var(--color-text-muted))" }}>
          Ładowanie…
        </div>
      )}

      {/* Attach form */}
      {attachOpen && (
        <div
          className="mb-3 flex flex-col gap-2.5 rounded-lg p-3 sm:flex-row sm:items-center"
          style={{
            border: "1px solid rgb(var(--color-primary))",
            background: "rgb(var(--color-primary-tint))",
          }}
        >
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            aria-label="Grupa do podpięcia"
            className="h-9 flex-1 rounded-md px-3 text-[14px]"
            style={{
              border: "1px solid rgb(var(--color-border-card))",
              background: "rgb(var(--color-bg-card))",
              color: "rgb(var(--color-text-primary))",
              fontFamily: "inherit",
              outline: "none",
            }}
          >
            <option value="">Wybierz grupę…</option>
            {availableGroups.map((g) => (
              <option key={g.id} value={String(g.id)}>
                {g.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onAttach}
              disabled={attachMutation.isPending || !selectedGroupId}
              className="h-9 rounded-md px-3.5 text-[13px] font-semibold text-white"
              style={{
                border: "none",
                background:
                  attachMutation.isPending || !selectedGroupId
                    ? "#D4D0C2"
                    : "rgb(var(--color-primary))",
                cursor:
                  attachMutation.isPending || !selectedGroupId
                    ? "not-allowed"
                    : "pointer",
                fontFamily: "inherit",
              }}
            >
              {attachMutation.isPending ? "Podpinam…" : "Podepnij"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAttachOpen(false);
                setSelectedGroupId("");
              }}
              className="h-9 rounded-md px-3 text-[13px] font-medium"
              style={{
                border: "1px solid rgb(var(--color-border-card))",
                background: "rgb(var(--color-bg-card))",
                color: "rgb(var(--color-text-body))",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}

      {/* Attached groups list */}
      <div className="flex flex-col gap-2">
        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-3"
            style={{ background: "rgb(var(--color-bg-section))" }}
          >
            <div className="min-w-0">
              <div
                className="truncate text-[14px] font-semibold"
                style={{ color: "rgb(var(--color-text-primary))" }}
              >
                {link.addonGroupName}
              </div>
              <div
                className="mt-0.5 truncate text-[12px]"
                style={{ color: "rgb(var(--color-text-muted))" }}
              >
                {meta(link.addonGroupId)}
              </div>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => navigate(`/admin/menu/addon-groups/${link.addonGroupId}`)}
                className="h-[30px] rounded-md px-3 text-[12px] font-medium"
                style={{
                  border: "1px solid rgb(var(--color-border-card))",
                  background: "rgb(var(--color-bg-card))",
                  color: "rgb(var(--color-text-body))",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Edytuj
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm(`Odpiąć grupę „${link.addonGroupName}”?`)) return;
                  detachMutation.mutate(link.addonGroupId);
                }}
                disabled={detachMutation.isPending}
                aria-label={`Odepnij grupę ${link.addonGroupName}`}
                className="grid h-[30px] w-[30px] place-items-center rounded-md"
                style={{
                  border: "none",
                  background: "transparent",
                  color: "rgb(var(--color-text-muted))",
                  cursor: detachMutation.isPending ? "not-allowed" : "pointer",
                }}
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {links.length === 0 && !linksQuery.isLoading && !attachOpen && (
        <p
          className="py-3 text-[13px]"
          style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.55 }}
        >
          Brak podpiętych grup. Przypisz grupę, żeby udostępnić jej dodatki przy
          zamawianiu tego produktu.
        </p>
      )}
    </section>
  );
}
