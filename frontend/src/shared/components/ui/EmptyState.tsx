import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center",
        className
      )}
      {...props}
    >
      {icon ? (
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
          {icon}
        </div>
      ) : null}
      <p className="text-[14px] font-semibold text-slate-800">{title}</p>
      {description ? (
        <p className="mt-1 text-[12px] leading-snug text-slate-500">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
