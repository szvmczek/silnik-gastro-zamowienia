import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  createAdminProduct,
  deleteAdminProduct,
  fetchAdminCategories,
  fetchAdminProduct,
  updateAdminProduct,
  type AdminProductDto,
  type CreateProductPayload,
  type UpdateProductPayload,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";
import { Switch } from "@/shared/components/ui/Switch";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { VariantsSection } from "./VariantsSection";
import { AddonGroupsAttachSection } from "./AddonGroupsAttachSection";

// Bundle ref: docs/design/v2-stage3/frame-product-edit.jsx — 8fr/4fr grid.
// N38 A: Status card = single "Produkt dostępny" toggle (badge/temp-unavail
// dropped — no backend field). N39 A: "Sprzedaż 30 dni" card dropped.
// No <form> wrapper — handleSubmit triggered from topbar action (variants /
// addon sections carry their own forms; nested <form> would be invalid).

const schema = z
  .object({
    categoryId: z.coerce.number().int().positive("Wybierz kategorię"),
    name: z.string().min(1, "Nazwa jest wymagana").max(140),
    description: z.string().max(4000).optional(),
    basePriceStr: z.string().optional(),
    imageUrl: z
      .string()
      .max(500)
      .optional()
      .refine((v) => !v || /^https?:\/\/.+/.test(v), {
        message: "URL musi zaczynać się od http:// lub https://",
      }),
    displayOrder: z.coerce.number().int().min(0, "Musi być ≥ 0"),
    available: z.boolean(),
  })
  .refine(
    (v) =>
      v.basePriceStr === undefined ||
      v.basePriceStr === "" ||
      /^\d+([.,]\d{1,2})?$/.test(v.basePriceStr),
    { path: ["basePriceStr"], message: "Cena w formacie 12.50" },
  );

type FormValues = z.input<typeof schema>;

const defaultValues: FormValues = {
  categoryId: 0,
  name: "",
  description: "",
  basePriceStr: "",
  imageUrl: "",
  displayOrder: 0,
  available: true,
};

function toFormValues(p: AdminProductDto): FormValues {
  return {
    categoryId: p.categoryId,
    name: p.name,
    description: p.description ?? "",
    basePriceStr: p.basePrice ?? "",
    imageUrl: p.imageUrl ?? "",
    displayOrder: p.displayOrder,
    available: p.available,
  };
}

