import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Layers, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import {
  createAdminVariant,
  deleteAdminVariant,
  fetchAdminVariants,
  updateAdminVariant,
  type AdminVariantDto,
  type CreateVariantPayload,
  type UpdateVariantPayload,
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
  name: z.string().min(1, "Nazwa wariantu jest wymagana").max(60),
  priceStr: z
    .string()
    .min(1, "Cena jest wymagana")
    .regex(/^\d+([.,]\d{1,2})?$/, "Cena w formacie 12.50"),
  displayOrder: z.coerce.number().int().min(0, "Musi być ≥ 0"),
});

type FormValues = z.input<typeof schema>;

const empty: FormValues = { name: "", priceStr: "", displayOrder: 0 };

function toPayload(v: FormValues): CreateVariantPayload {
  return {
    name: v.name.trim(),
    price: v.priceStr.replace(",", "."),
    displayOrder: Number(v.displayOrder),
  };
}

interface Props {
  productId: number;
}

export function VariantsSection({ productId }: Props) {
  const queryClient = useQueryClient();
  const { data: settings } = usePublicSettings();
  const currency = settings?.currency ?? "PLN";

  const [editingId, setEditingId] = useState<number | null>(null);
  const [adding, setAdding] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "menu", "variants", productId],
    queryFn: () => fetchAdminVariants(productId),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateVariantPayload) => createAdminVariant(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "variants", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      setAdding(false);
      toast.success("Wariant dodany");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się dodać wariantu");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVariantPayload }) =>
      updateAdminVariant(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "variants", productId] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      setEditingId(null);
      toast.success("Wariant zapisany");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się zapisać wariantu");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "variants", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "product", productId] });
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Wariant usunięty");
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się usunąć wariantu");
    },
  });

  const variants = data ?? [];
  const showEmptyState = !isLoading && !isError && variants.length === 0 && !adding;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[17px]">
          <Layers className="h-4 w-4 text-slate-400" /> Warianty rozmiaru
        </CardTitle>
        <CardDescription>
          Rozmiary lub wersje produktu (np. 30 cm, 40 cm). Każdy wariant ma własną cenę,
          która zastępuje cenę bazową.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="text-[13px] text-slate-500">Ładowanie…</div>
        ) : null}
        {isError ? (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-3 text-[13px] text-rose-700">
            Nie udało się pobrać wariantów.
          </div>
        ) : null}

        {variants.map((variant) =>
          editingId === variant.id ? (
            <VariantRowEditor
              key={variant.id}
              initial={variant}
              pending={updateMutation.isPending}
              onCancel={() => setEditingId(null)}
              onSubmit={(values) =>
                updateMutation.mutate({
                  id: variant.id,
                  payload: { ...toPayload(values), version: variant.version },
                })
              }
            />
          ) : (
            <div
              key={variant.id}
              className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50/50 p-3"
            >
              <div className="flex flex-1 items-center gap-4">
                <span className="text-[14px] font-medium text-slate-900">{variant.name}</span>
                <span className="font-mono text-[13px] font-semibold text-slate-700">
                  {formatPrice(variant.price, currency)}
                </span>
                <span className="text-[11px] text-slate-500">
                  kolejność: {variant.displayOrder}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setAdding(false);
                    setEditingId(variant.id);
                  }}
                  aria-label={`Edytuj wariant ${variant.name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-slate-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm(`Usunąć wariant "${variant.name}"?`)) return;
                    deleteMutation.mutate(variant.id);
                  }}
                  disabled={deleteMutation.isPending}
                  aria-label={`Usuń wariant ${variant.name}`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        )}

        {adding ? (
          <VariantRowEditor
            initial={null}
            pending={createMutation.isPending}
            onCancel={() => setAdding(false)}
            onSubmit={(values) => createMutation.mutate(toPayload(values))}
          />
        ) : null}

        {showEmptyState ? (
          <EmptyState
            icon={<Layers className="h-5 w-5" />}
            title="Brak wariantów"
            description="Produkt jest sprzedawany w cenie bazowej. Dodaj rozmiary, jeśli są różne ceny."
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
            <Plus className="h-4 w-4" /> Dodaj wariant
          </button>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface EditorProps {
  initial: AdminVariantDto | null;
  pending: boolean;
  onCancel: () => void;
  onSubmit: (values: FormValues) => void;
}

function VariantRowEditor({ initial, pending, onCancel, onSubmit }: EditorProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: empty,
  });

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
          <Label htmlFor="v-name" className="text-[12px]">
            Nazwa
          </Label>
          <Input
            id="v-name"
            placeholder="np. 30 cm"
            error={!!errors.name}
            {...register("name")}
            autoFocus
          />
          {errors.name ? (
            <p className="mt-1 text-[12px] text-rose-600">{errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="v-price" className="text-[12px]">
            Cena
          </Label>
          <div className="relative">
            <Input
              id="v-price"
              inputMode="decimal"
              placeholder="29.00"
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
          <Label htmlFor="v-order" className="text-[12px]">
            Kolejność
          </Label>
          <Input
            id="v-order"
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
