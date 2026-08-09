import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

interface StickyActionBarProps {
  children: ReactNode;
  /** Tekst pomocniczy nad paskiem — np. „Wybierz sos na wierzch". */
  hint?: string | null;
  className?: string;
}

/**
 * Dolny pasek akcji z paczki: fixed, gradient wtapiający się w tło,
 * respektuje safe-area na iPhonie.
 *
 * Każdy ekran korzystający z paska musi zostawić pod treścią zapas
 * wysokości (paczka wstawia tam pusty div) — służy do tego
 * <StickyActionBarSpacer />.
 */
export function StickyActionBar({ children, hint, className }: StickyActionBarProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 px-3.5 pt-2.5",
        "bg-gradient-to-t from-piec-bg from-45% to-transparent",
        className,
      )}
      style={{ paddingBottom: "calc(0.875rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto w-full max-w-[720px]">
        {hint ? (
          <p className="mb-2 text-center text-[13px] font-semibold text-primary">{hint}</p>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function StickyActionBarSpacer({ height = 110 }: { height?: number }) {
  return <div aria-hidden="true" style={{ height }} />;
}
