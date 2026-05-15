import { cn } from "@/shared/lib/cn";
import type { StatusTheme } from "./statusColors";

interface SectionHeaderProps {
  title: string;
  count: number | null;
  theme: StatusTheme;
}

export function SectionHeader({ title, count, theme }: SectionHeaderProps) {
  return (
    <header
      className={cn(
        "mb-4 flex items-center gap-3 rounded-md border border-[rgb(var(--color-border-subtle))] bg-[rgb(var(--color-bg-card))] px-4 py-3.5"
      )}
    >
      <span
        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ background: `rgb(var(${theme.dotVar}))` }}
        aria-hidden
      />
      <h3 className="text-[14px] font-bold tracking-tight text-[rgb(var(--color-text-primary))]">
        {title}
      </h3>
      {count !== null && (
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[12px] font-semibold",
            theme.badgeBg,
            theme.badgeText
          )}
        >
          {count}
        </span>
      )}
    </header>
  );
}
