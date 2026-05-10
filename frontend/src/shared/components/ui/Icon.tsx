import type { SVGProps } from "react";
import { cn } from "@/shared/lib/cn";

/* Icon set portowany 1:1 z docs/design/v2-stage3/admin-shared.jsx (A.Icons).
   Stroke 1.7, viewBox 24x24, fill="none", stroke="currentColor".
   Decyzja MIGRATION_PLAN M-006: bundle wprost > lucide-react —
   bundle ma testowane proporcje, lucide-react moze wrocic post-MVP. */

const ICON_PATHS = {
  dashboard: ["M3 13h8V3H3z", "M13 21h8V11h-8z", "M3 21h8v-6H3z", "M13 9h8V3h-8z"],
  kitchen: [
    "M6 3v4M10 3v4M14 3v4M18 3v4",
    "M4 7h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z",
    "M9 15v6",
    "M15 15v6",
  ],
  pickup: [
    "M4 7h16l-1.5 11a2 2 0 0 1-2 1.7H7.5a2 2 0 0 1-2-1.7z",
    "M9 7V5a3 3 0 0 1 6 0v2",
  ],
  delivery: [
    "M3 7h11v9H3z",
    "M14 11h4l3 4v1h-7z",
    "M7 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "M17 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  ],
  list: ["M4 6h16", "M4 12h16", "M4 18h10"],
  menu: ["M4 5h16", "M4 12h16", "M4 19h16"],
  shop: ["M3 9 5 4h14l2 5", "M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9", "M3 9h18", "M9 14h6"],
  zones: ["M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z", "M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  cog: [
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1A2 2 0 1 1 4.3 17l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8L4.2 7A2 2 0 1 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1A2 2 0 1 1 19.7 7l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  ],
  bell: ["M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z", "M10 21a2 2 0 0 0 4 0"],
  bellOff: [
    "M3 3l18 18",
    "M9 4.5A6 6 0 0 1 18 8c0 3 .55 5 1.3 6.3",
    "M5.7 10A6 6 0 0 0 6 12c0 5-3 5-3 5h13",
    "M10 21a2 2 0 0 0 4 0",
  ],
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "M21 21l-4.3-4.3"],
  chevronR: ["M9 6l6 6-6 6"],
  chevronD: ["M6 9l6 6 6-6"],
  chevronL: ["M15 6l-6 6 6 6"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  check: ["M4 12l5 5 11-12"],
  x: ["M5 5l14 14", "M19 5L5 19"],
  edit: ["M4 20h4l11-11-4-4L4 16z", "M14 5l5 5"],
  trash: [
    "M4 7h16",
    "M9 7V4h6v3",
    "M6 7l1 13a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8L18 7",
    "M10 11v7",
    "M14 11v7",
  ],
  drag: ["M9 4h.01M15 4h.01M9 12h.01M15 12h.01M9 20h.01M15 20h.01"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M4 21a8 8 0 0 1 16 0"],
  pin: ["M12 21s7-7 7-12a7 7 0 0 0-14 0c0 5 7 12 7 12z", "M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  phone: [
    "M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.5 2L8 9.6a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2-.5c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.7 2z",
  ],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  note: [
    "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z",
    "M14 3v5h5",
    "M9 13h6",
    "M9 17h4",
  ],
  noteFill: ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z", "M14 3v5h5"],
  motorbike: [
    "M5 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M19 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M8 16l4-9h4l3 3h2",
    "M9 7h4",
  ],
  flame: ["M12 22a7 7 0 0 0 7-7c0-4-3-6-3-10-2 1-4 3-4 6-1-1-1-2-1-4-3 2-6 5-6 9a7 7 0 0 0 7 6z"],
  sparkle: [
    "M12 3v4",
    "M12 17v4",
    "M3 12h4",
    "M17 12h4",
    "M5.6 5.6l2.8 2.8",
    "M15.6 15.6l2.8 2.8",
    "M5.6 18.4l2.8-2.8",
    "M15.6 8.4l2.8-2.8",
  ],
  warning: ["M12 3 2 21h20z", "M12 10v5", "M12 18h.01"],
  signal: ["M5 12a7 7 0 0 1 14 0", "M9 12a3 3 0 0 1 6 0", "M12 12h.01"],
  trend: ["M3 17l6-6 4 4 8-8", "M14 7h7v7"],
  banknote: ["M3 6h18v12H3z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M6 9h.01", "M18 15h.01"],
  printer: [
    "M6 9V3h12v6",
    "M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2",
    "M6 14h12v8H6z",
  ],
  refresh: ["M21 12a9 9 0 1 1-3-6.7L21 8", "M21 3v5h-5"],
  external: [
    "M14 4h6v6",
    "M10 14L21 3",
    "M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6",
  ],
} as const;

export type IconName = keyof typeof ICON_PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name" | "stroke"> {
  name: IconName;
  size?: number;
  stroke?: number;
}

export function Icon({
  name,
  size = 18,
  stroke = 1.7,
  className,
  ...props
}: IconProps) {
  const paths = ICON_PATHS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={name === "drag" ? 2.4 : stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}
