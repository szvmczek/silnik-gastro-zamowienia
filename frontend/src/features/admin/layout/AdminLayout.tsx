import { Outlet, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "@/shared/auth/useAuth";
import { Button } from "@/shared/components/ui/Button";
import { Sheet, SheetContent } from "@/shared/components/ui/Sheet";
import { useAdminOrderFeed } from "@/features/admin/realtime/useAdminOrderFeed";
import { SoundToggle } from "@/features/admin/realtime/SoundToggle";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { AdminSidebar, type AdminNavEntry } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

// Sekcje wg D-005 + bundle Stage 3 A.Sidebar: Operacyjne / Archiwum
// / Konfiguracja. Pulpit jako pierwszy item Operacyjne.
// Ikony z M-006 Icon set, badge?: number prop ready (wartosci podpieta
// dataflow w Warstwie 4 — patrz M-028 Dashboard summary consumer).
const navItems: AdminNavEntry[] = [
  { kind: "section", title: "Operacyjne" },
  { kind: "link", to: "/admin", label: "Pulpit", end: true, icon: "dashboard" },
  { kind: "link", to: "/admin/kitchen", label: "Kuchnia", icon: "kitchen" },
  { kind: "link", to: "/admin/pickup", label: "Wydanie", icon: "pickup" },
  { kind: "link", to: "/admin/delivery", label: "Dostawa", icon: "delivery" },
  { kind: "separator" },
  { kind: "section", title: "Archiwum" },
  { kind: "link", to: "/admin/orders", label: "Wszystkie zamówienia", icon: "list" },
  { kind: "separator" },
  { kind: "section", title: "Konfiguracja" },
  { kind: "link", to: "/admin/menu", label: "Menu", icon: "menu" },
  { kind: "link", to: "/admin/settings", label: "Ustawienia", icon: "cog" },
  { kind: "link", to: "/admin/opening-hours", label: "Godziny otwarcia", icon: "clock" },
  { kind: "link", to: "/admin/page-content", label: "Treści stron", icon: "note" },
  { kind: "link", to: "/admin/delivery-zones", label: "Strefy dostawy", icon: "zones" },
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
    <div className="min-h-screen bg-[rgb(var(--color-bg-page))]">
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
          className="w-60 border-r border-[rgb(var(--color-border-subtle))] p-0 sm:max-w-none"
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
          location={settings.data?.city ?? undefined}
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