function toPayload(values: FormValues): CreateProductPayload {
  const base = values.basePriceStr?.trim();
  return {
    categoryId: Number(values.categoryId),
    name: values.name,
    description: values.description?.trim() ? values.description : null,
    basePrice: base ? base.replace(",", ".") : null,
    imageUrl: values.imageUrl?.trim() ? values.imageUrl : null,
    displayOrder: Number(values.displayOrder),
    available: Boolean(values.available),
  };
}

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const creating = !id || id === "new";
  const productId = creating ? null : Number(id);

  const categoriesQuery = useQuery({
    queryKey: ["admin", "menu", "categories"],
    queryFn: fetchAdminCategories,
  });

  const productQuery = useQuery({
    queryKey: ["admin", "menu", "product", productId],
    queryFn: () => fetchAdminProduct(productId as number),
    enabled: productId !== null,
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  useEffect(() => {
    if (productQuery.data) reset(toFormValues(productQuery.data));
  }, [productQuery.data, reset]);

  useEffect(() => {
    if (creating && categoriesQuery.data && categoriesQuery.data.length > 0) {
      setValue("categoryId", categoriesQuery.data[0].id, { shouldDirty: false });
    }
  }, [creating, categoriesQuery.data, setValue]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateProductPayload) => createAdminProduct(payload),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Produkt utworzony");
      navigate(`/admin/menu/products/${product.id}`, { replace: true });
    },
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się utworzyć produktu"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateProductPayload) =>
      updateAdminProduct(productId as number, payload),
    onSuccess: (product) => {
      queryClient.setQueryData(["admin", "menu", "product", product.id], product);
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      reset(toFormValues(product));
      toast.success("Produkt zapisany");
    },
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zapisać produktu"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminProduct(productId as number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Produkt usunięty");
      navigate("/admin/menu?tab=products", { replace: true });
    },
    onError: (err) =>
      toast.error(extractProblem(err)?.detail ?? "Nie udało się usunąć produktu"),
  });

  const pending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    isSubmitting;

  const available = watch("available");
  const imageUrl = watch("imageUrl");
  const categoryId = watch("categoryId");
  const nameLive = watch("name");
  const previewUrl = imageUrl && /^https?:\/\/.+/.test(imageUrl) ? imageUrl : null;

  const onSubmit = (values: FormValues) => {
    const payload = toPayload(values);
    if (creating) {
      createMutation.mutate(payload);
    } else {
      const currentVersion = productQuery.data?.version;
      if (currentVersion === undefined) {
        toast.error("Brak wczytanych danych produktu — odśwież stronę.");
        return;
      }
      updateMutation.mutate({ ...payload, version: currentVersion });
    }
  };

  const onDelete = () => {
    if (creating || !productQuery.data) return;
    if (
      !window.confirm(
        `Usunąć produkt „${productQuery.data.name}”? Operacja jest nieodwracalna.`,
      )
    )
      return;
    deleteMutation.mutate();
  };

  const categories = categoriesQuery.data ?? [];
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories],
  );

  const topbarTitle = creating
    ? "Nowy produkt"
    : (productQuery.data?.name ?? (nameLive || "Produkt"));

  const actions = (
    <>
      <button
        type="button"
        onClick={() => navigate("/admin/menu?tab=products")}
        disabled={pending}
        className="inline-flex h-8 items-center rounded-md px-3 text-[12px] font-medium"
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
      <button
        type="button"
        onClick={() => handleSubmit(onSubmit)()}
        disabled={pending || (!creating && !isDirty)}
        className="inline-flex h-8 items-center rounded-md px-3.5 text-[12px] font-semibold text-white"
        style={{
          border: "none",
          background:
            pending || (!creating && !isDirty)
              ? "#D4D0C2"
              : "rgb(var(--color-primary))",
          cursor: pending || (!creating && !isDirty) ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {pending ? "Zapisywanie…" : creating ? "Utwórz produkt" : "Zapisz zmiany"}
      </button>
    </>
  );

  if (!creating && productQuery.isLoading) {
    return (
      <>
        <AdminTopbar title="Produkt" metadata="Edycja produktu" />
        <div className="p-8 text-[14px]" style={{ color: "rgb(var(--color-text-muted))" }}>
          Ładowanie produktu…
        </div>
      </>
    );
  }
  if (!creating && productQuery.isError) {
    return (
      <>
        <AdminTopbar title="Produkt" metadata="Edycja produktu" />
        <div
          className="m-8 rounded-md p-3 text-sm"
          style={{
            border: "1px solid rgb(var(--status-cancelled) / 0.3)",
            background: "rgb(var(--status-cancelled-tint))",
            color: "rgb(var(--status-cancelled))",
          }}
        >
          Nie udało się pobrać produktu.{" "}
          <button onClick={() => navigate(-1)} className="underline">
            Wróć
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminTopbar
        title={topbarTitle}
        metadata="Edycja produktu"
        actions={actions}
      />
      <div className="p-4 md:p-8">
        <div className="grid max-w-[1100px] grid-cols-1 gap-4 lg:grid-cols-[8fr_4fr]">
          {/* LEFT */}
          <div className="flex min-w-0 flex-col gap-4">
            <Card title="Podstawowe">
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-[2fr_1fr]">
                <Field label="Nazwa produktu" required error={errors.name?.message}>
                  <TextInput {...register("name")} />
                </Field>
                <Field
                  label="Kategoria"
                  required
                  error={errors.categoryId?.message as string}
                >
                  <select
                    value={categoryId ? String(categoryId) : ""}
                    onChange={(e) =>
                      setValue("categoryId", Number(e.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      })
                    }
                    className="h-10 w-full rounded-lg px-3 text-[14px]"
                    style={{
                      border: "1px solid rgb(var(--color-border-card))",
                      background: "rgb(var(--color-bg-card))",
                      color: "rgb(var(--color-text-primary))",
                      fontFamily: "inherit",
                      outline: "none",
                    }}
                  >
                    <option value="" disabled>
                      Wybierz kategorię
                    </option>
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-[1fr_1fr]">
                <Field
                  label="Cena bazowa"
                  hint="ignorowana gdy są warianty"
                  error={errors.basePriceStr?.message as string}
                >
                  <div style={{ position: "relative" }}>
                    <TextInput
                      mono
                      inputMode="decimal"
                      placeholder="np. 29.00"
                      style={{ paddingRight: 32 }}
                      {...register("basePriceStr")}
                    />
                    <span
                      className="text-[12px]"
                      style={{
                        position: "absolute",
                        right: 12,
                        top: 12,
                        color: "rgb(var(--color-text-muted))",
                        pointerEvents: "none",
                      }}
                    >
                      zł
                    </span>
                  </div>
                </Field>
                <Field
                  label="Kolejność"
                  hint="sort w menu"
                  error={errors.displayOrder?.message as string}
                >
                  <TextInput
                    type="number"
                    min={0}
                    {...register("displayOrder", { valueAsNumber: true })}
                  />
                </Field>
              </div>
              <div className="mt-3.5">
                <Field
                  label="Opis"
                  hint="Pokazany na karcie i w modalu produktu"
                  error={errors.description?.message as string}
                >
                  <textarea
                    rows={3}
                    {...register("description")}
                    style={{
                      width: "100%",
                      minHeight: 84,
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid rgb(var(--color-border-card))",
                      background: "rgb(var(--color-bg-card))",
                      fontSize: 14,
                      fontFamily: "inherit",
                      color: "rgb(var(--color-text-primary))",
                      lineHeight: 1.5,
                      resize: "vertical",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </Field>
              </div>
            </Card>

            {!creating && productId !== null && (
              <>
                <VariantsSection productId={productId} />
                <AddonGroupsAttachSection productId={productId} />
              </>
            )}
            {creating && (
              <div
                className="rounded-xl px-5 py-4 text-[13px]"
                style={{
                  background: "rgb(var(--color-bg-section))",
                  border: "1px dashed rgb(var(--color-border-card))",
                  color: "rgb(var(--color-text-muted))",
                  lineHeight: 1.55,
                }}
              >
                Warianty rozmiaru i grupy dodatków dodasz po utworzeniu produktu.
              </div>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            <Card title="Zdjęcie" subtle>
              <Field label="URL zdjęcia" error={errors.imageUrl?.message as string}>
                <TextInput
                  mono
                  placeholder="https://images.unsplash.com/…"
                  {...register("imageUrl")}
                />
              </Field>
              <div
                className="mt-3 grid w-full place-items-center overflow-hidden rounded-xl"
                style={{
                  aspectRatio: "1 / 1",
                  background: "linear-gradient(135deg, #FCEEEF, #F5F2EA)",
                  border: "1px solid rgb(var(--color-border-card))",
                }}
              >
                {previewUrl ? (
                  <img
                    key={previewUrl}
                    src={previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span
                    className="text-[11px] uppercase"
                    style={{
                      letterSpacing: "0.18em",
                      color: "rgb(var(--color-text-faint))",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    product shot · 1:1
                  </span>
                )}
              </div>
              <p
                className="mt-2.5 text-[12px]"
                style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.5 }}
              >
                Wklej link do zdjęcia (np. z Unsplash). Upload plików — w przyszłej
                aktualizacji.
              </p>
            </Card>

            <Card title="Dostępność" subtle>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div
                    className="text-[14px] font-semibold"
                    style={{ color: "rgb(var(--color-text-primary))" }}
                  >
                    Produkt dostępny
                  </div>
                  <div
                    className="mt-0.5 text-[12px]"
                    style={{
                      color: "rgb(var(--color-text-muted))",
                      lineHeight: 1.45,
                    }}
                  >
                    {available
                      ? "Widoczny i zamawialny w menu klienta."
                      : "Niedostępny — wyszarzony w menu, nie można zamówić."}
                  </div>
                </div>
                <Switch
                  checked={Boolean(available)}
                  onCheckedChange={(v) =>
                    setValue("available", v, { shouldDirty: true })
                  }
                  aria-label="Produkt dostępny"
                />
              </div>
            </Card>

            {!creating && (
              <button
                type="button"
                onClick={onDelete}
                disabled={pending}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg text-[13px] font-semibold"
                style={{
                  border: "1px solid #FCA5A5",
                  background: "rgb(var(--color-bg-card))",
                  color: "rgb(var(--status-cancelled))",
                  cursor: pending ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                <Trash2 size={14} strokeWidth={1.8} aria-hidden /> Usuń produkt
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ───────── primitives ───────── */

function Card({
  title,
  subtle,
  children,
}: {
  title: string;
  subtle?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl p-5"
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
      }}
    >
      {subtle ? (
        <h4
          className="m-0 mb-3 text-[12px] font-bold uppercase"
          style={{
            letterSpacing: "0.06em",
            color: "rgb(var(--color-text-muted))",
          }}
        >
          {title}
        </h4>
      ) : (
        <h3
          className="m-0 mb-4 text-[15px] font-bold"
          style={{ color: "rgb(var(--color-text-primary))" }}
        >
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline gap-1.5">
        <span
          className="text-[13px] font-semibold"
          style={{ color: "rgb(var(--color-text-body))" }}
        >
          {label}
          {required && (
            <span
              className="ml-0.5"
              style={{ color: "rgb(var(--color-primary))" }}
              aria-hidden
            >
              *
            </span>
          )}
        </span>
        {hint && (
          <span
            className="text-[12px]"
            style={{ color: "rgb(var(--color-text-faint))" }}
          >
            · {hint}
          </span>
        )}
      </div>
      {children}
      {error && (
        <p
          className="mt-1 text-[12px]"
          style={{ color: "rgb(var(--status-cancelled))" }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
}

const TextInput = ((props: TextInputProps) => {
  const { mono, style, ...rest } = props;
  return (
    <input
      {...rest}
      style={{
        width: "100%",
        height: 40,
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
}) as React.FC<TextInputProps>;
