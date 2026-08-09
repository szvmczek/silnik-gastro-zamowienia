import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Nagłówek sekcji z paczki: mono kicker w akcencie nad cienką kreską. */
export function SectionHeading({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "pt-9 text-xs font-bold uppercase tracking-[3px] text-primary",
        className,
      )}
    >
      {children}
    </h2>
  );
}
