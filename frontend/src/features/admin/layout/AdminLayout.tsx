import { Outlet, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "@/shared/auth/useAuth";
import { Button } from "@/shared/components/ui/Button";
import { Sheet, SheetContent } from "@/shared/components/ui/Sheet";
import { useAdminOrderFeed } from "@/features/admin/realtime/useAdminOrderFeed";
import { SoundToggle } from "@/features/admin/realtime/SoundToggle";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { AdminSidebar, type AdminNavItem } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

const navItems: AdminNavItem[] = [
  { to: "/admin", label: "Pulpit", end: true },
  { to: "/admin/orders", label: "Zamówienia" },
  { to: "/admin/menu", label: "Menu" },
  { to: "/admin/settings", label: "Ustawienia" },
  { to: "/admin/opening-hours", label: "Godziny otwarcia" },
  { to: "/admin/page-content", label: "Treści stron" },
];

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatTodayPl(): string {
  const raw = dateFormatter.format(new Date());
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function computeInitials(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useAdminOrderFeed();

  const settings = usePublicSettings();
  const restaurantName = settings.data?.name ?? "Panel";
  const today = useMemo(formatTodayPl, []);
  const initials = computeInitials(user?.displayName);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:flex md:w-60">
        <AdminSidebar
          items={navItems}
          displayName={user?.displayName ?? null}
          userInitials={initials}
          className="w-full"
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-60 border-r border-slate-200 p-0 sm:max-w-none"
          showClose={false}
        >
          <AdminSidebar
            items={navItems}
            displayName={user?.displayName ?? null}
            userInitials={initials}
            onNavClick={closeMobile}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-col md:pl-60">
        <AdminTopbar
          title={restaurantName}
          subtitle={today}
          onMobileMenuToggle={() => setMobileOpen(true)}
          rightSlot={
            <>
              <SoundToggle />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Wyloguj
              </Button>
            </>
          }
        />
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
