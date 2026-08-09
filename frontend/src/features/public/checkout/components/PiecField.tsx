import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";
import { cn } from "@/shared/lib/cn";

const CONTROL =
  "w-full rounded-xl border bg-piec-surface2 px-3.5 text-base text-piec-ink outline-none transition-colors focus:border-primary";

export function PiecField({
  label,
  optional,
  error,
  children,
  className,
}: {
  label: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-[11.5px] font-bold uppercase tracking-[1.8px] text-piec-ink/55">
        {label}
        {optional ? (
          <span className="font-semibold normal-case tracking-normal text-piec-ink/35">
            {" "}
            opcjonalnie
          </span>
        ) : null}
      </span>
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-[13px] text-piec-warnSoft">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const PiecInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      CONTROL,
      "h-[50px]",
      invalid ? "border-piec-warn/70" : "border-piec-ink/[0.16]",
      className,
    )}
    {...props}
  />
));
PiecInput.displayName = "PiecInput";

export const PiecTextarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      CONTROL,
      "h-[74px] resize-none py-3 text-[15px]",
      invalid ? "border-piec-warn/70" : "border-piec-ink/[0.16]",
      className,
    )}
    {...props}
  />
));
PiecTextarea.displayName = "PiecTextarea";
