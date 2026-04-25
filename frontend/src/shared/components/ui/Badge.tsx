import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type BadgeVariant =
  | "default"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "muted";

type BadgeSize = "sm" | "lg";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700",
  primary: "bg-primary/10 text-primary",
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  muted: "bg-slate-100 text-slate-500",
};

const sizes: Record<BadgeSize, string> = {
  sm: "px-2.5 py-0.5 text-xs",
  lg: "px-3 py-1 text-[13px]",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "sm", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";
