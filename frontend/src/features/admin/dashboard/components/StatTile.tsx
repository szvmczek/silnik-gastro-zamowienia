import { cn } from "@/shared/lib/cn";

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  isLoading?: boolean;
}

export function StatTile({ label, value, hint, isLoading = false }: StatTileProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="text-[13px] text-slate-500">{label}</div>
      <div
        className={cn(
          "mt-4 font-mono text-[36px] font-semibold leading-none tracking-tight text-slate-900",
          isLoading && "text-slate-300",
        )}
      >
        {isLoading ? "—" : value}
      </div>
      {hint && <div className="mt-3 text-[12px] text-slate-400">{hint}</div>}
    </div>
  );
}
