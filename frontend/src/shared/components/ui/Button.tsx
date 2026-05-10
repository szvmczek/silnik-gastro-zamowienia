import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "icon"
  | "danger"
  | "dangerOutline";
type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:bg-[rgb(var(--color-primary-hover))] active:bg-[rgb(var(--color-primary-hover))] disabled:opacity-60",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60",
  outline:
    "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 disabled:opacity-60",
  ghost:
    "bg-transparent text-[rgb(var(--color-text-primary))] border-[1.5px] border-[rgb(var(--color-border-card))] hover:bg-[rgb(var(--color-bg-section))] hover:border-[rgb(var(--color-border-strong))] disabled:opacity-60",
  icon:
    "bg-transparent text-[rgb(var(--color-text-primary))] hover:bg-[rgb(var(--color-bg-section))] disabled:opacity-60",
  danger:
    "bg-red-600 text-white hover:bg-red-700 disabled:opacity-60",
  dangerOutline:
    "bg-white text-rose-600 border border-rose-200 hover:bg-rose-50 disabled:opacity-60",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  xl: "h-16 px-7 text-[17px] font-semibold",
};

const iconSizes: Record<Size, string> = {
  sm: "h-8 w-8 p-0",
  md: "h-9 w-9 p-0",
  lg: "h-10 w-10 p-0",
  xl: "h-11 w-11 p-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)] disabled:cursor-not-allowed",
        variants[variant],
        variant === "icon" ? iconSizes[size] : sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
