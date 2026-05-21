import { cn } from "@/shared/lib/cn";
import { Kicker } from "@/shared/components/typography/Kicker";

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  delta?: string;
  deltaPositive?: boolean;
  isLoading?: boolean;
}

export function StatTile({
  label,
  value,
  hint,
  delta,
  deltaPositive,
  isLoading = false,
}: StatTileProps) {
  return (
    <div className="rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-5 md:p-6">
      <Kicker className="block">{label}</Kicker>
      <div className="mt-3 flex flex-wrap items-baseline gap-2.5">
        <span
          className={cn(
            "font-mono text-[34px] font-semibold leading-none tracking-[-0.01em] text-[rgb(var(--color-text-primary))] md:text-[36px]",
            isLoading && "text-[rgb(var(--color-text-faint))]",
          )}
        >
          {isLoading ? "—" : value}
        </span>
        {delta && !isLoading && (
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[12px] font-semibold",
              deltaPositive
                ? "bg-[rgb(var(--status-ready-tint))] text-[rgb(var(--status-ready))]"
                : "bg-[rgb(var(--status-cancelled-tint))] text-[rgb(var(--status-cancelled))]",
            )}
          >
            {deltaPositive ? "↑" : "↓"} {delta}
          </span>
        )}
      </div>
      {hint && (
        <div className="mt-2 text-[13px] text-[rgb(var(--color-text-faint))]">
          {hint}
        </div>
      )}
    </div>
  );
}
