import { Link } from "react-router-dom";
import { Card } from "@/shared/components/ui/Card";
import { cn } from "@/shared/lib/cn";

interface KpiTileProps {
  to: string;
  label: string;
  value: number | string;
  isLoading?: boolean;
  accent?: "primary" | "amber" | "sky";
  hint?: string;
}

const accents: Record<NonNullable<KpiTileProps["accent"]>, string> = {
  primary: "text-primary",
  amber: "text-amber-600",
  sky: "text-sky-600",
};

export function KpiTile({
  to,
  label,
  value,
  isLoading = false,
  accent = "primary",
  hint,
}: KpiTileProps) {
  return (
    <Link
      to={to}
      className="block transition-transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
    >
      <Card className="h-full p-6 hover:border-primary">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p
          className={cn(
            "mt-2 text-4xl font-semibold tabular-nums",
            accents[accent],
            isLoading && "text-slate-300"
          )}
        >
          {isLoading ? "—" : value}
        </p>
        {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </Card>
    </Link>
  );
}
