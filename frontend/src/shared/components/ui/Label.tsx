import { forwardRef } from "react";
import type { LabelHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("mb-1.5 block text-[14px] font-medium text-slate-700", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";
