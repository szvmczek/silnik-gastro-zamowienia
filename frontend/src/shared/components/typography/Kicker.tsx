import type { HTMLAttributes, ElementType } from "react";
import { cn } from "@/shared/lib/cn";

/* Kicker — editorial label nad naglowkiem.
   Inter/system 600 12px / spacing 0.06em / uppercase / muted color (default).
   Variant accent uzywa primary color zamiast muted.
   Bundle ref: docs/design/v2/patterns.jsx (KickerExample)
   + tokens.css .t-kicker / .t-kicker--accent */

interface KickerProps extends HTMLAttributes<HTMLElement> {
  accent?: boolean;
  as?: ElementType;
}

export function Kicker({
  accent = false,
  as: Component = "span",
  className,
  children,
  ...props
}: KickerProps) {
  return (
    <Component
      className={cn("t-kicker", accent && "t-kicker--accent", className)}
      {...props}
    >
      {children}
    </Component>
  );
}
