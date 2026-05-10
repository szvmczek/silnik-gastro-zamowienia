import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type TextareaSize = "sm" | "md" | "lg";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  size?: TextareaSize;
}

const SIZE_CLASS: Record<TextareaSize, string> = {
  sm: "min-h-[72px] text-[13px]",
  md: "min-h-[96px] text-sm",
  lg: "min-h-[120px] text-sm",
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, size = "md", ...props }, ref) => (
    <textarea
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        "flex w-full rounded-md border-[1.5px] bg-white px-3 py-2 placeholder:text-[rgb(var(--color-text-faint))] focus:outline-none focus:border-primary focus-visible:[box-shadow:var(--shadow-focus)] disabled:cursor-not-allowed disabled:opacity-60",
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
Textarea.displayName = "Textarea";
