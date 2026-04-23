import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/cn";

interface KpiTileProps {
  to: string;
  label: string;
  value: number | string;
  isLoading?: boolean;
  accent?: "primary" | "amber" | "sky";
  hint?: string;
}

const accentIcon: Record<NonNullable<KpiTileProps["accent"]>, string> = {
  primary: "bg-primary/10",
  amber: "bg-amber-100",
  sky: "bg-sky-100",
};

const accentDot: Record<NonNullable<KpiTileProps["accent"]>, string> = {
  primary: "bg-primary",
  amber: "bg-amber-500",
  sky: "bg-sky-500",
};

export function KpiTile({
  to,
  label,
  value,
  isLoading = false,
  accent = "primary",
  hint,
}: KpiTileProps) {
  const isHighlighted = accent === "primary";

  return (
    <Link
      to={to}
      className="block rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
    >
      <div
        className={cn(
          "group rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md",
          isHighlighted
            ? "border-primary/30 bg-primary/[0.03]"
            : "border-slate-200"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <span
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md",
                accentIcon[accent]
              )}
              aria-hidden
            >
              <span className={cn("h-2 w-2 rounded-full", accentDot[accent])} />
            </span>
            <span className="truncate">{label}</span>
          </div>
          <ChevronRight
            className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-400"
            aria-hidden
          />
        </div>
        <div
          className={cn(
            "mt-5 font-mono text-[44px] font-semibold leading-none tracking-tight text-slate-900",
            isLoading && "text-slate-300"
          )}
        >
          {isLoading ? "—" : value}
        </div>
        {hint && <div className="mt-3 text-[12px] text-slate-400">{hint}</div>}
      </div>
    </Link>
  );
}
