import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Warianty</CardTitle>
          <CardDescription>
            Rozmiary/wersje produktu (np. 30 cm, 40 cm). Każdy wariant ma własną cenę.
          </CardDescription>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditingId(null);
            setAdding(true);
          }}
          disabled={adding}
        >
          <Plus className="h-4 w-4" /> Dodaj wariant
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? <div className="text-sm text-slate-500">Ładowanie…</div> : null}
        {isError ? (
          <div className="text-sm text-red-600">Nie udało się pobrać wariantów.</div>
        ) : null}

        <ul className="space-y-2">
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
              <li
                key={variant.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-4 py-3"
              >
                <div className="flex flex-1 items-center gap-4">
                  <span className="font-medium text-slate-900">{variant.name}</span>
                  <span className="font-semibold text-slate-700">
                    {formatPrice(variant.price, currency)}
                  </span>
                  <span className="text-xs text-slate-500">
                    kolejność: {variant.displayOrder}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setAdding(false);
                      setEditingId(variant.id);
                    }}
                    aria-label={`Edytuj wariant ${variant.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => {
                      if (!window.confirm(`Usunąć wariant "${variant.name}"?`)) return;
                      deleteMutation.mutate(variant.id);
                    }}
                    disabled={deleteMutation.isPending}
                    aria-label={`Usuń wariant ${variant.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
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
        </ul>

        {variants.length === 0 && !adding ? (
          <div className="rounded-md border border-dashed border-slate-200 py-8 text-center text-sm text-slate-500">
            Brak wariantów. Produkt jest sprzedawany w cenie bazowej.
          </div>
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
    <li className="rounded-md border border-primary bg-primary/5 p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_140px_120px_auto]"
        noValidate
      >
        <div>
          <Label htmlFor="v-name" className="text-xs">
            Nazwa
          </Label>
          <Input id="v-name" placeholder="np. 30 cm" {...register("name")} autoFocus />
          {errors.name ? (
            <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="v-price" className="text-xs">
            Cena
          </Label>
          <Input id="v-price" inputMode="decimal" placeholder="29.00" {...register("priceStr")} />
          {errors.priceStr ? (
            <p className="mt-1 text-xs text-red-600">{errors.priceStr.message as string}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="v-order" className="text-xs">
            Kolejność
          </Label>
          <Input
            id="v-order"
            type="number"
            min={0}
            {...register("displayOrder", { valueAsNumber: true })}
          />
          {errors.displayOrder ? (
            <p className="mt-1 text-xs text-red-600">
              {errors.displayOrder.message as string}
            </p>
          ) : null}
        </div>
        <div className="flex items-end gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            <Save className="h-4 w-4" />
            {pending ? "Zapisywanie…" : initial ? "Zapisz" : "Dodaj"}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onCancel} disabled={pending}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </li>
  );
}
