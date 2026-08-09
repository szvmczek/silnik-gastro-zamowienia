import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { cn } from "@/shared/lib/cn";
import { PiecShell, type PiecShellSize } from "./PiecShell";

interface PiecHeaderProps {
  size?: PiecShellSize;
  /** Link powrotu zamiast wordmarku — „← Menu", „← Koszyk", „← Wróć". */
  back?: { to: string; label: string };
  /** Tytuł ekranu obok linku powrotu (Anton, jak w paczce). */
  title?: string;
  /** Prawa strona — zwykle <CartPill />. */
  actions?: ReactNode;
  /** Dodatkowy pas pod głównym rzędem, np. chipsy kategorii w menu. */
  children?: ReactNode;
  className?: string;
}

/**
 * Sticky pasek górny publicznych ekranów. Paczka używa go w dwóch
 * wariantach — z wordmarkiem (menu) albo z linkiem powrotu i tytułem
 * (produkt / koszyk / dosprzedaż / checkout).
 */
export function PiecHeader({
  size = "wide",
  back,
  title,
  actions,
  children,
  className,
}: PiecHeaderProps) {
  const { data: settings } = usePublicSettings();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-piec-ink/10 bg-piec-bg/95 backdrop-blur-md",
        className,
      )}
    >
      <PiecShell size={size} className="flex items-center justify-between gap-3 py-2.5">
        <div className="flex min-w-0 items-center gap-3.5">
          {back ? (
            <Link
              to={back.to}
              className="flex min-h-[44px] items-center whitespace-nowrap text-[14.5px] font-semibold text-piec-ink/85 transition-colors hover:text-primary"
            >
              ← {back.label}
            </Link>
          ) : (
            <Link
              to="/"
              className="flex min-h-[44px] items-center font-display text-xl tracking-[3px]"
            >
              {settings?.name ?? " "}
            </Link>
          )}
          {title ? (
            <span className="truncate font-display text-xl tracking-[2px]">{title}</span>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 items-center">{actions}</div> : null}
      </PiecShell>
      {children}
    </header>
  );
}
