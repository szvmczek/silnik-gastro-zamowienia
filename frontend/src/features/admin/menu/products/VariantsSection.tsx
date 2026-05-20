import { useEffect } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
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
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { formatPrice } from "@/features/public/menu/lib/formatPrice";
import { MenuIconButton } from "../components/MenuTableParts";
import { useDragReorder } from "../lib/dragReorder";

// Bundle ref: frame-product-edit.jsx L106-170 (Warianty rozmiaru).
// SKU + Aktywny kolumny z bundle dropped — AdminVariantDto nie ma tych pól
// (tylko id/version/productId/name/price/displayOrder). Patrz AD-Δ28.

const GRID = "30px 1fr 128px 104px 72px";

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

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "variants", productId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "product", productId] });
    queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
    queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateVariantPayload) => createAdminVariant(productId, payload),
    onSuccess: () => {
      invalidate();
      setAdding(false);
      toast.success("Wariant dodany");
    },
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się dodać wariantu"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateVariantPayload }) =>
      updateAdminVariant(id, payload),
    onSuccess: () => {
      invalidate();
      setEditingId(null);
      toast.success("Wariant zapisany");
    },
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zapisać wariantu"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminVariant(id),
    onSuccess: () => {
      invalidate();
      toast.success("Wariant usunięty");
    },
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się usunąć wariantu"),
  });

  const variants = data ?? [];
  const variantsKey = ["admin", "menu", "variants", productId] as const;

  // M-042 — reorder. Disabled while a row editor / add form is open.
  const reorderMutation = useMutation({
    mutationFn: async (reordered: AdminVariantDto[]) => {
      const changed = reordered
        .map((v, index) => ({ v, index }))
        .filter(({ v, index }) => v.displayOrder !== index);
      await Promise.all(
        changed.map(({ v, index }) =>
          updateAdminVariant(v.id, {
            version: v.version,
            name: v.name,
            price: v.price,
            displayOrder: index,
          }),
        ),
      );
    },
    onMutate: async (reordered) => {
      await queryClient.cancelQueries({ queryKey: variantsKey });
      const prev = queryClient.getQueryData<AdminVariantDto[]>(variantsKey);
      queryClient.setQueryData(
        variantsKey,
        reordered.map((v, index) => ({ ...v, displayOrder: index })),
      );
      return { prev };
    },
    onError: (err, _r, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(variantsKey, ctx.prev);
      toast.error(
        extractProblem(err)?.detail ?? "Nie udało się zmienić kolejności",
      );
    },
    onSettled: () => invalidate(),
  });

  const { getRowProps, dragIndex, overIndex } = useDragReorder(
    variants,
    (reordered) => reorderMutation.mutate(reordered),
    editingId === null && !adding,
  );

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
          Warianty rozmiaru
        </h3>
        {!adding && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setAdding(true);
            }}
            className="inline-flex h-[30px] items-center gap-1.5 rounded-md px-3 text-[12px] font-semibold"
            style={{
              border: "1px solid rgb(var(--color-border-card))",
              background: "rgb(var(--color-bg-card))",
              color: "rgb(var(--color-text-body))",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Plus size={13} strokeWidth={2.4} aria-hidden /> Dodaj wariant
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-[13px]" style={{ color: "rgb(var(--color-text-muted))" }}>
          Ładowanie…
        </div>
      )}
      {isError && (
        <div
          className="rounded-md p-3 text-[13px]"
          style={{
            border: "1px solid rgb(var(--status-cancelled) / 0.3)",
            background: "rgb(var(--status-cancelled-tint))",
            color: "rgb(var(--status-cancelled))",
          }}
        >
          Nie udało się pobrać wariantów.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {(variants.length > 0 || adding) && (
            <div
              className="grid gap-2.5 px-1 py-2 text-[11px] font-bold uppercase"
              style={{
                gridTemplateColumns: GRID,
                borderBottom: "1px solid rgb(var(--color-border-subtle))",
                color: "rgb(var(--color-text-muted))",
                letterSpacing: "0.04em",
              }}
            >
              <span />
              <span>Nazwa</span>
              <span>Cena</span>
              <span>Kolejność</span>
              <span />
            </div>
          )}

          {variants.map((variant, idx) =>
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
                {...getRowProps(idx)}
                className="grid items-center gap-2.5 px-1 py-2.5"
                style={{
                  gridTemplateColumns: GRID,
                  borderBottom:
                    idx < variants.length - 1 || adding
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
                  style={{
                    color: "rgb(var(--color-text-faint))",
                    cursor:
                      editingId === null && !adding ? "grab" : "not-allowed",
                  }}
                  aria-hidden
                  title="Przeciągnij, aby zmienić kolejność"
                >
                  <GripVertical size={15} strokeWidth={1.8} />
                </span>
                <span
                  className="truncate text-[14px] font-semibold"
                  style={{ color: "rgb(var(--color-text-primary))" }}
                >
                  {variant.name}
                </span>
                <span
                  className="text-[13px] font-semibold"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "rgb(var(--color-text-primary))",
                  }}
                >
                  {formatPrice(variant.price, currency)}
                </span>
                <span
                  className="text-[13px]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: "rgb(var(--color-text-muted))",
                  }}
                >
                  {variant.displayOrder}
                </span>
                <span className="flex justify-end gap-1">
                  <MenuIconButton
                    label={`Edytuj wariant ${variant.name}`}
                    onClick={() => {
                      setAdding(false);
                      setEditingId(variant.id);
                    }}
                  >
                    <Pencil size={13} strokeWidth={1.8} />
                  </MenuIconButton>
                  <MenuIconButton
                    label={`Usuń wariant ${variant.name}`}
                    onClick={() => {
                      if (!window.confirm(`Usunąć wariant „${variant.name}”?`)) return;
                      deleteMutation.mutate(variant.id);
                    }}
                    disabled={deleteMutation.isPending}
                    danger
                  >
                    <Trash2 size={13} strokeWidth={1.8} />
                  </MenuIconButton>
                </span>
              </div>
            ),
          )}

          {adding && (
            <VariantRowEditor
              initial={null}
              pending={createMutation.isPending}
              onCancel={() => setAdding(false)}
              onSubmit={(values) => createMutation.mutate(toPayload(values))}
            />
          )}

          {variants.length === 0 && !adding && (
            <p
              className="py-3 text-[13px]"
              style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.55 }}
            >
              Brak wariantów — produkt sprzedawany w cenie bazowej. Dodaj rozmiary
              jeśli mają różne ceny.
            </p>
          )}
        </>
      )}
    </section>
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
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="my-2 rounded-lg p-3"
      style={{
        border: "1px solid rgb(var(--color-primary))",
        background: "rgb(var(--color-primary-tint))",
      }}
      noValidate
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_130px_104px_auto] sm:items-start">
        <div>
          <EditorLabel>Nazwa</EditorLabel>
          <EditorInput placeholder="np. 30 cm" autoFocus {...register("name")} />
          {errors.name && <EditorError>{errors.name.message}</EditorError>}
        </div>
        <div>
          <EditorLabel>Cena</EditorLabel>
          <div style={{ position: "relative" }}>
            <EditorInput
              mono
              inputMode="decimal"
              placeholder="29.00"
              style={{ paddingRight: 30 }}
              {...register("priceStr")}
            />
            <span
              className="text-[12px]"
              style={{
                position: "absolute",
                right: 10,
                top: 10,
                color: "rgb(var(--color-text-muted))",
                pointerEvents: "none",
              }}
            >
              zł
            </span>
          </div>
          {errors.priceStr && (
            <EditorError>{errors.priceStr.message as string}</EditorError>
          )}
        </div>
        <div>
          <EditorLabel>Kolejność</EditorLabel>
          <EditorInput
            type="number"
            min={0}
            {...register("displayOrder", { valueAsNumber: true })}
          />
          {errors.displayOrder && (
            <EditorError>{errors.displayOrder.message as string}</EditorError>
          )}
        </div>
        <div className="flex gap-2 sm:pt-[22px]">
          <button
            type="submit"
            disabled={pending}
            className="h-9 rounded-md px-3.5 text-[13px] font-semibold text-white"
            style={{
              border: "none",
              background: pending ? "#D4D0C2" : "rgb(var(--color-primary))",
              cursor: pending ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {pending ? "Zapisywanie…" : initial ? "Zapisz" : "Dodaj"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="h-9 rounded-md px-3 text-[13px] font-medium"
            style={{
              border: "1px solid rgb(var(--color-border-card))",
              background: "rgb(var(--color-bg-card))",
              color: "rgb(var(--color-text-body))",
              cursor: pending ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            Anuluj
          </button>
        </div>
      </div>
    </form>
  );
}

function EditorLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mb-1 text-[12px] font-semibold"
      style={{ color: "rgb(var(--color-text-body))" }}
    >
      {children}
    </div>
  );
}

function EditorError({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-1 text-[12px]" style={{ color: "rgb(var(--status-cancelled))" }}>
      {children}
    </p>
  );
}

interface EditorInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
}

const EditorInput = ((props: EditorInputProps) => {
  const { mono, style, ...rest } = props;
  return (
    <input
      {...rest}
      style={{
        width: "100%",
        height: 38,
        padding: "0 12px",
        borderRadius: 8,
        border: "1px solid rgb(var(--color-border-card))",
        background: "rgb(var(--color-bg-card))",
        fontSize: 14,
        color: "rgb(var(--color-text-primary))",
        fontFamily: mono ? "var(--font-mono)" : "inherit",
        outline: "none",
        boxSizing: "border-box",
        ...style,
      }}
    />
  );
}) as React.FC<EditorInputProps>;
