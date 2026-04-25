import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, Pencil, Plus, Save, Sparkles, Trash2, X } from "lucide-react";
import {
  createAdminAddon,
  deleteAdminAddon,
  fetchAdminAddonGroup,
  updateAdminAddon,
  type AdminAddonDto,
  type CreateAddonPayload,
  type UpdateAddonPayload,
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
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";

const schema = z.object({
  name: z.string().min(1, "Nazwa wymagana").max(80),
  priceStr: z
    .string()
    .min(1, "Cena wymagana")
    .regex(/^\d+([.,]\d{1,2})?$/, "Cena w formacie 12.50"),
  displayOrder: z.coerce.number().int().min(0, "Musi być ≥ 0"),
});

type FormValues = z.input<typeof schema>;

const empty: FormValues = { name: "", priceStr: "", displayOrder: 0 };

function toPayload(v: FormValues): CreateAddonPayload {
  return {
    name: v.name.trim(),
    price: v.priceStr.replace(",", "."),
    displayOrder: Number(v.displayOrder),
  };
}

export function AddonGroupEditPage() {
  const { id } = useParams<{ id: string }>();
  const groupId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: group, isLoading, isError } = useQuery({
    queryKey: ["admin", "menu", "addon-group", groupId],
    queryFn: () => fetchAdminAddonGroup(groupId),
    enabled: Number.isFinite(groupId),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "addon-group", groupId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "addon-groups"] });
    queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateAddonPayload) => createAdminAddon(groupId, payload),
    onSuccess: () => {
      invalidate();
      setAdding(false);
      toast.success("Dodatek dodany");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się dodać dodatku");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ addonId, payload }: { addonId: number; payload: UpdateAddonPayload }) =>
      updateAdminAddon(addonId, payload),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      toast.success("Dodatek zapisany");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się zapisać dodatku");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (addonId: number) => deleteAdminAddon(addonId),
    onSuccess: () => {
      invalidate();
      toast.success("Dodatek usunięty");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się usunąć dodatku");
    },
  });

  if (isLoading) return <div className="text-sm text-slate-500">Ładowanie grupy…</div>;
  if (isError || !group) {
    return (
      <div className="text-sm text-rose-600">
        Nie udało się pobrać grupy.{" "}
        <button onClick={() => navigate(-1)} className="underline">
          Wróć
        </button>
      </div>
    );
  }

  const addons = group.addons;
  const showEmptyState = addons.length === 0 && !adding;

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/menu?tab=addon-groups")}
          className="inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" /> Grupy dodatków
        </button>
        <h1 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900">
          {group.name}
        </h1>
        <p className="mt-1 text-[13px] text-slate-500">
          Zakres:{" "}
          <span className="font-mono text-slate-700">
            {group.minSelect}–{group.maxSelect}
          </span>
          {" · "}
          {group.required ? "Wymagana" : "Opcjonalna"}
          {" · "}
          Użyta w{" "}
          <span className="font-mono text-slate-700">{group.usedByProducts}</span> produktach
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[17px]">
            <Sparkles className="h-4 w-4 text-slate-400" /> Dodatki
          </CardTitle>
          <CardDescription>
            Pojedyncze opcje wybieralne w tej grupie (np. „Ser extra", „Pieczarki").
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {addons.map((addon) =>
            editingId === addon.id ? (
              <AddonRowEditor
                key={addon.id}
                initial={addon}
                pending={updateMutation.isPending}
                onCancel={() => setEditingId(null)}
                onSubmit={(values) =>
                  updateMutation.mutate({
                    addonId: addon.id,
                    payload: { ...toPayload(values), version: addon.version },
                  })
                }
              />
            ) : (
              <div
                key={addon.id}
                className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50/50 p-3"
              >
                <div className="flex flex-1 items-center gap-4">
                  <span className="text-[14px] font-medium text-slate-900">{addon.name}</span>
                  <span className="font-mono text-[13px] font-semibold text-slate-700">
                    {Number(addon.price) === 0
                      ? "gratis"
                      : `+ ${formatPrice(addon.price, currency)}`}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    kolejność: {addon.displayOrder}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAdding(false);
                      setEditingId(addon.id);
                    }}
                    aria-label={`Edytuj dodatek ${addon.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-700"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!window.confirm(`Usunąć dodatek "${addon.name}"?`)) return;
                      deleteMutation.mutate(addon.id);
                    }}
                    disabled={deleteMutation.isPending}
                    aria-label={`Usuń dodatek ${addon.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          )}

          {adding ? (
            <AddonRowEditor
              initial={null}
              pending={createMutation.isPending}
              onCancel={() => setAdding(false)}
              onSubmit={(values) => createMutation.mutate(toPayload(values))}
            />
          ) : null}

          {showEmptyState ? (
            <EmptyState
              icon={<Sparkles className="h-5 w-5" />}
              title="Brak dodatków w tej grupie"
              description="Dodaj pierwszą pozycję, żeby grupa miała sens podpięcia do produktu."
            />
          ) : null}

          {!adding ? (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setAdding(true);
              }}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-dashed border-slate-300 text-[13px] text-slate-600 transition-colors hover:border-primary hover:text-primary"
            >
              <Plus className="h-4 w-4" /> Dodaj dodatek
            </button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

interface EditorProps {
  initial: AdminAddonDto | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
}

function AddonRowEditor({ initial, pending, onCancel, onSubmit }: EditorProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: empty });

  useEffect(() => {
    if (initial) {
      reset({
        name: initial.name,
        priceStr: initial.price,
        displayOrder: initial.displayOrder,
      });
    } else {
      reset(empty);
    }
  }, [initial, reset]);

  return (
    <div className="rounded-md border border-primary bg-primary/5 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_120px_auto] sm:items-end"
        noValidate
      >
        <div>
          <Label htmlFor="a-name" className="text-[12px]">
            Nazwa
          </Label>
          <Input
            id="a-name"
            placeholder="np. Ser extra"
            error={!!errors.name}
            {...register("name")}
            autoFocus
          />
          {errors.name ? (
            <p className="mt-1 text-[12px] text-rose-600">{errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="a-price" className="text-[12px]">
            Cena
          </Label>
          <div className="relative">
            <Input
              id="a-price"
              inputMode="decimal"
              placeholder="0.00"
              className="pr-8 font-mono"
              error={!!errors.priceStr}
              {...register("priceStr")}
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-slate-500">
              zł
            </span>
          </div>
          {errors.priceStr ? (
            <p className="mt-1 text-[12px] text-rose-600">{errors.priceStr.message as string}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="a-order" className="text-[12px]">
            Kolejność
          </Label>
          <Input
            id="a-order"
            type="number"
            min={0}
            error={!!errors.displayOrder}
            {...register("displayOrder", { valueAsNumber: true })}
          />
          {errors.displayOrder ? (
            <p className="mt-1 text-[12px] text-rose-600">
              {errors.displayOrder.message as string}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? "Zapisywanie…" : initial ? "Zapisz" : "Dodaj"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={pending}
            aria-label="Anuluj"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
