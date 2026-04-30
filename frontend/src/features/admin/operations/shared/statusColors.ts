import type { OrderStatus } from "@/shared/api/orderApi";

export interface StatusTheme {
  border: string;
  sectionBg: string;
  badgeBg: string;
  badgeText: string;
}

const AMBER: StatusTheme = {
  border: "border-l-amber-500",
  sectionBg: "bg-amber-50/40",
  badgeBg: "bg-amber-100",
  badgeText: "text-amber-800",
};

const BLUE: StatusTheme = {
  border: "border-l-blue-500",
  sectionBg: "bg-blue-50/40",
  badgeBg: "bg-blue-100",
  badgeText: "text-blue-800",
};

const EMERALD: StatusTheme = {
  border: "border-l-emerald-500",
  sectionBg: "bg-emerald-50/40",
  badgeBg: "bg-emerald-100",
  badgeText: "text-emerald-800",
};

const INDIGO: StatusTheme = {
  border: "border-l-indigo-500",
  sectionBg: "bg-indigo-50/40",
  badgeBg: "bg-indigo-100",
  badgeText: "text-indigo-800",
};

export function statusTheme(status: OrderStatus): StatusTheme {
  switch (status) {
    case "NEW":
    case "CONFIRMED":
      return AMBER;
    case "IN_PREPARATION":
      return BLUE;
    case "READY":
      return EMERALD;
    case "OUT_FOR_DELIVERY":
      return INDIGO;
    default:
      return EMERALD;
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
      return AMBER;
    case "kitchen-prep":
      return BLUE;
    case "pickup-ready":
    case "delivery-ready":
      return EMERALD;
    case "delivery-out":
      return INDIGO;
  }
}
