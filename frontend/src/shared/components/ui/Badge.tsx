import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type BadgeVariant =
  // legacy (G2-G9 konsumenty — backwards compat)
  | "default"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "muted"
  // v2 Confident Local
  | "accent-yellow"
  | "inverse"
  | "soft"
  // v2 status (admin operations) — D-009 muscle memory
  | "status-new"
  | "status-confirmed"
  | "status-prep"
  | "status-ready"
  | "status-out"
  | "status-delivered"
  | "status-cancelled";

type BadgeSize = "sm" | "lg";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

const variants: Record<BadgeVariant, string> = {
  // legacy
  default: "bg-slate-100 text-slate-700",
  primary: "bg-primary/10 text-primary",
  info: "bg-sky-100 text-sky-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-rose-100 text-rose-700",
  muted: "bg-slate-100 text-slate-500",
  // v2 Confident Local
  "accent-yellow":
    "bg-[rgb(var(--color-accent-yellow))] text-[rgb(var(--color-text-primary))]",
  inverse:
    "bg-[rgb(var(--color-bg-dark))] text-[rgb(var(--color-text-on-dark))]",
  soft:
    "bg-[rgb(var(--color-primary-tint))] text-[rgb(var(--color-primary))]",
  // v2 status
  "status-new":
    "bg-[rgb(var(--status-new-tint))] text-[rgb(var(--status-new))] border border-[rgb(var(--status-new))]",
  "status-confirmed":
    "bg-[rgb(var(--status-confirmed-tint))] text-[rgb(var(--status-confirmed))] border border-[rgb(var(--status-confirmed))]",
  "status-prep":
    "bg-[rgb(var(--status-prep-tint))] text-[rgb(var(--status-prep))] border border-[rgb(var(--status-prep))]",
  "status-ready":
    "bg-[rgb(var(--status-ready-tint))] text-[rgb(var(--status-ready))] border border-[rgb(var(--status-ready))]",
  "status-out":
    "bg-[rgb(var(--status-out-tint))] text-[rgb(var(--status-out))] border border-[rgb(var(--status-out))]",
  "status-delivered":
    "bg-[rgb(var(--status-delivered-tint))] text-[rgb(var(--status-delivered))] border border-[rgb(var(--status-delivered))]",
  "status-cancelled":
    "bg-[rgb(var(--status-cancelled-tint))] text-[rgb(var(--status-cancelled))] border border-[rgb(var(--status-cancelled))]",
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
