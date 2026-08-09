import { PiecShell } from "@/features/public/shared/PiecShell";

/** Ekran 14 z planszy — szkielet siatki menu zamiast spinnera. */
export function MenuSkeleton() {
  return (
    <PiecShell className="py-5">
      <div
        className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(clamp(150px,26vw,250px),1fr))] max-[430px]:!grid-cols-2 max-[430px]:!gap-2.5"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-[18px] border border-piec-ink/[0.07]"
          >
            <div className="aspect-[4/3] w-full bg-piec-ink/[0.08] motion-safe:animate-piec-shimmer" />
            <div className="p-3">
              <div className="h-[15px] w-3/5 rounded bg-piec-ink/[0.11] motion-safe:animate-piec-shimmer" />
              <div className="mt-2 h-[11px] w-[85%] rounded bg-piec-ink/[0.07] motion-safe:animate-piec-shimmer" />
              <div className="mt-3 h-[30px] w-full rounded-full bg-piec-ink/[0.06] motion-safe:animate-piec-shimmer" />
            </div>
          </div>
        ))}
      </div>
      <p role="status" className="py-4 text-[13px] text-piec-ink/45">
        Wczytujemy menu…
      </p>
    </PiecShell>
  );
}
