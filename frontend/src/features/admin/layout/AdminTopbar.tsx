import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface AdminTopbarProps {
  title: string;
  subtitle?: string;
  onMobileMenuToggle: () => void;
  rightSlot?: ReactNode;
  className?: string;
}

export function AdminTopbar({
  title,
  subtitle,
  onMobileMenuToggle,
  rightSlot,
  className,
}: AdminTopbarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-slate-200 bg-white",
        className
      )}
    >
      <div className="flex h-[72px] items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 md:hidden"
            aria-label="Otwórz menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-[20px] font-semibold tracking-tight text-slate-900">
              {title}
            </h1>
            {subtitle && (
              <div className="mt-0.5 truncate text-[12px] text-slate-500">
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
