import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/cn";

export interface AdminNavItem {
  to: string;
  label: string;
  end?: boolean;
}

interface AdminSidebarProps {
  items: AdminNavItem[];
  onNavClick?: () => void;
  displayName?: string | null;
  userInitials?: string;
  className?: string;
}

export function AdminSidebar({
  items,
  onNavClick,
  displayName,
  userInitials,
  className,
}: AdminSidebarProps) {
  return (
    <aside
      className={cn("flex h-full flex-col bg-white md:border-r md:border-slate-200", className)}
    >
      <div className="border-b border-slate-100 px-5 py-5">
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Panel
        </div>
        <div className="mt-1 truncate text-[15px] font-semibold tracking-tight text-slate-900">
          {displayName ?? "Administrator"}
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavClick}
            className={({ isActive }) =>
              cn(
                "flex h-10 items-center gap-2.5 rounded-md px-3 text-[14px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-slate-600 hover:bg-slate-100"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      {userInitials && displayName && (
        <div className="border-t border-slate-100 p-3">
          <div className="flex h-10 items-center gap-2.5 px-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-600">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-slate-900">
                {displayName}
              </div>
              <div className="truncate text-[11px] text-slate-500">admin</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
