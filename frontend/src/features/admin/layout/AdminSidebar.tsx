import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/cn";
import { Icon, type IconName } from "@/shared/components/ui/Icon";
import { Kicker } from "@/shared/components/typography/Kicker";

export interface AdminNavLink {
  kind: "link";
  to: string;
  label: string;
  end?: boolean;
  icon?: IconName;
  badge?: number;
}

export interface AdminNavSeparator {
  kind: "separator";
}

export interface AdminNavSection {
  kind: "section";
  title: string;
}

export type AdminNavEntry = AdminNavLink | AdminNavSeparator | AdminNavSection;

interface AdminSidebarProps {
  items: AdminNavEntry[];
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
      className={cn(
        "flex h-full flex-col bg-[rgb(var(--color-bg-card))] md:border-r md:border-[rgb(var(--color-border-subtle))]",
        className
      )}
    >
      <div className="border-b border-[rgb(var(--color-border-subtle))] px-5 py-5">
        <Kicker className="block">Panel</Kicker>
        <div className="mt-1 truncate text-[15px] font-semibold tracking-tight text-[rgb(var(--color-text-primary))]">
          {displayName ?? "Administrator"}
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {items.map((item, idx) => {
          if (item.kind === "separator") {
            return (
              <hr
                key={`sep-${idx}`}
                className="my-2 border-[rgb(var(--color-border-subtle))]"
                aria-hidden="true"
              />
            );
          }
          if (item.kind === "section") {
            return (
              <Kicker
                key={`sec-${idx}`}
                className="mb-1 mt-3 block px-3 first:mt-0"
              >
                {item.title}
              </Kicker>
            );
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavClick}
              className={({ isActive }) =>
                cn(
                  "flex h-10 items-center gap-2.5 rounded-md px-3 text-[14px] transition-colors focus:outline-none focus-visible:[box-shadow:var(--shadow-focus)]",
                  isActive
                    ? "bg-[rgb(var(--color-primary-tint))] font-medium text-[rgb(var(--color-primary))]"
                    : "text-[rgb(var(--color-text-body))] hover:bg-[rgb(var(--color-bg-section))] hover:text-[rgb(var(--color-text-primary))]"
                )
              }
            >
              {item.icon && <Icon name={item.icon} size={18} />}
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[rgb(var(--color-primary))] px-1.5 text-[11px] font-semibold text-white">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {userInitials && displayName && (
        <div className="border-t border-[rgb(var(--color-border-subtle))] p-3">
          <div className="flex h-10 items-center gap-2.5 px-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--color-bg-section))] text-[11px] font-semibold text-[rgb(var(--color-text-body))]">
              {userInitials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium text-[rgb(var(--color-text-primary))]">
                {displayName}
              </div>
              <div className="truncate text-[11px] text-[rgb(var(--color-text-muted))]">
                admin
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
