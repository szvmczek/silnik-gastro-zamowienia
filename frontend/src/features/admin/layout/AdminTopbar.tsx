import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { Kicker } from "@/shared/components/typography/Kicker";

interface AdminTopbarProps {
  title: string;
  subtitle?: string;
  location?: string;
  onMobileMenuToggle: () => void;
  rightSlot?: ReactNode;
  className?: string;
}

export function AdminTopbar({
  title,
  subtitle,
  location,
  onMobileMenuToggle,
  rightSlot,
  className,
}: AdminTopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-[rgb(var(--color-border-subtle))] bg-[rgb(var(--color-bg-card))]",
        className
      )}
    >
      <div className="flex h-[72px] items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[rgb(var(--color-text-body))] transition-colors hover:bg-[rgb(var(--color-bg-section))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] md:hidden"
            aria-label="Otwórz menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            {location && <Kicker className="mb-0.5 block">{location}</Kicker>}
            <h1 className="truncate text-[20px] font-semibold tracking-tight text-[rgb(var(--color-text-primary))]">
              {title}
            </h1>
            {subtitle && (
              <div className="mt-0.5 truncate text-[12px] text-[rgb(var(--color-text-muted))]">
                {subtitle}
              </div>
            )}
          </div>
        </div>
        {rightSlot && (
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">{rightSlot}</div>
        )}
      </div>
    </header>
  );
}
