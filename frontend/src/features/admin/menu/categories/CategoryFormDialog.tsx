import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/Dialog";
import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";
import { Label } from "@/shared/components/ui/Label";
import { Textarea } from "@/shared/components/ui/Textarea";
import { Switch } from "@/shared/components/ui/Switch";
import {
  createAdminCategory,
  updateAdminCategory,
  type AdminCategoryDto,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";

const schema = z.object({
  name: z.string().min(1, "Nazwa jest wymagana").max(120),
  description: z.string().max(2000).optional(),
  displayOrder: z.coerce.number().int().min(0, "Musi być ≥ 0"),
  active: z.boolean(),
});

type FormValues = z.input<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: AdminCategoryDto | null;
}

export function CategoryFormDialog({ open, onOpenChange, category }: Props) {
  const queryClient = useQueryClient();
  const editing = Boolean(category);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      displayOrder: 0,
      active: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (category) {
      reset({
        name: category.name,
        description: category.description ?? "",
        displayOrder: category.displayOrder,
        active: category.active,
      });
    } else {
      reset({ name: "", description: "", displayOrder: 0, active: true });
    }
  }, [open, category, reset]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => createAdminCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Kategoria dodana");
      onOpenChange(false);
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się dodać kategorii");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateCategoryPayload) =>
      updateAdminCategory(category!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Kategoria zaktualizowana");
      onOpenChange(false);
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się zapisać kategorii");
    },
  });

  const pending = createMutation.isPending || updateMutation.isPending;
  const active = watch("active");

  const onSubmit = (values: FormValues) => {
    const payload: CreateCategoryPayload = {
      name: values.name,
      description: values.description?.trim() ? values.description : null,
      displayOrder: Number(values.displayOrder),
      active: Boolean(values.active),
    };
    if (editing) {
      updateMutation.mutate({ ...payload, version: category!.version });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edytuj kategorię" : "Nowa kategoria"}</DialogTitle>
          <DialogDescription>
            Slug jest generowany automatycznie po nazwie (edycja slugów — post-MVP).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="cat-name">Nazwa</Label>
            <Input id="cat-name" {...register("name")} autoFocus />
            {errors.name ? (
              <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="cat-desc">Opis (opcjonalnie)</Label>
            <Textarea id="cat-desc" rows={3} {...register("description")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="cat-order">Kolejność</Label>
              <Input
                id="cat-order"
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
            <div>
              <Label htmlFor="cat-active">Widoczna publicznie</Label>
              <div className="flex h-10 items-center gap-2">
                <Switch
                  id="cat-active"
                  checked={Boolean(active)}
                  onCheckedChange={(v) => setValue("active", v, { shouldDirty: true })}
                />
                <span className="text-sm text-slate-600">{active ? "Tak" : "Nie"}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={pending || (editing && !isDirty)}>
              {pending ? "Zapisywanie…" : editing ? "Zapisz" : "Dodaj"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
