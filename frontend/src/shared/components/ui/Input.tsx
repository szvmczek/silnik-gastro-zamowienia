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
        "flex w-full rounded-md border-[1.5px] bg-white px-3 py-2 text-sm placeholder:text-[rgb(var(--color-text-faint))] focus:outline-none focus:border-primary focus-visible:[box-shadow:var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-60",
        SIZE_CLASS[size],
        error
          ? "border-[rgb(var(--status-cancelled))]"
          : "border-[rgb(var(--color-border-card))]",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
