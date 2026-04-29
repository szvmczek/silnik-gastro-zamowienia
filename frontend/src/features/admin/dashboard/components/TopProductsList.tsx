import type { AdminDashboardTopProductStats } from "@/shared/api/orderApi";

interface TopProductsListProps {
  items: AdminDashboardTopProductStats[];
}

export function TopProductsList({ items }: TopProductsListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-[14px] text-slate-500 shadow-sm">
        Brak danych z ostatnich 30 dni.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <ul className="divide-y divide-slate-100">
        {items.map((item, idx) => (
          <li
            key={item.productName}
            className="flex items-center justify-between gap-4 px-5 py-3 text-[14px]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="font-mono text-[12px] text-slate-400">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span className="truncate text-slate-900">{item.productName}</span>
            </div>
            <span className="font-mono font-medium text-slate-900">
              {item.totalSold}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
