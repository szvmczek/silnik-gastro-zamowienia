import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";
import { getCategoryEmoji } from "../lib/categoryEmoji";

interface Tab {
  id: number;
  slug: string;
  name: string;
  count: number;
}

interface Props {
  tabs: Tab[];
  sectionIds: string[];
}

export function CategoryTabs({ tabs, sectionIds }: Props) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    if (!sectionIds.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionIds]);

  const handleClick = (id: string) => {
    setActiveId(id);
    isScrollingRef.current = true;
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  return (
    <div className="border-y border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-page)/0.95)] backdrop-blur">
      <nav
        aria-label="Kategorie menu"
        className="flex h-14 items-center gap-2 overflow-x-auto px-4 scrollbar-none md:h-16 md:px-12"
      >
        {tabs.map((tab, i) => {
          const sectionId = sectionIds[i];
          const isActive = sectionId === activeId;
          const emoji = getCategoryEmoji(tab.slug);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleClick(sectionId)}
              className={cn(
                "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded px-3.5 text-[13px] font-semibold leading-none transition-colors focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
                isActive
                  ? "border-[1.5px] border-[rgb(var(--color-primary))] bg-[rgb(var(--color-primary-tint))] text-[rgb(var(--color-primary))]"
                  : "border-[1.5px] border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] text-[rgb(var(--color-text-body))] hover:border-[rgb(var(--color-border-strong))] hover:text-[rgb(var(--color-text-primary))]"
              )}
            >
              <span aria-hidden="true" className="leading-none">
                {emoji}
              </span>
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
