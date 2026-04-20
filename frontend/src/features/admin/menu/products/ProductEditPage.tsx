import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import {
  createAdminProduct,
  fetchAdminCategories,
  fetchAdminProduct,
  updateAdminProduct,
  type AdminProductDto,
  type CreateProductPayload,
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
    mutationFn: (payload: CreateProductPayload) =>
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

  const pending = createMutation.isPending || updateMutation.isPending || isSubmitting;

  const available = watch("available");
  const imageUrl = watch("imageUrl");
  const categoryId = watch("categoryId");

  const onSubmit = (values: FormValues) => {
    const payload = toPayload(values);
    if (creating) {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate(payload);
    }
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
      <div className="text-sm text-red-600">
        Nie udało się pobrać produktu. <button onClick={() => navigate(-1)} className="underline">Wróć</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => navigate("/admin/menu?tab=products")}
          className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"
        >
          <ChevronLeft className="h-4 w-4" /> Wróć do listy
        </button>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {creating ? "Nowy produkt" : productQuery.data?.name ?? "Produkt"}
        </h1>
        {!creating && productQuery.data ? (
          <p className="mt-1 font-mono text-xs text-slate-500">slug: {productQuery.data.slug}</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <Card>
          <CardHeader>
            <CardTitle>Dane podstawowe</CardTitle>
            <CardDescription>
              Ceny rządzą się zasadą: jeśli produkt ma warianty, zostaw cenę bazową pustą.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="p-name">Nazwa</Label>
              <Input id="p-name" {...register("name")} />
              {errors.name ? (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="p-category">Kategoria</Label>
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
                <p className="mt-1 text-xs text-red-600">
                  {errors.categoryId.message as string}
                </p>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="p-desc">Opis</Label>
              <Textarea id="p-desc" rows={3} {...register("description")} />
            </div>
            <div>
              <Label htmlFor="p-price">Cena bazowa</Label>
              <Input
                id="p-price"
                inputMode="decimal"
                placeholder="np. 29.00"
                {...register("basePriceStr")}
              />
              <p className="mt-1 text-xs text-slate-500">
                Zostaw puste dla produktów z wariantami.
              </p>
              {errors.basePriceStr ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors.basePriceStr.message as string}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="p-order">Kolejność wyświetlania</Label>
              <Input
                id="p-order"
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
            <div className="sm:col-span-2">
              <Label htmlFor="p-image">URL zdjęcia</Label>
              <Input id="p-image" placeholder="https://…" {...register("imageUrl")} />
              {errors.imageUrl ? (
                <p className="mt-1 text-xs text-red-600">
                  {errors.imageUrl.message as string}
                </p>
              ) : null}
              {imageUrl && /^https?:\/\/.+/.test(imageUrl) ? (
                <div className="mt-3 flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <img
                    src={imageUrl}
                    alt="Podgląd"
                    className="h-24 w-24 shrink-0 rounded object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                      const sibling = (e.currentTarget.nextElementSibling as HTMLElement | null);
                      if (sibling) sibling.style.display = "block";
                    }}
                  />
                  <span
                    className="hidden text-xs text-amber-700"
                    aria-live="polite"
                  >
                    Nie udało się załadować obrazu z tego URL.
                  </span>
                  <p className="text-xs text-slate-500">
                    Podgląd pobierany bezpośrednio z URL-a. Upewnij się, że jest publiczny.
                  </p>
                </div>
              ) : null}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="p-available">Dostępny</Label>
              <div className="flex h-10 items-center gap-2">
                <Switch
                  id="p-available"
                  checked={Boolean(available)}
                  onCheckedChange={(v) => setValue("available", v, { shouldDirty: true })}
                />
                <span className="text-sm text-slate-600">
                  {available ? "Widoczny i zamawialny" : "Niedostępny (wyszarzony w menu)"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
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
