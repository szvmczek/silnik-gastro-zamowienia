import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import {
  attachAddonGroupToProduct,
  detachAddonGroupFromProduct,
  fetchAdminAddonGroups,
  fetchProductAddonGroupLinks,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/Select";

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

  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [displayOrder, setDisplayOrder] = useState<number>(0);

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["admin", "menu", "product-addon-groups", productId],
    });
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "addon-groups"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "product", productId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
    queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
  };

  const attachMutation = useMutation({
    mutationFn: ({ addonGroupId, order }: { addonGroupId: number; order: number }) =>
      attachAddonGroupToProduct(productId, { addonGroupId, displayOrder: order }),
    onSuccess: () => {
      invalidate();
      setSelectedGroupId("");
      setDisplayOrder(0);
      toast.success("Grupa podpięta");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się podpiąć grupy");
    },
  });

  const detachMutation = useMutation({
    mutationFn: (addonGroupId: number) => detachAddonGroupFromProduct(productId, addonGroupId),
    onSuccess: () => {
      invalidate();
      toast.success("Grupa odpięta");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się odpiąć grupy");
    },
  });

  const links = linksQuery.data ?? [];
  const allGroups = groupsQuery.data ?? [];
  const attachedIds = new Set(links.map((l) => l.addonGroupId));
  const availableGroups = useMemo(
    () => allGroups.filter((g) => !attachedIds.has(g.id)),
    [allGroups, attachedIds]
  );

  const onAttach = () => {
    if (!selectedGroupId) {
      toast.error("Wybierz grupę z listy");
      return;
    }
    attachMutation.mutate({
      addonGroupId: Number(selectedGroupId),
      order: Number(displayOrder) || 0,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grupy dodatków</CardTitle>
        <CardDescription>
          Podepnij do tego produktu istniejące grupy (stwórz je w zakładce „Grupy dodatków”).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3"
            >
              <div className="flex flex-1 items-center gap-3">
                <span className="font-medium text-slate-900">{link.addonGroupName}</span>
                <span className="text-xs text-slate-500">
                  kolejność: {link.displayOrder}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/admin/menu/addon-groups/${link.addonGroupId}`)}
                  aria-label={`Otwórz grupę ${link.addonGroupName}`}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    if (!window.confirm(`Odpiąć grupę "${link.addonGroupName}"?`)) return;
                    detachMutation.mutate(link.addonGroupId);
                  }}
                  disabled={detachMutation.isPending}
                  aria-label={`Odepnij grupę ${link.addonGroupName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>

        {links.length === 0 ? (
          <div className="rounded-md border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
            Brak podpiętych grup dodatków.
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 border-t border-slate-200 pt-4 sm:grid-cols-[1fr_120px_auto]">
          <div>
            <Label>Grupa do podpięcia</Label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    availableGroups.length === 0
                      ? "Brak wolnych grup"
                      : "Wybierz grupę…"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {availableGroups.map((group) => (
                  <SelectItem key={group.id} value={String(group.id)}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pag-order">Kolejność</Label>
            <Input
              id="pag-order"
              type="number"
              min={0}
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <Button
              type="button"
              onClick={onAttach}
              disabled={
                attachMutation.isPending || !selectedGroupId || availableGroups.length === 0
              }
            >
              <Plus className="h-4 w-4" />
              {attachMutation.isPending ? "Podpinam…" : "Podepnij"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
