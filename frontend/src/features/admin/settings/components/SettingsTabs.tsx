import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/cn";

const TABS = [
  { to: "/admin/settings", label: "Ogólne" },
  { to: "/admin/opening-hours", label: "Godziny otwarcia" },
  { to: "/admin/page-content", label: "Treści strony" },
] as const;

export function SettingsTabs() {
  return (
    <nav className="flex items-center gap-1 border-b border-slate-200 -mx-1 overflow-x-auto">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end
          className={({ isActive }) =>
            cn(
              "whitespace-nowrap px-4 py-3 text-[14px] -mb-px border-b-2 transition-colors",
              isActive
                ? "border-primary font-medium text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-900"
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
