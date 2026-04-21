import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/shared/auth/useAuth";
import { Button } from "@/shared/components/ui/Button";
import { cn } from "@/shared/lib/cn";
import { useAdminOrderFeed } from "@/features/admin/realtime/useAdminOrderFeed";
import { SoundToggle } from "@/features/admin/realtime/SoundToggle";

const navItems = [
  { to: "/admin", label: "Pulpit", end: true },
  { to: "/admin/orders", label: "Zamówienia" },
  { to: "/admin/menu", label: "Menu" },
  { to: "/admin/settings", label: "Ustawienia" },
  { to: "/admin/opening-hours", label: "Godziny otwarcia" },
  { to: "/admin/page-content", label: "Treści stron" },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  useAdminOrderFeed();

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
              aria-label="Przełącz menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="block h-0.5 w-5 bg-current" />
              <span className="mt-1 block h-0.5 w-5 bg-current" />
              <span className="mt-1 block h-0.5 w-5 bg-current" />
            </button>
            <span className="font-semibold text-slate-900">Panel administratora</span>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <span className="hidden text-sm text-slate-600 sm:inline">
                {user.displayName}
              </span>
            )}
            <SoundToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Wyloguj
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl md:gap-6 md:px-6 md:py-6">
        <aside
          className={cn(
            "fixed inset-x-0 top-14 z-10 border-b border-slate-200 bg-white px-4 py-3 md:static md:top-auto md:block md:w-60 md:shrink-0 md:border-0 md:bg-transparent md:px-0 md:py-0",
            mobileOpen ? "block" : "hidden md:block"
          )}
        >
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-4 py-6 md:px-0 md:py-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
