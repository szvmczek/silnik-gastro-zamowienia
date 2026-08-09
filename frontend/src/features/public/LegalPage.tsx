import { useQuery } from "@tanstack/react-query";
import { fetchPublicLegal, type LegalContent } from "@/shared/api/legalApi";
import { PiecHeader } from "@/features/public/shared/PiecHeader";
import { PiecShell } from "@/features/public/shared/PiecShell";
import { PiecFooter } from "@/features/public/shared/PiecFooter";
import { CartPill } from "@/features/public/shared/CartPill";

interface Props {
  title: string;
  field: keyof LegalContent;
  errorMessage: string;
}

/**
 * Wspólny szkielet stron prawnych. Obie różniły się wcześniej tylko
 * tytułem i polem DTO, więc przy przepisywaniu na ciemny motyw zeszły
 * do jednego komponentu zamiast dwóch bliźniaczych plików.
 */
export function LegalPage({ title, field, errorMessage }: Props) {
  const { data, isError, isPending } = useQuery({
    queryKey: ["public", "legal"],
    queryFn: fetchPublicLegal,
    staleTime: 60_000,
  });

  const value = data?.[field];
  const content = value?.trim() ? value : "Brak treści.";

  return (
    <>
      <PiecHeader actions={<CartPill emptyVariant="none" />} />

      <PiecShell className="pb-14 pt-8">
        <h1 className="font-display text-[clamp(32px,8vw,52px)] tracking-[1.5px]">{title}</h1>

        <section className="mt-6 rounded-2xl border border-piec-ink/10 bg-piec-surface p-5 md:p-8">
          {isPending ? (
            <p className="text-sm text-piec-ink/55">Ładowanie treści…</p>
          ) : isError ? (
            <p className="text-sm text-piec-warnSoft">{errorMessage}</p>
          ) : (
            <div className="whitespace-pre-line text-[15px] leading-[1.75] text-piec-ink/[0.78]">
              {content}
            </div>
          )}
        </section>
      </PiecShell>

      <PiecFooter />
    </>
  );
}
