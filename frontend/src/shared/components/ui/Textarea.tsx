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
        "flex w-full rounded-md border bg-white px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary disabled:cursor-not-allowed disabled:opacity-60",
        SIZE_CLASS[size],
        error ? "border-rose-300" : "border-slate-300",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
