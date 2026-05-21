import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Menu } from "lucide-react";
import { cn } from "@/shared/lib/cn";
import { useAdminOutletContext } from "./AdminLayout";

export type AdminTopbarLiveStatus = "polling" | "live";

export interface AdminTopbarProps {
  title: ReactNode;
  metadata?: ReactNode;
  actions?: ReactNode;
  liveStatus?: AdminTopbarLiveStatus;
  liveLabel?: string;
  className?: string;
}

function LiveBadge({ status, label }: { status: AdminTopbarLiveStatus; label?: string }) {
  const isLive = status === "live";
  const text = label ?? (isLive ? "Live · połączono" : "Polling 15s");
  return (
    <span
      className="hidden items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold sm:inline-flex"
      style={{
        background: isLive ? "rgb(var(--status-ready-tint))" : "rgb(var(--color-bg-section))",
        color: isLive ? "#065F46" : "rgb(var(--color-text-muted))",
      }}
    >
      <span
        className={cn("inline-block h-1.5 w-1.5 rounded-full", isLive && "motion-safe:animate-pulse")}
        style={{
          background: isLive ? "rgb(var(--status-ready))" : "rgb(var(--color-text-faint))",
        }}
        aria-hidden
      />
      {text}
    </span>
  );
}

export function AdminTopbar({
  title,
  metadata,
  actions,
  liveStatus,
  liveLabel,
  className,
}: AdminTopbarProps) {
  const { topbarSlot, shellActions, openMobileMenu } = useAdminOutletContext();

  if (!topbarSlot) return null;

  const content = (
    <header
      className={cn(
        "sticky top-0 z-30 border-b border-[rgb(var(--color-border-subtle))] bg-[rgb(var(--color-bg-card))]",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between gap-3 px-4 md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={openMobileMenu}
            className="-ml-1 inline-flex h-10 w-10 items-center justify-center rounded-md text-[rgb(var(--color-text-body))] transition-colors hover:bg-[rgb(var(--color-bg-section))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] md:hidden"
            aria-label="Otwórz menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <h1 className="min-w-0 truncate text-[17px] font-bold tracking-tight text-[rgb(var(--color-text-primary))] sm:shrink-0 sm:overflow-visible sm:text-clip md:text-[18px]">
              {title}
            </h1>
            {metadata && (
              <>
                <span
                  aria-hidden
                  className="hidden shrink-0 text-[14px] text-[rgb(var(--color-text-faint))] sm:inline"
                >
                  ·
                </span>
                <span className="hidden min-w-0 truncate text-[13px] text-[rgb(var(--color-text-muted))] sm:inline">
                  {metadata}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          {liveStatus && <LiveBadge status={liveStatus} label={liveLabel} />}
          {actions}
          {shellActions}
        </div>
      </div>
    </header>
  );

  return createPortal(content, topbarSlot);
}
