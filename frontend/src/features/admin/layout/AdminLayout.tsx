import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "@/shared/auth/useAuth";
import { Button } from "@/shared/components/ui/Button";
import { Sheet, SheetContent } from "@/shared/components/ui/Sheet";
import { useAdminOrderFeed } from "@/features/admin/realtime/useAdminOrderFeed";
import { SoundToggle } from "@/features/admin/realtime/SoundToggle";
import { usePublicSettings } from "@/shared/theme/usePublicSettings";
import { AdminSidebar, type AdminNavEntry } from "./AdminSidebar";

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

function computeInitials(name: string | null | undefined): string {
  if (!name) return "";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export interface AdminOutletContextValue {
  topbarSlot: HTMLElement | null;
  shellActions: React.ReactNode;
  openMobileMenu: () => void;
}

export function useAdminOutletContext(): AdminOutletContextValue {
  return useOutletContext<AdminOutletContextValue>();
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topbarSlot, setTopbarSlot] = useState<HTMLElement | null>(null);

  useAdminOrderFeed();

  const settings = usePublicSettings();
  const restaurantName = settings.data?.name ?? "Panel";
  const initials = computeInitials(user?.displayName);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  const closeMobile = () => setMobileOpen(false);
  const openMobileMenu = () => setMobileOpen(true);

  const shellActions = useMemo(
    () => (
      <>
        <SoundToggle />
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Wyloguj
        </Button>
      </>
    ),
    // handleLogout is stable enough; if logout changes, shellActions can be stale —
    // acceptable for this layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const outletValue = useMemo<AdminOutletContextValue>(
    () => ({ topbarSlot, shellActions, openMobileMenu }),
    [topbarSlot, shellActions],
  );

  return (
    <div className="min-h-screen bg-[rgb(var(--color-bg-page))]">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:flex md:w-60">
        <AdminSidebar
          items={navItems}
          displayName={user?.displayName ?? null}
          userInitials={initials}
          brandName={restaurantName}
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
            brandName={restaurantName}
            onNavClick={closeMobile}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-col md:pl-60">
        <div ref={setTopbarSlot} />
        <main className="flex-1 p-4 md:p-8">
          <Outlet context={outletValue} />
        </main>
      </div>
    </div>
  );
}
