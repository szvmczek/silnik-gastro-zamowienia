import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopbar } from "@/features/admin/layout/AdminTopbar";
import { extractProblem } from "@/shared/api/client";
import {
  fetchAdminLegal,
  updateAdminLegal,
  type LegalContent,
} from "@/shared/api/legalApi";
import { SaveBar } from "../components/SaveBar";

// Edytor dokumentów RODO (M-046). Polityka prywatności + regulamin jako plain
// text (Q3 — bez markdown); renderowane whitespace-pre-line na publicznych
// /privacy i /terms (M-047). Wzorzec sekcji: OperationsSection.

const MAX = 20000;

const schema = z.object({
  privacyPolicy: z.string().max(MAX, `Maksimum ${MAX} znaków`),
  termsOfService: z.string().max(MAX, `Maksimum ${MAX} znaków`),
});

type FormValues = z.infer<typeof schema>;

function toForm(d: LegalContent): FormValues {
  return {
    privacyPolicy: d.privacyPolicy ?? "",
    termsOfService: d.termsOfService ?? "",
  };
}

export function LegalSection() {
  const queryClient = useQueryClient();
  const query = useQuery<LegalContent>({
    queryKey: ["admin", "legal"],
    queryFn: fetchAdminLegal,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { privacyPolicy: "", termsOfService: "" },
  });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = form;

  useEffect(() => {
    if (query.data) reset(toForm(query.data));
  }, [query.data, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) => updateAdminLegal(values),
    onSuccess: (updated) => {
      queryClient.setQueryData(["admin", "legal"], updated);
      queryClient.invalidateQueries({ queryKey: ["public", "legal"] });
      reset(toForm(updated));
      toast.success("Dokumenty prawne zapisane");
    },
    onError: (err) => {
      toast.error(extractProblem(err)?.detail ?? "Nie udało się zapisać dokumentów");
    },
  });

  const onSubmit = handleSubmit((values) => mutation.mutate(values));
  const handleCancel = () => {
    if (query.data) reset(toForm(query.data));
  };

  if (query.isPending) {
    return (
      <>
        <AdminTopbar title="RODO i regulaminy" />
        <div className="p-8 text-[14px]" style={{ color: "rgb(var(--color-text-muted))" }}>
          Ładowanie dokumentów…
        </div>
      </>
    );
  }
  if (query.isError) {
    return (
      <>
        <AdminTopbar title="RODO i regulaminy" />
        <div
          className="m-8 rounded-md p-3 text-sm"
          style={{
            border: "1px solid rgb(var(--status-cancelled) / 0.3)",
            background: "rgb(var(--status-cancelled-tint))",
            color: "rgb(var(--status-cancelled))",
          }}
        >
          Nie udało się pobrać dokumentów. Odśwież stronę.
        </div>
      </>
    );
  }

  const privacyLen = watch("privacyPolicy").length;
  const termsLen = watch("termsOfService").length;

  return (
    <>
      <AdminTopbar title="RODO i regulaminy" metadata="Polityka prywatności i regulamin" />
      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="mx-auto max-w-[880px] p-8">
            <p
              className="m-0 mb-6 max-w-[640px] text-[14px]"
              style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.55 }}
            >
              Treść wyświetlana na publicznych stronach „Polityka prywatności"
              i „Regulamin" oraz linkowana w stopce. Zwykły tekst — akapity
              i puste linie zostają zachowane.
            </p>

            <Card
              title="Polityka prywatności"
              sub="Informacja o przetwarzaniu danych osobowych klientów (RODO)."
            >
              <textarea
                {...register("privacyPolicy")}
                rows={15}
                maxLength={MAX}
                placeholder="Wklej treść polityki prywatności…"
                style={TEXTAREA_STYLE}
              />
              <CounterRow len={privacyLen} error={errors.privacyPolicy?.message} />
            </Card>

            <div className="h-4" />

            <Card title="Regulamin" sub="Zasady składania i realizacji zamówień.">
              <textarea
                {...register("termsOfService")}
                rows={15}
                maxLength={MAX}
                placeholder="Wklej treść regulaminu…"
                style={TEXTAREA_STYLE}
              />
              <CounterRow len={termsLen} error={errors.termsOfService?.message} />
            </Card>
          </div>
        </div>
        <SaveBar
          isDirty={isDirty}
          pending={mutation.isPending}
          onCancel={handleCancel}
          onSave={onSubmit}
        />
      </form>
    </>
  );
}

/* ───────── primitives ───────── */

const TEXTAREA_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 8,
  border: "1px solid rgb(var(--color-border-card))",
  background: "rgb(var(--color-bg-card))",
  fontSize: 13,
  fontFamily: "inherit",
  color: "rgb(var(--color-text-primary))",
  lineHeight: 1.6,
  resize: "vertical",
  minHeight: 240,
  outline: "none",
  boxSizing: "border-box",
};

function Card({
  title,
  sub,
  children,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="rounded-xl"
      style={{
        background: "rgb(var(--color-bg-card))",
        border: "1px solid rgb(var(--color-border-card))",
        padding: 22,
      }}
    >
      <h3
        className="m-0 text-[15px] font-bold"
        style={{ color: "rgb(var(--color-text-primary))" }}
      >
        {title}
      </h3>
      <p
        className="m-0 mb-4 mt-1 text-[13px]"
        style={{ color: "rgb(var(--color-text-muted))", lineHeight: 1.5 }}
      >
        {sub}
      </p>
      {children}
    </section>
  );
}

function CounterRow({ len, error }: { len: number; error?: string }) {
  return (
    <div className="mt-1.5 flex items-start justify-between gap-3 text-[12px]">
      <span style={{ color: "rgb(var(--status-cancelled))" }}>{error ?? ""}</span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          color:
            len > MAX
              ? "rgb(var(--status-cancelled))"
              : "rgb(var(--color-text-faint))",
          whiteSpace: "nowrap",
        }}
      >
        {len} / {MAX}
      </span>
    </div>
  );
}
