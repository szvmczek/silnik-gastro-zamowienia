import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft, ImageIcon, Tag, Trash2, UtensilsCrossed, Wallet } from "lucide-react";
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
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Textarea } from "@/shared/components/ui/Textarea";
import { Switch } from "@/shared/components/ui/Switch";
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
import { VariantsSection } from "./VariantsSection";
import { AddonGroupsAttachSection } from "./AddonGroupsAttachSection";

const STRIPE_BG = {
  backgroundImage:
    "repeating-linear-gradient(135deg, rgba(15,23,42,0.04) 0, rgba(15,23,42,0.04) 8px, rgba(15,23,42,0.08) 8px, rgba(15,23,42,0.08) 16px)",
} as const;

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
      .refine(
        (v) => !v || /^https?:\/\/.+/.test(v),
        { message: "URL musi zaczynać się od http:// lub https://" }
      ),
    displayOrder: z.coerce.number().int().min(0, "Musi być ≥ 0"),
    available: z.boolean(),
  })
  .refine(
    (v) => {
      if (v.basePriceStr === undefined || v.basePriceStr === "") return true;
      return /^\d+([.,]\d{1,2})?$/.test(v.basePriceStr);
    },
    { path: ["basePriceStr"], message: "Cena w formacie 12.50" }
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
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się utworzyć produktu");
    },
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
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się zapisać produktu");
    },
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
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się usunąć produktu");
    },
  });

  const pending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    isSubmitting;

  const available = watch("available");
  const imageUrl = watch("imageUrl");
  const categoryId = watch("categoryId");
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
        `Usunąć produkt "${productQuery.data.name}"? Operacja jest nieodwracalna.`
      )
    )
      return;
    deleteMutation.mutate();
  };

  const categories = categoriesQuery.data ?? [];
  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: String(c.id), label: c.name })),
    [categories]
  );

  if (!creating && productQuery.isLoading) {
    return <div className="text-sm text-slate-500">Ładowanie produktu…</div>;
  }
  if (!creating && productQuery.isError) {
    return (
      <div className="text-sm text-rose-600">
        Nie udało się pobrać produktu.{" "}
        <button onClick={() => navigate(-1)} className="underline">
          Wróć
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[960px] space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/menu?tab=products")}
          className="inline-flex items-center gap-1 text-[13px] text-slate-500 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" /> Produkty
        </button>
        <h1 className="mt-2 text-[24px] font-semibold tracking-tight text-slate-900">
          {creating ? "Nowy produkt" : productQuery.data?.name ?? "Produkt"}
        </h1>
        {!creating && productQuery.data ? (
          <p className="mt-1 font-mono text-[12px] text-slate-500">
            slug: {productQuery.data.slug}
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[17px]">
              <UtensilsCrossed className="h-4 w-4 text-slate-400" /> Dane podstawowe
            </CardTitle>
            <CardDescription>
              Slug generowany automatycznie po nazwie (edycja slugów — post-MVP).
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="p-name">
                Nazwa <span className="text-rose-600">*</span>
              </Label>
              <Input id="p-name" error={!!errors.name} {...register("name")} />
              {errors.name ? (
                <p className="mt-1 text-[12px] text-rose-600">{errors.name.message}</p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="p-category">
                Kategoria <span className="text-rose-600">*</span>
              </Label>
              <Select
                value={categoryId ? String(categoryId) : ""}
                onValueChange={(v) => setValue("categoryId", Number(v), { shouldDirty: true })}
              >
                <SelectTrigger id="p-category">
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId ? (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.categoryId.message as string}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="p-order">Kolejność wyświetlania</Label>
              <Input
                id="p-order"
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
            <div className="sm:col-span-2">
              <Label htmlFor="p-desc">Opis</Label>
              <Textarea id="p-desc" rows={3} {...register("description")} />
              <p className="mt-1 text-[12px] text-slate-500">
                Widoczny w menu pod nazwą. 1–2 zdania działają najlepiej.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[17px]">
              <Wallet className="h-4 w-4 text-slate-400" /> Cena bazowa
            </CardTitle>
            <CardDescription>
              Jeśli dodasz warianty poniżej, cena bazowa jest ignorowana — każdy wariant ma własną cenę.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Label htmlFor="p-price">Cena</Label>
            <div className="relative w-48">
              <Input
                id="p-price"
                inputMode="decimal"
                placeholder="np. 29.00"
                className="pr-10 font-mono"
                error={!!errors.basePriceStr}
                {...register("basePriceStr")}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-slate-500">
                zł
              </span>
            </div>
            {errors.basePriceStr ? (
              <p className="mt-1 text-[12px] text-rose-600">
                {errors.basePriceStr.message as string}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[17px]">
              <ImageIcon className="h-4 w-4 text-slate-400" /> Zdjęcie
            </CardTitle>
            <CardDescription>
              Wklej link do zdjęcia. Polecamy <strong>Unsplash.com</strong> — znajdź zdjęcie,
              kliknij prawym → „Kopiuj adres obrazu".
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[1fr_220px] sm:items-start">
            <div>
              <Label htmlFor="p-image">URL zdjęcia</Label>
              <Input
                id="p-image"
                placeholder="https://images.unsplash.com/…"
                className="font-mono text-[12px] text-slate-700"
                error={!!errors.imageUrl}
                {...register("imageUrl")}
              />
              {errors.imageUrl ? (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.imageUrl.message as string}
                </p>
              ) : null}
            </div>
            <div>
              <p className="kicker mb-1.5">Podgląd</p>
              <div
                className="relative aspect-[4/3] overflow-hidden rounded-md border border-slate-200"
                style={STRIPE_BG}
              >
                <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  product shot · 4:3
                </span>
                {previewUrl ? (
                  <img
                    key={previewUrl}
                    src={previewUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[17px]">
              <Tag className="h-4 w-4 text-slate-400" /> Dostępność
            </CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-4">
              <div>
                <div className="text-[14px] font-medium text-slate-900">
                  Aktywny w menu
                </div>
                <div className="mt-0.5 text-[12px] text-slate-500">
                  {available
                    ? "Widoczny i zamawialny dla klientów."
                    : "Niedostępny — wyszarzony w menu, nie można zamówić."}
                </div>
              </div>
              <Switch
                checked={Boolean(available)}
                onCheckedChange={(v) => setValue("available", v, { shouldDirty: true })}
                aria-label="Aktywny w menu"
              />
            </label>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
          {!creating ? (
            <Button
              type="button"
              variant="dangerOutline"
              onClick={onDelete}
              disabled={pending}
            >
              <Trash2 className="h-4 w-4" /> Usuń produkt
            </Button>
          ) : (
            <span aria-hidden />
          )}
          <div className="flex items-center gap-2 sm:ml-auto">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/admin/menu?tab=products")}
              disabled={pending}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={pending || (!creating && !isDirty)}>
              {pending ? "Zapisywanie…" : creating ? "Utwórz produkt" : "Zapisz zmiany"}
            </Button>
          </div>
        </div>
      </form>

      {!creating && productId !== null ? (
        <>
          <VariantsSection productId={productId} />
          <AddonGroupsAttachSection productId={productId} />
        </>
      ) : null}
    </div>
  );
}
