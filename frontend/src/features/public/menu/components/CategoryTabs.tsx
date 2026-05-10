import { useEffect, useRef, useState } from "react";
import { cn } from "@/shared/lib/cn";

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
      {/* Desktop — editorial "Skocz do" index */}
      <nav className="hidden h-14 items-center gap-1 px-6 sm:flex md:px-12">
        <span className="mr-4 font-mono text-[11px] uppercase tracking-[0.18em] text-[rgb(var(--color-text-faint))]">
          Skocz do
        </span>
        {tabs.map((tab, i) => {
          const sectionId = sectionIds[i];
          const isActive = sectionId === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleClick(sectionId)}
              className={cn(
                "group inline-flex h-9 items-baseline gap-2 rounded-md px-3 text-[13px] transition-colors focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
                isActive
                  ? "font-semibold text-[rgb(var(--color-text-primary))]"
                  : "text-[rgb(var(--color-text-muted))] hover:text-[rgb(var(--color-text-primary))]"
              )}
            >
              <span
                className={cn(
                  "font-mono text-[10px] tabular-nums",
                  isActive
                    ? "text-[rgb(var(--color-primary))]"
                    : "text-[rgb(var(--color-text-faint))] group-hover:text-[rgb(var(--color-primary))]"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{tab.name}</span>
              <span className="font-mono text-[10px] tabular-nums text-[rgb(var(--color-text-faint))]">
                / {tab.count}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Mobile — pills row, scrolls horizontally */}
      <nav className="flex h-12 items-center gap-1 overflow-x-auto px-3 scrollbar-none sm:hidden">
        {tabs.map((tab, i) => {
          const sectionId = sectionIds[i];
          const isActive = sectionId === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleClick(sectionId)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-[12px] leading-none transition-colors focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
                isActive
                  ? "bg-[rgb(var(--color-bg-dark))] text-white"
                  : "text-[rgb(var(--color-text-body))]"
              )}
            >
              <span
                className={cn(
                  "font-mono text-[9px] leading-none tabular-nums",
                  isActive ? "text-white/60" : "text-[rgb(var(--color-text-faint))]"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-none">{tab.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
