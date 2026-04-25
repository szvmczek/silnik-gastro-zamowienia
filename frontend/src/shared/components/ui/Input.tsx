import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: boolean;
  size?: InputSize;
}

const SIZE_CLASS: Record<InputSize, string> = {
  sm: "h-9",
  md: "h-10",
  lg: "h-11",
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, size = "md", ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        "flex w-full rounded-md border bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60",
        SIZE_CLASS[size],
        error ? "border-rose-300" : "border-slate-300",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
