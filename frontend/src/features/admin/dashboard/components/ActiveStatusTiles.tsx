import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { AdminDashboardActiveCounts } from "@/shared/api/orderApi";

interface ActiveStatusTilesProps {
  counts: AdminDashboardActiveCounts;
}

interface Tile {
  label: string;
  value: number;
  to: string;
}

export function ActiveStatusTiles({ counts }: ActiveStatusTilesProps) {
  const tiles: Tile[] = [
    { label: "Nowe", value: counts.new, to: "/admin/kitchen" },
    { label: "W przygotowaniu", value: counts.inPreparation, to: "/admin/kitchen" },
    { label: "Do wydania", value: counts.readyForPickup, to: "/admin/pickup" },
    { label: "Do wysyłki", value: counts.readyForDelivery, to: "/admin/delivery" },
    { label: "W dostawie", value: counts.outForDelivery, to: "/admin/delivery" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map((tile) => (
        <Link
          key={tile.label}
          to={tile.to}
          className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          <div className="flex items-center justify-between text-[12px] text-slate-500">
            <span className="truncate">{tile.label}</span>
            <ChevronRight
              className="h-4 w-4 shrink-0 text-slate-300 transition-colors group-hover:text-slate-400"
              aria-hidden
            />
          </div>
          <div className="mt-2 font-mono text-[28px] font-semibold leading-none text-slate-900">
            {tile.value}
          </div>
        </Link>
      ))}
    </div>
  );
}
