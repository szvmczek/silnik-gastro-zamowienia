import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { PiecShell } from "@/features/public/shared/PiecShell";

interface Chip {
  id: number;
  name: string;
  sectionId: string;
}

interface Props {
  chips: Chip[];
  /** Wysokość sticky nagłówka — próg, poniżej którego sekcja jest „aktywna". */
  offset?: number;
}

/**
 * Pigułki kategorii z paczki. Scroll-spy zostaje na IntersectionObserver
 * (jak w poprzednim CategoryTabs), a nie na pollingu getBoundingClientRect
 * co 90 ms, którym robi to paczka — ten sam efekt mniejszym kosztem.
 */
export function CategoryChips({ chips, offset = 170 }: Props) {
  const [activeId, setActiveId] = useState<string | null>(chips[0]?.sectionId ?? null);
  const isScrollingRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);

  const sectionIds = chips.map((c) => c.sectionId).join("|");

  useEffect(() => {
    const ids = sectionIds ? sectionIds.split("|") : [];
    if (!ids.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: `-${offset}px 0px -60% 0px`, threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sectionIds, offset]);

  // Aktywna pigułka poza widokiem paska — dociągamy ją do środka, żeby
  // przy długiej liście kategorii było widać, gdzie się jest.
  useEffect(() => {
    if (!activeId || !listRef.current) return;
    const chip = listRef.current.querySelector<HTMLElement>(`[data-chip="${activeId}"]`);
    chip?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeId]);

  const jumpTo = (sectionId: string) => {
    setActiveId(sectionId);
    isScrollingRef.current = true;
    const el = document.getElementById(sectionId);
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - offset + 40,
        behavior: "smooth",
      });
    }
    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  if (!chips.length) return null;

  return (
    <PiecShell>
      <nav
        ref={listRef}
        aria-label="Kategorie menu"
        className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none]"
      >
        {chips.map((chip) => {
          const isActive = chip.sectionId === activeId;
          return (
            <button
              key={chip.id}
              type="button"
              data-chip={chip.sectionId}
              aria-current={isActive ? "true" : undefined}
              onClick={() => jumpTo(chip.sectionId)}
              className={cn(
                "flex min-h-[40px] flex-none items-center whitespace-nowrap rounded-full border px-4 text-[13.5px] transition-colors",
                isActive
                  ? "border-primary bg-primary font-bold text-onPrimary"
                  : "border-piec-ink/20 font-semibold text-piec-ink/85 hover:border-primary hover:text-primary",
              )}
            >
              {chip.name}
            </button>
          );
        })}
      </nav>
    </PiecShell>
  );
}
