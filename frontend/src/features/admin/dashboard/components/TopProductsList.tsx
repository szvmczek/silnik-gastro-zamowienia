import type { AdminDashboardTopProductStats } from "@/shared/api/orderApi";

interface TopProductsListProps {
  items: AdminDashboardTopProductStats[];
}

export function TopProductsList({ items }: TopProductsListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))] p-6 text-[14px] text-[rgb(var(--color-text-muted))]">
        Brak danych z ostatnich 30 dni.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[rgb(var(--color-border-card))] bg-[rgb(var(--color-bg-card))]">
      <ul className="divide-y divide-[rgb(var(--color-border-subtle))]">
        {items.map((item, idx) => (
          <li
            key={item.productName}
            className="grid grid-cols-[32px_1fr_90px] items-center gap-3 px-5 py-3 text-[14px]"
          >
            <span className="font-mono text-[13px] text-[rgb(var(--color-text-faint))]">
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span className="truncate text-[rgb(var(--color-text-primary))]">
              {item.productName}
            </span>
            <span className="text-right font-mono text-[13px] font-semibold text-[rgb(var(--color-text-primary))]">
              {item.totalSold}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
