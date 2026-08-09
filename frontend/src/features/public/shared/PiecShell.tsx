import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

/** Szerokości kolumn z paczki — każdy ekran ma swoją. */
const SIZES = {
  /** Landing, menu. */
  wide: "max-w-[1100px]",
  /** Strona produktu. */
  product: "max-w-[760px]",
  /** Koszyk, dosprzedaż. */
  cart: "max-w-[680px]",
  /** Checkout. */
  form: "max-w-[640px]",
  /** Potwierdzenie, tracking. */
  narrow: "max-w-[560px]",
} as const;

export type PiecShellSize = keyof typeof SIZES;

interface PiecShellProps {
  size?: PiecShellSize;
  className?: string;
  children: ReactNode;
}

export function PiecShell({ size = "wide", className, children }: PiecShellProps) {
  return <div className={cn("mx-auto w-full px-5", SIZES[size], className)}>{children}</div>;
}
