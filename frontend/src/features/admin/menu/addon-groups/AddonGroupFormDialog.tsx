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
import { Switch } from "@/shared/components/ui/Switch";
import {
  createAdminAddonGroup,
  updateAdminAddonGroup,
  type AdminAddonGroupDto,
  type CreateAddonGroupPayload,
  type UpdateAddonGroupPayload,
} from "@/shared/api/menuApi";
import { extractProblem } from "@/shared/api/client";

const schema = z
  .object({
    name: z.string().min(1, "Nazwa jest wymagana").max(100),
    minSelect: z.coerce.number().int().min(0, "Musi być ≥ 0"),
    maxSelect: z.coerce.number().int().min(1, "Musi być ≥ 1"),
    required: z.boolean(),
  })
  .refine((v) => v.maxSelect >= v.minSelect, {
    path: ["maxSelect"],
    message: "max musi być ≥ min",
  })
  .refine((v) => !v.required || v.minSelect >= 1, {
    path: ["minSelect"],
    message: "Gdy grupa jest wymagana, min musi być ≥ 1",
  });

type FormValues = z.input<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: AdminAddonGroupDto | null;
}

export function AddonGroupFormDialog({ open, onOpenChange, group }: Props) {
  const queryClient = useQueryClient();
  const editing = Boolean(group);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", minSelect: 0, maxSelect: 1, required: false },
  });

  useEffect(() => {
    if (!open) return;
    if (group) {
      reset({
        name: group.name,
        minSelect: group.minSelect,
        maxSelect: group.maxSelect,
        required: group.required,
      });
    } else {
      reset({ name: "", minSelect: 0, maxSelect: 1, required: false });
    }
  }, [open, group, reset]);

  const required = watch("required");

  const createMutation = useMutation({
    mutationFn: (payload: CreateAddonGroupPayload) => createAdminAddonGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "addon-groups"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Grupa dodatków utworzona");
      onOpenChange(false);
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się utworzyć grupy");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateAddonGroupPayload) =>
      updateAdminAddonGroup(group!.id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "menu", "addon-groups"] });
      queryClient.invalidateQueries({ queryKey: ["public", "menu"] });
      toast.success("Grupa zaktualizowana");
      onOpenChange(false);
    },
    onError: (err) => {
      const problem = extractProblem(err);
      toast.error(problem?.detail ?? problem?.title ?? "Nie udało się zapisać grupy");
    },
  });

  const pending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (values: FormValues) => {
    const payload: CreateAddonGroupPayload = {
      name: values.name.trim(),
      minSelect: Number(values.minSelect),
      maxSelect: Number(values.maxSelect),
      required: Boolean(values.required),
    };
    if (editing) updateMutation.mutate({ ...payload, version: group!.version });
    else createMutation.mutate(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[18px]">
            {editing ? "Edytuj grupę dodatków" : "Nowa grupa dodatków"}
          </DialogTitle>
          <DialogDescription className="text-[13px]">
            Grupa definiuje zakres wyboru (min/max) — np. „wybierz 1 z 3 sosów".
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="g-name">
              Nazwa <span className="text-rose-600">*</span>
            </Label>
            <Input id="g-name" error={!!errors.name} {...register("name")} autoFocus />
            {errors.name ? (
              <p className="mt-1 text-[12px] text-rose-600">{errors.name.message}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="g-min">Min wybór</Label>
              <Input
                id="g-min"
                type="number"
                min={0}
                error={!!errors.minSelect}
                {...register("minSelect", { valueAsNumber: true })}
              />
              {errors.minSelect ? (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.minSelect.message as string}
                </p>
              ) : null}
            </div>
            <div>
              <Label htmlFor="g-max">Max wybór</Label>
              <Input
                id="g-max"
                type="number"
                min={1}
                error={!!errors.maxSelect}
                {...register("maxSelect", { valueAsNumber: true })}
              />
              {errors.maxSelect ? (
                <p className="mt-1 text-[12px] text-rose-600">
                  {errors.maxSelect.message as string}
                </p>
              ) : null}
            </div>
          </div>
          <label className="flex items-center justify-between gap-4 rounded-md border border-slate-200 p-3">
            <div>
              <div className="text-[14px] font-medium text-slate-900">
                Grupa wymagana
              </div>
              <div className="mt-0.5 text-[12px] text-slate-500">
                {required
                  ? "Klient musi wybrać co najmniej jeden dodatek z tej grupy."
                  : "Wybór opcjonalny — klient może pominąć grupę."}
              </div>
            </div>
            <Switch
              checked={Boolean(required)}
              onCheckedChange={(v) => setValue("required", v, { shouldDirty: true })}
              aria-label="Grupa wymagana"
            />
          </label>

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
