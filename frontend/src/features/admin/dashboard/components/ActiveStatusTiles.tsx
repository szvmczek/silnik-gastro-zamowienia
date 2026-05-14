import { Link } from "react-router-dom";
import type { AdminDashboardActiveCounts } from "@/shared/api/orderApi";

interface ActiveStatusTilesProps {
  counts: AdminDashboardActiveCounts;
}

interface Tile {
  label: string;
  value: number;
  to: string;
  statusVar: string;
}

export function ActiveStatusTiles({ counts }: ActiveStatusTilesProps) {
  const tiles: Tile[] = [
    { label: "Nowe", value: counts.new, to: "/admin/kitchen", statusVar: "--status-new" },
    {
      label: "W przygotowaniu",
      value: counts.inPreparation,
      to: "/admin/kitchen",
      statusVar: "--status-prep",
    },
    {
      label: "Do wydania",
      value: counts.readyForPickup,
      to: "/admin/pickup",
      statusVar: "--status-ready",
    },
    {
      label: "Do wysyłki",
      value: counts.readyForDelivery,
      to: "/admin/delivery",
      statusVar: "--status-ready",
    },
    {
      label: "W dostawie",
      value: counts.outForDelivery,
      to: "/admin/delivery",
      statusVar: "--status-out",
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((tile) => (
        <Link
          key={tile.label}
          to={tile.to}
          className="rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-4 transition-colors hover:bg-[rgb(var(--color-bg-section))] focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]"
          style={{
            borderLeft: `3px solid rgb(var(${tile.statusVar}))`,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2 w-2 shrink-0 rounded-full"
              style={{ background: `rgb(var(${tile.statusVar}))` }}
              aria-hidden
            />
            <span className="truncate text-[12px] font-semibold text-[rgb(var(--color-text-body))]">
              {tile.label}
            </span>
          </div>
          <div className="mt-2 font-mono text-[28px] font-semibold leading-none text-[rgb(var(--color-text-primary))]">
            {tile.value}
          </div>
        </Link>
      ))}
    </div>
  );
}
