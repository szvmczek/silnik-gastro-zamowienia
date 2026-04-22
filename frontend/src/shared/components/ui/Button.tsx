import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type Variant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "dangerOutline";
type Size = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white hover:brightness-95 active:brightness-90 disabled:opacity-60",
  secondary:
    "bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60",
  outline:
    "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 disabled:opacity-60",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 disabled:opacity-60",
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";
