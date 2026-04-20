import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";

interface Tab {
  id: number;
  slug: string;
  name: string;
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
      { rootMargin: "-120px 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
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
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
    window.setTimeout(() => {
      isScrollingRef.current = false;
    }, 600);
  };

  return (
    <div className="sticky top-14 z-10 -mx-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:top-16 sm:mx-0 sm:rounded-md sm:border">
      <nav className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
        {tabs.map((tab, i) => {
          const sectionId = sectionIds[i];
          const isActive = sectionId === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleClick(sectionId)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              )}
            >
              {tab.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
