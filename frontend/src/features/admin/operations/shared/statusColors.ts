import type { OrderStatus } from "@/shared/api/orderApi";

/* D-009 muscle-memory status mapping. Returns the *CSS variable name*
 * (no `var(...)` wrap) per status, plus an `accent` Tailwind class for
 * the card border-left. Components consume via inline `style={{ background:
 * `rgb(var(${theme.dotVar}))` }}` or via the `accent` class. */

export interface StatusTheme {
  /** Section header status dot color CSS var name (e.g. `--status-new`). */
  dotVar: string;
  /** Tailwind class for the card's `border-left-4` color stripe. */
  accent: string;
  /** Section header background (lighter status tint). */
  sectionBg: string;
  /** Count pill background. */
  badgeBg: string;
  /** Count pill text color. */
  badgeText: string;
}

const STATUS_THEME_NEW: StatusTheme = {
  dotVar: "--status-new",
  accent: "border-l-[rgb(var(--status-new))]",
  sectionBg: "bg-[rgb(var(--status-new-tint))]/40",
  badgeBg: "bg-[rgb(var(--status-new-tint))]",
  badgeText: "text-[rgb(var(--status-new))]",
};

const STATUS_THEME_CONFIRMED: StatusTheme = {
  dotVar: "--status-confirmed",
  accent: "border-l-[rgb(var(--status-confirmed))]",
  sectionBg: "bg-[rgb(var(--status-confirmed-tint))]/40",
  badgeBg: "bg-[rgb(var(--status-confirmed-tint))]",
  badgeText: "text-[rgb(var(--status-confirmed))]",
};

const STATUS_THEME_PREP: StatusTheme = {
  dotVar: "--status-prep",
  accent: "border-l-[rgb(var(--status-prep))]",
  sectionBg: "bg-[rgb(var(--status-prep-tint))]/40",
  badgeBg: "bg-[rgb(var(--status-prep-tint))]",
  badgeText: "text-[rgb(var(--status-prep))]",
};

const STATUS_THEME_READY: StatusTheme = {
  dotVar: "--status-ready",
  accent: "border-l-[rgb(var(--status-ready))]",
  sectionBg: "bg-[rgb(var(--status-ready-tint))]/40",
  badgeBg: "bg-[rgb(var(--status-ready-tint))]",
  badgeText: "text-[rgb(var(--status-ready))]",
};

const STATUS_THEME_OUT: StatusTheme = {
  dotVar: "--status-out",
  accent: "border-l-[rgb(var(--status-out))]",
  sectionBg: "bg-[rgb(var(--status-out-tint))]/40",
  badgeBg: "bg-[rgb(var(--status-out-tint))]",
  badgeText: "text-[rgb(var(--status-out))]",
};

export function statusTheme(status: OrderStatus): StatusTheme {
  switch (status) {
    case "NEW":
      return STATUS_THEME_NEW;
    case "CONFIRMED":
      return STATUS_THEME_CONFIRMED;
    case "IN_PREPARATION":
      return STATUS_THEME_PREP;
    case "READY":
      return STATUS_THEME_READY;
    case "OUT_FOR_DELIVERY":
      return STATUS_THEME_OUT;
    default:
      return STATUS_THEME_READY;
  }
}

export type SectionKind =
  | "kitchen-new"
  | "kitchen-prep"
  | "pickup-ready"
  | "delivery-ready"
  | "delivery-out";

export function sectionTheme(kind: SectionKind): StatusTheme {
  switch (kind) {
    case "kitchen-new":
      // AD-023: kuchnia kolumna "Nowe" mieści NEW + CONFIRMED (admin-set z
      // OrderDetail). Wizualnie 1 kolumna z 1 akcentem (status-new amber)
      // — card-level border-left różnicuje CONFIRMED osobno.
      return STATUS_THEME_NEW;
    case "kitchen-prep":
      return STATUS_THEME_PREP;
    case "pickup-ready":
    case "delivery-ready":
      return STATUS_THEME_READY;
    case "delivery-out":
      return STATUS_THEME_OUT;
  }
}
