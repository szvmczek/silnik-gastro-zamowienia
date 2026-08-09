import { forwardRef, type ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/shared/lib/cn";

type Variant = "primary" | "outline" | "disabled";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-xl px-5 text-[15.5px] font-bold transition-[transform,filter,border-color,color] duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-piec-bg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-onPrimary hover:brightness-110 active:scale-[0.97]",
  outline:
    "border-[1.5px] border-piec-ink/30 text-piec-ink/85 hover:border-primary hover:text-primary",
  disabled: "cursor-default bg-primary/20 text-piec-ink/40",
};

interface PiecButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Wysokość w px — paczka używa 44 / 52 / 54 / 56 zależnie od miejsca. */
  height?: number;
  fullWidth?: boolean;
}

/**
 * Przycisk w stylu design v3. Świadomie osobny od shared/ui/Button:
 * tamten obsługuje panel admina (D-08 — nietknięty), a ten maluje się
 * akcentem z ustawień i kontrastowym atramentem (--color-on-primary).
 */
export const PiecButton = forwardRef<HTMLButtonElement, PiecButtonProps>(
  ({ variant = "primary", height = 54, fullWidth, className, type, ...props }, ref) => (
    <button
      ref={ref}
      type={type ?? "button"}
      disabled={variant === "disabled" || props.disabled}
      className={cn(BASE, VARIANTS[variant], fullWidth && "w-full", className)}
      style={{ minHeight: height, ...props.style }}
      {...props}
    />
  ),
);
PiecButton.displayName = "PiecButton";

interface PiecLinkButtonProps {
  to: string;
  variant?: Variant;
  height?: number;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Ten sam wygląd dla nawigacji — shared/ui/Button nie ma `asChild`. */
export function PiecLinkButton({
  to,
  variant = "primary",
  height = 54,
  fullWidth,
  className,
  children,
}: PiecLinkButtonProps) {
  return (
    <Link
      to={to}
      className={cn(BASE, VARIANTS[variant], fullWidth && "w-full", className)}
      style={{ minHeight: height }}
    >
      {children}
    </Link>
  );
}
